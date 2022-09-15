//#############################################################################
//
//	Settings Files Listener
//
//#############################################################################

//=============================================================================
//
//	Requires
//
//=============================================================================

var argv = require('yargs').argv;
const fs = require('fs');
const assert = require('assert').strict;
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

		this.path = this.get_path();
		this.file_watcher = null;
		this.content_watcher = null;
		this.config_files = [];
		this.settings = {};
		this.settings_locations = {};
		this.settings_callbacks = {};

		this.check();
		this.initialize();
		this.watch();

		super.app().use(super.routePath(), require('./route'));

		return this;
	}

	//=============================================================================
	//	Determine Path
	//=============================================================================

	get_path() {
		let path = '';

		let appRoot = super.app().get('appRoot');
		this.path = `${appRoot}/etc`;

		return this.path;
	}

	//=============================================================================
	//	Check
	//=============================================================================

	check(silent = false) {
		let _this = this;

		_this.config_files = [
			{
				type: 'dir',
				path: this.get_path(),
			},
			{
				type: 'file',
				path: this.get_path() + '/mariadb.conf',
				template: __dirname + '/templates/mariadb.conf',
			},
			{
				type: 'file',
				path: this.get_path() + '/timezone.conf',
				template: __dirname + '/templates/timezone.conf',
			},
		];

		let results = [];

		_this.config_files.forEach(function (f) {
			if (fs.existsSync(f.path)) {
				if (!silent) {
					results.push(`✓ ${f.path} exists`);
				}
			} else {
				if (!silent) {
					results.push(`➼ Creating ${f.path}`);
				}
				if (f.type == 'dir') {
					fs.mkdirSync(f.path, { recursive: true }, function (err) {
						if (err) {
							if (!silent) {
								results.push(`✗ ${f.path} could not be created: ${err}`);
							}
						} else {
							if (!silent) {
								results.push(`✓ ${f.path} created.`);
							}
						}
					});
				} else if (f.type == 'file') {
					if (Object.prototype.hasOwnProperty.call(f, 'template') && f.template != '') {
						let data = '';
						let read_success = true;
						try {
							data = fs.readFileSync(f.template);
						} catch (err) {
							read_success = false;
							if (!silent) {
								results.push(`✗ Template ${f.template} could not be read: ${err}`);
							}
						}
						if (read_success) {
							let write_success = true;
							try {
								fs.writeFileSync(f.path, data);
							} catch (err) {
								write_success = false;
								if (!silent) {
									results.push(`✗ File ${f.path} could not be written: ${err}`);
								}
							}
							if (write_success) {
								if (!silent) {
									results.push(`✓ File ${f.path} created`);
								}
							}
						}
					} else {
						let write_success = true;
						try {
							fs.writeFileSync(f.path, '{}');
						} catch (err) {
							write_success = false;
							if (!silent) {
								results.push(`✗ File ${f.template} could not be written: ${err}`);
							}
						}
						if (write_success) {
							if (!silent) {
								results.push(`✓ File ${f.path} created as empty`);
							}
						}
					}
				}
			}
		});

		if (!silent) {
			console.serviceStatusBoxFromArray('Service: Settings... Verifying Files', results);
		}
		return this;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	initialize() {
		console.serviceStatusBox('FakeUser v' + super.app().get('version'));
		console.syslog('Starting FakeUser v' + super.app().get('version'));

		let _this = this;

		_this.settings = {};

		let conf_files = fs.readdirSync(this.get_path());

		conf_files.forEach(function (file) {
			let filename = file.match(/^(.*)(\.conf)$/i);
			if (filename !== null) {
				let config_contents = fs.readFileSync(`${_this.get_path()}/${file}`);
				config_contents = JSON.parse(config_contents);
				_this.settings[filename[1]] = config_contents;
				_this.settings_locations[filename[1]] = `${_this.get_path()}/${file}`;
				_this.settings_callbacks[filename[1]] = [];
			}
		});

		console.serviceStatusBox('Service: Config Service', 'ON');

		super.app().locals.services = {
			...super.app().locals.services,
			settings: this,
		};

		return this;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	reinitialize(silent = false) {
		let _this = this;

		let conf_files = fs.readdirSync(this.get_path());

		conf_files.forEach(function (file) {
			let filename = file.match(/^(.*)(\.conf)$/i);
			if (filename !== null) {
				let config_contents = fs.readFileSync(_this.get_path() + '/' + file);
				config_contents = JSON.parse(config_contents);

				if (_this.checkSettingsChanged(filename[1], config_contents)) {
					_this.settings[filename[1]] = config_contents;

					_this.run_watch_callback(filename[1]);

					if (!silent) {
						console.serviceStatusBox('Settings: ' + filename[1], 'UPDATED');
					}
				}
			}
		});

		return this;
	}

	//=============================================================================
	//	Watch
	//=============================================================================

	watch() {
		let _this = this;

		_this.file_watcher = setInterval(function () {
			_this.check(true);
		}, 400);

		_this.content_watcher = setInterval(function () {
			_this.reinitialize(false);
		}, 400);

		return this;
	}

	//=============================================================================
	//	Check if file contents different from settings known
	//=============================================================================

	checkSettingsChanged(filename, contents) {
		try {
			assert.deepStrictEqual(this.settings[filename], contents);
		} catch (err) {
			return true;
		}
		return false;
	}

	//=============================================================================
	//	Register a callback for watched file(s)
	//=============================================================================

	register_watch_callback(path, callback) {
		let _this = this;

		let cbArguments = [...arguments];
		cbArguments = cbArguments.slice(2);

		if (!Object.prototype.hasOwnProperty.call(this.settings_callbacks, path)) {
			this.settings_callbacks[path] = [];
		}

		this.settings_callbacks[path].push({
			callback: callback,
			arguments: cbArguments,
		});

		console.serviceStatusBox2L('Service: Config Service', `Callback registered for "${path}"`, 'ON');

		return this;
	}

	//=============================================================================
	//	Run callbacks for changed file/settings
	//=============================================================================

	run_watch_callback(path) {
		let _this = this;

		_this.settings_callbacks[path].forEach(function (callback) {
			let fn = callback;
			fn.arguments.unshift(_this.settings[path]);
			fn.callback.apply(null, fn.arguments);

			let garbage = fn.arguments.shift();
		});

		return this;
	}

	//=============================================================================
	//	set
	//=============================================================================

	update(key, new_value) {
		let old_value = fs.readFileSync(this.settings_locations[key]);
		old_value = JSON.parse(old_value);

		let merged_data = {};
		for (const i in old_value) {
			merged_data[i] = old_value[i];
		}
		for (const i in new_value) {
			merged_data[i] = new_value[i];
		}

		return this.set(key, JSON.stringify(merged_data));
	}

	set(key, new_value) {
		if (typeof new_value !== 'string') {
			new_value = JSON.stringify(new_value);
		}

		this.settings[key] = new_value;
		try {
			fs.writeFileSync(this.settings_locations[key], new_value);
		} catch (e) {
			return e;
		}
		return true;
	}

	//=============================================================================
	//	get
	//=============================================================================

	get(key) {
		let contents = {};
		try {
			contents = JSON.parse(fs.readFileSync(this.settings_locations[key]));
		} catch (e) {
			return {};
		}
		return contents;
	}

	//=============================================================================
	//	getAll
	//=============================================================================

	getAll() {
		return this.settings;
	}

	//=============================================================================
	//	Test
	//=============================================================================

	test(string) {
		console.debug(string);
		return this;
	}
}

module.exports = service;
