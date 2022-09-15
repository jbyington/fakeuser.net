//#############################################################################
//
//	HTTPS Service
//
//#############################################################################

//=============================================================================
//
//	Requires
//
//=============================================================================

var fs = require('fs');
var debug = require('debug')('framework:www');
var https = require('https');
var baseService = require('../_');

//=============================================================================
//
//	SERVICE
//
//=============================================================================

class service extends baseService {
	constructor(config) {
		super(config);

		// this.app = false;
		// this.settings = false;

		// // use values from the config
		// this.set_app(config.app);
		// this.set_settings(config.settings);

		if (super.settings().https == undefined) {
			this.key = `${super.app().get('appRoot')}/etc/cert/default.key`;
			this.cert = `${super.app().get('appRoot')}/etc/cert/default.crt`;
		} else {
			this.key = super.settings().https.key;
			this.cert = super.settings().https.cert;
		}

		this.server = false;

		this.credentials = {
			key: fs.readFileSync(this.key),
			cert: fs.readFileSync(this.cert),
		};

		return this;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	initialize() {
		let _this = this;
		let app = super.app();
		let settings = super.settings();
		let $S = this.$S;
		let port = super.app().get('port');

		this.server = https
			.createServer(_this.credentials, app)
			.listen(port)
			.on('error', function (error) {
				if (error.syscall !== 'listen') {
					throw error;
				}

				var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

				console.serviceStatusBox('Service: HTTPS Service', 'OFF');

				// handle specific listen errors with friendly messages
				switch (error.code) {
					case 'EACCES':
						console.error(bind + ' requires elevated privileges');
						process.exit(1);
						break;
					case 'EADDRINUSE':
						console.error(bind + ' is already in use');
						process.exit(1);
						break;
					default:
						throw error;
				}
			})
			.on('close', function () {
				console.serviceStatusBox('Service: HTTPS Service', 'OFF');
			})
			.on('connection', function () {
				// console.debug('client connecting to https');
			})
			.on('listening', function () {
				var addr = _this.server.address();
				var bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
				// console.debug('Listening on ' + bind);
				console.serviceStatusBox('Service: HTTPS Service', 'ON');
			});

		process.on('SIGINT', () => {
			_this.server.close(function () {
				console.serviceStatusBox('Service: HTTPS Service', 'OFF');
			});
		});

		process.on('SIGTERM', () => {
			_this.server.close(function () {
				console.serviceStatusBox('Service: HTTPS Service', 'OFF');
			});
		});

		return this.server;
	}

	//=============================================================================
	//
	//	Terminate Service
	//
	//=============================================================================

	terminate() {
		this.server.close();
		console.serviceStatusBox('Service: HTTPS Service', 'OFF');
	}
}

module.exports = service;
