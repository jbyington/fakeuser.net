//#############################################################################
//
//	DB Model Listener
//
//#############################################################################

//=============================================================================
//
//	Requires
//
//=============================================================================

const { execSync } = require('child_process');
const mariadb = require('../../models/knex-mariadb');
const os = require('os');
var baseService = require('../_');

//=============================================================================
//
//	SERVICE
//
//=============================================================================

class service extends baseService {
	constructor(config) {
		super(config);

		this.connection = false;
		this.models = false;
		this.initialized = false;
		this.command = config.command;
		this.migrateConfig = {
			directory: __dirname + '/migrations',
		};
		this.seedDir = __dirname + '/seeds';

		//use values from the config
		this.set_command(config.command);

		return this;
	}

	//=============================================================================
	//	Are we initialized?
	//=============================================================================

	isInitialized() {
		return this.initialized == true;
	}

	//=============================================================================
	//	Set Command from app.js
	//=============================================================================

	set_command(command) {
		let the_command = false;

		switch (command) {
			case 'latest':
			case 'create':
			case 'recreate':
			case 'destroy':
			case 'seed':
			case 'rollback':
				the_command = command;
				break;

			case true:
				the_command = 'latest';
				break;
			default:
				the_command = '';
				break;
		}

		this.command = the_command;
		return this;
	}

	//=============================================================================
	//	Get Command set from app.js
	//=============================================================================

	get_command() {
		return this.command;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	async initialize() {
		let _this = this;
		let settings = super.settings();

		let command = _this.get_command();

		if (command != '') {
			console.serviceStatusBox('Service: DB Migrate Service', command.toUpperCase());

			_this.connection = await _this.get_connection();

			switch (command) {
				case 'rollback':
					await _this.rollback();
					break;

				case 'create':
					await _this.create(/* migrate = */ false);
					break;

				case 'recreate':
					await _this.destroy(/* recreate = */ true);
					break;

				case 'seedDefaults':
					await _this.seedDefaults();
					break;

				case 'seedMock':
					await _this.seedMock();
					break;

				case 'destroy':
					await _this.destroy();
					break;

				case 'latest':
				case 'migrate':
				default:
					await _this.migrate(/* seedDefaults = */ true);
					break;
			}
		} else {
			console.serviceStatusBox('Service: DB Migrate Service', 'OFF');
		}

		this.initialized = true;
		return this;
	}

	//=============================================================================
	//
	//	Get Connection
	//
	//=============================================================================

	async get_connection() {
		let conf = super.settings().get('mariadb');
		let connection = false;

		try {
			connection = require('knex')({
				client: mariadb,
				connection: {
					host: '127.0.0.1',
					user: conf.user,
					password: conf.pass,
					database: conf.schema,
					port: conf.port,
				},
				pool: {
					min: 2,
					max: 10,
				},
				migrations: {
					tableName: 'knex_migrations',
				},
			});
		} catch (e) {
			process.emitWarning(`Connection to schema '${conf.schema}' could not be established.`);
			process.emitWarning(`Please check 'systemctl status mariadb'`);
			process.emitWarning(`It may be required to run this binary again with --db=create`);
			process.exit(1);
		}

		return connection;
	}

	//=============================================================================
	//
	//	Database Functions
	//
	//=============================================================================

	//=============================================================================
	//	Create
	//=============================================================================

	async create(do_migrate = true) {
		let _this = this;

		let conf = super.settings().get('mariadb');
		let schema = conf.schema;
		let user = conf.user;
		let pass = conf.pass;
		let host = conf.host;

		let mysql = 'mysql';
		if (os.platform() == 'darwin') {
			mysql = '/Applications/MAMP/Library/bin/mysql';
		}

		let commands = [
			`${mysql} -e "CREATE DATABASE IF NOT EXISTS ${schema};"`,
			`${mysql} -e "GRANT ALL PRIVILEGES ON ${schema}.* TO '${user}'@'%' IDENTIFIED BY '${pass}'"`,
			`${mysql} -e "DELETE FROM mysql.user WHERE User='';"`,
			`${mysql} -e "DELETE FROM mysql.user WHERE User='${user}' AND Host='localhost';"`,
			`${mysql} -e "FLUSH PRIVILEGES;"`,
		];

		commands.forEach(function (cmd) {
			execSync(cmd, function (error, stdout, stderr) {
				console.log(cmd);
				if (error) {
					console.syslog('[DB MIGRATION] error', error);
				}
				if (stdout) {
					console.syslog('[DB MIGRATION] stdout', stdout);
				}
				if (stderr) {
					console.syslog('[DB MIGRATION] stderr', stderr);
				}
			});
		}, _this);

		if (do_migrate) {
			_this.migrate(/* alsoSeed = */ true);
		} else {
			process.exit(0);
		}
	}

	//=============================================================================
	//	Destroy
	//=============================================================================

	async destroy(recreate = false) {
		let _this = this;

		let mysql = 'mysql';
		if (os.platform() == 'darwin') {
			mysql = '/Applications/MAMP/Library/bin/mysql';
		}

		let conf = super.settings().get('mariadb');
		let schema = conf.schema;
		let user = conf.user;

		let commands = [`${mysql} -e "DROP DATABASE IF EXISTS ${schema};"`, `${mysql} -e "DROP USER IF EXISTS '${user}'@'%';"`];

		commands.forEach(function (cmd) {
			execSync(cmd, function (error, stdout, stderr) {
				if (error) {
					console.syslog('[DB MIGRATION] error', error);
				}
				if (stdout) {
					console.syslog('[DB MIGRATION] stdout', stdout);
				}
				if (stderr) {
					console.syslog('[DB MIGRATION] stderr', stderr);
				}
			});
		}, _this);

		if (recreate) {
			_this.create(/*migrate = */ false);
		} else {
			process.exit(0);
		}
	}

	//=============================================================================
	//	Seed Defaults
	//=============================================================================

	async seedDefaults() {
		let _this = this;

		let conf = super.settings().get('mariadb');
		let schema = conf.schema;

		let mysql = 'mysql';
		if (os.platform() == 'darwin') {
			mysql = '/Applications/MAMP/Library/bin/mysql';
		}

		let commands = [
			`${mysql} ${schema} < ${this.seedDir}/default.sql`
		];

		commands.forEach(function (cmd) {
			execSync(cmd, function (error, stdout, stderr) {
				console.log(cmd);
				if (error) {
					console.syslog('[DB MIGRATION] error', error);
				}
				if (stdout) {
					console.syslog('[DB MIGRATION] stdout', stdout);
				}
				if (stderr) {
					console.syslog('[DB MIGRATION] stderr', stderr);
				}
			});
		}, _this);


		console.serviceStatusBox('Seeding Completed');

		process.exit(0);
	}

	//=============================================================================
	//	Seed Mock
	//=============================================================================

	async seedMock() {
		let _this = this;
		let settings = super.settings();

		_this.connection.seed
			.run()
			.then(function (data) {
				console.serviceStatusBox('Seeding Completed');
			})
			.catch(function (err) {
				console.serviceStatusBox('Seeding Failed: ' + err);
				process.exit(1);
			});
	}

	//=============================================================================
	//	Migrate
	//=============================================================================

	async migrate(alsoSeed = false) {
		let _this = this;
		let settings = super.settings();

		_this.connection.migrate
			.latest(_this.migrateConfig)
			.then(function (data) {
				console.serviceStatusBox('Migration Completed');
				if (alsoSeed) {
					_this.seedDefaults();
				} else {
					process.exit(0);
				}
			})
			.catch(function (err) {
				console.serviceStatusBox('Migration Failed: ' + err);
				process.emitWarning('Migration Failed', {
					code: 'FAILURE',
					detail: err,
				});
				process.exit(1);
			});
	}

	//=============================================================================
	//	Rollback
	//=============================================================================

	async rollback() {
		let _this = this;
		let settings = super.settings();

		_this.connection.migrate
			.rollback(_this.migrateConfig)
			.then(function (data) {
				console.serviceStatusBox('Migration Rollback Completed');
				process.exit(0);
			})
			.catch(function (err) {
				console.serviceStatusBox('Migration Rollback Failed: ' + err);
				process.emitWarning('Migration Rollback Failed', {
					code: 'FAILURE',
					detail: err,
				});
				process.exit(1);
			});
	}

	//=============================================================================
	//
	//	Terminate Service
	//
	//=============================================================================

	terminate() {
		this.connection.close();
		console.serviceStatusBox('Service: DB Migrate Service', 'OFF');
	}
}

module.exports = service;
