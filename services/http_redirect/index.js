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
var express = require('express');
var http = require('http');
var baseService = require('../_');

//=============================================================================
//
//	SERVICE
//
//=============================================================================

class service extends baseService {
	constructor(config) {
		super(config);

		this.app = express();
		this.server = false;

		return this;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	initialize() {
		let _this = this;
		let settings = super.settings();
		let app = super.app();
		let port = 80;

		this.server = http
			.createServer(app)
			.listen(port)
			.on('error', function (error) {
				if (error.syscall !== 'listen') {
					throw error;
				}

				var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

				console.serviceStatusBox('Service: HTTP Redirect Service', 'OFF');

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
				console.serviceStatusBox('Service: HTTP Redirect Service', 'OFF');
			})
			.on('connection', function () {
				// console.debug('client connecting to http');
			})
			.on('listening', function () {
				var addr = _this.server.address();
				var bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
				// console.debug('Listening on ' + bind);
				console.serviceStatusBox('Service: HTTP Redirect Service', 'ON');
			});

		process.on('SIGINT', () => {
			_this.server.close(function () {
				console.serviceStatusBox('Service: HTTP Redirect Service', 'OFF');
			});
		});

		process.on('SIGTERM', () => {
			_this.server.close(function () {
				console.serviceStatusBox('Service: HTTP Redirect Service', 'OFF');
			});
		});

		// catch all traffic and forward to secure app
		_this.app.use(function (req, res, next) {
			let url = 'https://' + req.hostname + req.originalUrl;
			res.redirect(url);
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
		console.serviceStatusBox('Service: HTTP Redirect Service', 'OFF');
	}
}

module.exports = service;
