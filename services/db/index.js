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

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const process = require('./process');
const execSync = require('child_process').execSync;
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
		this.Sequelize = Sequelize;
		this.Op = this.Sequelize.Op;

		this.route = require('./route')(this);

		return this;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	initialize() {
		let _this = this;

		let settings = super.settings();
		let conf = super.settings().get('mariadb');

		_this.connection = new Sequelize(conf.schema, conf.user, conf.pass, {
			host: conf.host,
			dialect: 'mariadb',
			dialectOptions: {
				timezone: 'Etc/UTC',
				useUTC: true,
			},
			port: conf.port,
			pool: {
				min: 0,
				max: 2,
				idle: 10000,
			},
			define: {
				timestamps: false,
			},
			benchmark: false,
			logging: false,
		});

		_this.connection
			.authenticate()
			.then(function () {
				console.serviceStatusBox('Service: DB Service', 'ON');
				let loadModels = true;
			})
			.catch(function (err) {
				console.serviceStatusBox('Service: DB Service', 'OFF');
				console.error('[DB SERV] Error:', err);
			})
			.finally(function () {
				// this.connection.close();
			});

		//load in the models
		let models = process(_this.connection, Sequelize, Op);

		super.app().locals.services = {
			...super.app().locals.services,
			db: {
				connection: _this.connection,
				models: models,
				Sequelize: _this.Sequelize,
				Op: _this.Op,
			},
		};

		return this;
	}

	//=============================================================================
	//
	//	Terminate Service
	//
	//=============================================================================

	terminate() {
		this.connection.close();
		console.serviceStatusBox('Service: DB Service', 'OFF');
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	test(id) {
		this.connection
			.model('devices')
			.findByPk(id)
			.then(function (res) {
				console.dir(res);
			});
	}
}

module.exports = service;
