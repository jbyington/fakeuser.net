/* eslint-disable no-global-assign */
//══════════════════════════════════════════════════════════════════════════════
//	Yargs be a library fer hearties tryin' ter parse optstrings
//══════════════════════════════════════════════════════════════════════════════

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const bunyan = require('bunyan');
const bsyslog = require('bunyan-syslog');
let logger = false;
const reset = '\x1b[0m';
const dim = '\x1b[2m';
const black = '\x1b[30m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const magenta = '\x1b[35m';
const cyan = '\x1b[36m';
const white = '\x1b[37m';

module.exports = function (argv) {
	//=============================================================================
	//	syslog
	//=============================================================================

	logger = bunyan.createLogger({
		name: 'fakeuser',
		streams: [
			{
				level: 'info',
				type: 'raw',
				stream: bsyslog.createBunyanStream({
					type: 'sys',
					facility: bsyslog.local0,
					host: '127.0.0.1',
					port: 514,
				}),
			},
		],
	});

	function syslog(message, level = 'info') {
		let info_message = `${cyan}[SYSLOG] ${message}${reset}`;
		let warn_message = `${yellow}[SYSLOG] ${message}${reset}`;
		let error_message = `${red}[SYSLOG] ${message}${reset}`;
		let debug_message = `${dim}[SYSLOG] ${message}${reset}`;

		switch (level.toLowerCase()) {
			case 'trace':
				console.debug(debug_message);
				logger.trace(message);
				break;
			case 'debug':
				console.debug(debug_message);
				logger.debug(message);
				break;
			case 'info':
				console.info(info_message);
				logger.info(message);
				break;
			case 'warn':
				console.warn(warn_message);
				logger.warn(message);
				break;
			case 'error':
				console.err(error_message);
				logger.error(message);
				break;
			case 'fatal':
				console.err(error_message);
				logger.fatal(message);
				break;
			default:
				break;
		}
	}

	if (!argv.console) {
		return (console = {
			log: function () {},
			err: function () {},
			dir: function () {},
			info: function () {},
			warn: function () {},
			error: function () {},
			debug: function () {},
			table: function () {},
			serviceStatusBox: function () {},
			serviceStatusBox2L: function () {},
			serviceStatusBoxFromArray: function () {},
			syslog: function (message, level) {
				syslog(message, level);
			},
			topBar: function () {},
			titleBox: function () {},
		});
	} else {

		//=============================================================================
		//	serviceStatusBox
		//=============================================================================

		console.syslog = function (message, level) {
			syslog(message, level);
		};

		console.serviceStatusBox = function (message, status) {
			let padding_length = 76;
			let display_status = '';

			status = status || '';

			if (status.length != 0) {
				if (status == 'ON') {
					display_status = '[\x1b[92m ON \x1b[0m]';
				} else if (status == 'OFF') {
					display_status = '[\x1b[91m OFF \x1b[0m]';
				} else {
					display_status = '[ ' + status + ' ]';
				}

				padding_length = padding_length - (status.length + 4);
			} else {
				padding_length = padding_length - status.length;
			}

			message = message + ' '.repeat(80);
			message = message.substring(0, padding_length);
			message = message + display_status;

			console.log('\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
			console.log('\x1b[0m┃ ' + message + ' ┃');
			console.log('\x1b[0m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
		};

		console.serviceStatusBox2L = function (message1, message2, status) {
			let padding_length = 76;
			let display_status = '';

			status = status || '';

			if (status.length != 0) {
				if (status == 'ON') {
					display_status = '[\x1b[92m ON \x1b[0m]';
				} else if (status == 'OFF') {
					display_status = '[\x1b[91m OFF \x1b[0m]';
				} else {
					display_status = '[ ' + status + ' ]';
				}

				padding_length = padding_length - (status.length + 4);
			} else {
				padding_length = padding_length - status.length;
			}

			message1 = message1 + ' '.repeat(80);
			message1 = message1.substring(0, padding_length);
			message1 = message1 + display_status;

			message2 = message2 + ' '.repeat(80);
			message2 = message2.substring(0, 76);

			console.log('\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
			console.log('\x1b[0m┃ ' + message1 + ' ┃');
			console.log('\x1b[0m┃ ' + message2 + ' ┃');
			console.log('\x1b[0m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
		};

		//=============================================================================
		//	JSON Box
		//=============================================================================

		console.serviceStatusBoxFromArray = function (title, itemArray, fnFormat = null) {
			let _this = this;

			if (itemArray.length > 0) {
				console.log('\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
				console.log(('\x1b[0m┃ ' + title + ' '.repeat(100)).substring(0, 83) + '┃');
				console.log('\x1b[0m┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫');

				itemArray.forEach(function (item) {
					if (fnFormat !== null) {
						item = fnFormat(item);
					}
					console.log(('\x1b[0m┃ ' + item + ' '.repeat(100)).substring(0, 83) + '┃');
				});

				console.log('\x1b[0m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
			} else {
				console.log('\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
				console.log(('\x1b[0m┃ ' + title + ' '.repeat(100)).substring(0, 83) + '┃');
				console.log('\x1b[0m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
			}

			return this;
		};

		//=============================================================================
		//	topBar
		//=============================================================================

		console.topBar = function () {
			console.log('\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━┓');
			console.log('\x1b[0m┃╌╌╌╌╌╌╌ Timestamp ╌╌╌╌╌╌╌┃╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ Messages ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┃╌ Sec ╌┃');
			console.log('\x1b[0m┣━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━┛');
		};

		//=============================================================================
		//	titleBox
		//=============================================================================

		console.titleBox = function () {
			console.log('\x1b[0m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
			console.log('\x1b[0m┃                                                                             \x1b[0m ┃');
			console.log('\x1b[0m┃\x1b[91m           █  ████  █████ █   █ █ ██    █  █████  █████  ████  ██    █       \x1b[0m ┃');
			console.log('\x1b[0m┃\x1b[92m           █ █    █ █     █   █ █ ███   █ █         █   █    █ ███   █       \x1b[0m ┃');
			console.log('\x1b[0m┃\x1b[93m           █ █    █ █████ █████ █ █ ██  █ █   ███   █   █    █ █ ██  █       \x1b[0m ┃');
			console.log('\x1b[0m┃\x1b[94m      ██   █ █    █     █ █   █ █ █  ██ █ █     █   █   █    █ █  ██ █       \x1b[0m ┃');
			console.log('\x1b[0m┃\x1b[95m        ████  ████  █████ █   █ █ █   ███  █████    █    ████  █   ███       \x1b[0m ┃');
			console.log('\x1b[0m┃                                                                             \x1b[0m ┃');
			console.log('\x1b[0m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
		};

		return console;
	}
};


