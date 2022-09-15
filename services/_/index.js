//#############################################################################
//
//	Base Service Class
//
//#############################################################################

//=============================================================================
//
//	Base
//
//=============================================================================

class baseService {
	constructor(config) {
		if (Object.prototype.hasOwnProperty.call(config, 'app')) {
			this.set_app(config.app);
		} else {
			this.app = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'cron')) {
			this.set_cron(config.cron);
		} else {
			this.cron = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'csrf')) {
			this.set_csrf(config.csrf);
		} else {
			this.csrf = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'express')) {
			this.set_express(config.express);
		} else {
			this.express = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'db')) {
			this.set_db(config.db);
		} else {
			this.db = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'routePath')) {
			this.set_routePath(config.routePath);
		} else {
			this.routePath = '';
		}

		if (Object.prototype.hasOwnProperty.call(config, 'server')) {
			this.set_server(config.server);
		} else {
			this.server = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'settings')) {
			this.set_settings(config.settings);
		} else {
			this.settings = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'wss')) {
			this.set_wss(config.wss);
		} else {
			this.wss = {};
		}

		if (Object.prototype.hasOwnProperty.call(config, 'socket')) {
			this.set_socket(config.socket);
		} else {
			this.socket = {};
		}

		return this;
	}

	//=============================================================================
	//	app
	//=============================================================================

	set_app(app) {
		this.app = app;
		return this;
	}

	get_app() {
		return this.app;
	}

	app() {
		return this.get_app();
	}

	//=============================================================================
	//	Cron
	//=============================================================================

	set_cron(cron) {
		this.cron = cron;
		return this;
	}

	get_cron() {
		return this.cron;
	}

	cron() {
		return this.get_cron();
	}

	//=============================================================================
	//	CSRF
	//=============================================================================

	set_csrf(csrf) {
		this.csrf = csrf;
		return this;
	}

	get_csrf() {
		return this.csrf;
	}

	csrf() {
		return this.get_csrf();
	}

	//=============================================================================
	//	Express
	//=============================================================================

	set_express(express) {
		this.express = express;
		return this;
	}

	get_express() {
		return this.express;
	}

	express() {
		return this.get_express();
	}

	//=============================================================================
	//	db
	//=============================================================================

	set_db(db) {
		this.db = db;
		return this;
	}

	get_db() {
		return this.db;
	}

	db() {
		return this.get_db();
	}

	//=============================================================================
	//	routePath
	//=============================================================================

	set_routePath(routePath) {
		this.routePath = routePath;
		return this;
	}

	get_routePath() {
		return this.routePath;
	}

	routePath() {
		return this.get_routePath();
	}

	//=============================================================================
	//	server
	//=============================================================================

	set_server(server) {
		this.server = server;
		return this;
	}

	get_server() {
		return this.server;
	}

	server() {
		return this.get_server();
	}

	//=============================================================================
	//	settings
	//=============================================================================

	set_settings(settings) {
		this.settings = settings;
		return this;
	}

	get_settings() {
		return this.settings;
	}

	settings() {
		return this.get_settings();
	}

	//=============================================================================
	//	wss (socket wrapper)
	//=============================================================================

	set_wss(wss) {
		this.wss = wss;
		return this;
	}

	get_wss() {
		return this.wss;
	}

	wss() {
		return this.get_wss();
	}

	//=============================================================================
	//	socket
	//=============================================================================

	set_socket(socket) {
		this.socket = socket;
		return this;
	}

	get_socket() {
		return this.socket;
	}

	socket() {
		return this.get_socket();
	}

	//=============================================================================
	//	Test
	//=============================================================================

	test(string) {
		console.debug(string);
		return this;
	}
}

module.exports = baseService;
