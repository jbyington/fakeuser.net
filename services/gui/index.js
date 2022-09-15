//#############################################################################
//
//	GUI Service
//
//#############################################################################

//=============================================================================
//
//	Requires
//
//=============================================================================

var path = require('path');
var nunjucks = require('nunjucks');
var nunjucksDate = require('nunjucks-date');
var baseService = require('../_');

//=============================================================================
//
//	Create socket server
//
//=============================================================================

class service extends baseService {
	constructor(config) {
		super(config);
		
		this.set_express(config.express);
		this.set_app(config.app);
		this.set_settings(config.settings);
		this.set_routePath(config.routePath);

		return this;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	initialize() {
		
		let _this = this;

		_this.extend_app();

		console.serviceStatusBox('Service: GUI Service', 'ON');

		// super.app().locals.services = {
		// 	...super.app().locals.services,
		// 	gui: this
		// };

		//load in the models
		let routesListeningTo = [];

		function print(path, layer) {
			if (layer.route) {
				layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
			} else if (layer.name === 'router' && layer.handle.stack) {
				layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))));
			} else if (layer.method) {
				routesListeningTo.push({
					method: layer.method.toUpperCase(),
					path: path.concat(split(layer.regexp)).filter(Boolean).join('/'),
				});
			}
		}

		function split(thing) {
			if (typeof thing === 'string') {
				return thing.split('/');
			} else if (thing.fast_slash) {
				return '';
			} else {
				var match = thing
					.toString()
					.replace('\\/?', '')
					.replace('(?=\\/|$)', '$')
					.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);

				return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>';
			}
		}

		super.app()._router.stack.forEach(print.bind(null, []));

		console.serviceStatusBoxFromArray('Route Endpoints', routesListeningTo, function (item) {
			let method = (item.method + ' '.repeat(8)).substring(0, 7);
			return `${method} /${item.path}`;
		});

		return this;
	}

	//=============================================================================
	//
	//	Terminate Service
	//
	//=============================================================================

	terminate() {
		// this.connection.close();
		console.serviceStatusBox('Service: GUI Service', 'OFF');
	}

	//=============================================================================
	//	Extend App
	//=============================================================================

	extend_app() {
		let _this = this;

		//	Where is the Public Directory?
		super.app().use(super.express().static(path.join(__dirname, '/public')));

		//	Where are the routes?
		super.app().use(super.routePath(), require('./route'));

		//	Where are the views?
		super.app().set('views', path.join(__dirname, '/views'));

		//	What is the view engine?
		super.app().set('view engine', 'html');

		//	Configure view engine
		var env = nunjucks.configure(super.app().get('views'), {
			autoescape: true,
			express: super.app(),
		});

		//	Custom Filters
		env.addFilter('startsWith', function (haystack, needle) {
			return haystack.startsWith(needle);
		});

		env.addFilter('endsWith', function (haystack, needle) {
			return haystack.endsWith(needle);
		});

		// Date Formatting
		nunjucksDate.setDefaultFormat('YYYY-MM-DD h:mm:ss');
		nunjucksDate.install(env, 'date');
	}
}

module.exports = service;
