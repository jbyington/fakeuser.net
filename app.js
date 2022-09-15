//╔════════════════════════════════════════════════════════════════════════════╗
//║ FakeUser.net, Version 2                                                    ║
//╠════════════════════════════════════════════════════════════════════════════╣
//║ Version started September 2022                                             ║
//║ Josh Byington                                                              ║
//╚════════════════════════════════════════════════════════════════════════════╝

//══════════════════════════════════════════════════════════════════════════════
// Requires
//══════════════════════════════════════════════════════════════════════════════

var argv = require('yargs').argv;
var console = require('./models/console')(argv);
var execSync = require('child_process').execSync;
var express = require('express');
var expressWs = require('@small-tech/express-ws');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
var instance_date = Date.now();
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var cors = require('cors');
var csurf = require('csurf');
var randomstr = require('crypto-random-string');
var fs = require('fs');

//══════════════════════════════════════════════════════════════════════════════
//	Get contents of package.json
//══════════════════════════════════════════════════════════════════════════════

const packageJson = JSON.parse(fs.readFileSync('./package.json'));

//══════════════════════════════════════════════════════════════════════════════
//	Top Bar
//══════════════════════════════════════════════════════════════════════════════

console.topBar();

//══════════════════════════════════════════════════════════════════════════════
//	Main EXPRESS APP Setup
//══════════════════════════════════════════════════════════════════════════════

var app = express();
app.set('port', 8443);
app.set('version', packageJson.version);
app.set('appRoot', __dirname);
app.set('executable', `${argv.node} ${__filename}`);

app.locals.services = {};

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('log-timestamp')(function () {
	let time_elapsed = Math.floor((parseInt(Date.now()) - parseInt(instance_date)) / 1000);
	let hb = new Date(Date.now());
	let d = hb.getUTCFullYear() + '-' + ('0' + hb.getUTCMonth()).slice(-2) + '-' + ('0' + hb.getUTCDate()).slice(-2) + ' ' + ('0' + hb.getUTCHours()).slice(-2) + ':' + ('0' + hb.getUTCMinutes()).slice(-2) + ':' + ('0' + hb.getUTCSeconds()).slice(-2) + '.' + ('000' + hb.getUTCMilliseconds()).slice(-3);

	return '┃ \x1b[2m' + d + '\x1b[0m ┃ \x1b[37m%s\x1b[0m \x1b[2m[' + time_elapsed + ']\x1b[0m';
});

//══════════════════════════════════════════════════════════════════════════════
//	Title Box
//══════════════════════════════════════════════════════════════════════════════

console.titleBox();

//══════════════════════════════════════════════════════════════════════════════
//	REDIS SESSIONS SET UP
//══════════════════════════════════════════════════════════════════════════════

app.use(
	session({
		secret: randomstr({ length: 64 }), // the ever-changing secret
		store: new redisStore({
			host: 'localhost',
			port: 6379,
			client: redis.createClient(),
			ttl: 86400, //1 day
		}),
		saveUninitialized: false,
		resave: false,
	})
);

//══════════════════════════════════════════════════════════════════════════════
//	Set up CSRF protection
//══════════════════════════════════════════════════════════════════════════════

var csrf = csurf({
	cookie: {
		signed: false,
		secure: true,
		httpOnly: true,
	},
});

app.use(csrf);

app.use(function (req, res, next) {
	var token = req.csrfToken();
	res.header('X-XSRF-TOKEN', token);
	res.locals._csrf = {
		token: token,
		meta_tag: `<meta id="x-xsrf-token" name="X-XSRF-TOKEN" value="${token}" />`,
	};
	next();
});

//══════════════════════════════════════════════════════════════════════════════
//	Set up AppRoot variable to be used by DB replication
//══════════════════════════════════════════════════════════════════════════════

global.appRoot = path.resolve(__dirname);

//══════════════════════════════════════════════════════════════════════════════
//	Require Services
//══════════════════════════════════════════════════════════════════════════════

const settings_service = require('./services/settings');
const db_migration_service = require('./services/db_migration');
const https_service = require('./services/https');
const http_redirect_service = require('./services/http_redirect');
const wss_service = require('./services/wss');
const db_service = require('./services/db');
const gui_service = require('./services/gui');

//══════════════════════════════════════════════════════════════════════════════
//	SETTINGS SERVICE
//══════════════════════════════════════════════════════════════════════════════

const settings = new settings_service({
	app: app,
	routePath: '/api/settings',
});

//══════════════════════════════════════════════════════════════════════════════
//	DB MIGRATION SERVICE
//══════════════════════════════════════════════════════════════════════════════

if (argv.db) {
	const db_migration = new db_migration_service({
		settings: settings,
		command: argv.db,
	}).initialize();
} else {
	//══════════════════════════════════════════════════════════════════════════════
	//	RUN LATEST DB MIGRATIONS
	//══════════════════════════════════════════════════════════════════════════════

	/*
	let db_migration_command = `${app.get('executable')} --db=latest`;
	console.serviceStatusBox('DB Migration: LATEST', 'IN PROGRESS');

	let $out = execSync(db_migration_command, {
		// stdio: 'ignore',
	});

	console.serviceStatusBox('DB Migration: LATEST', 'DONE');
*/
	//══════════════════════════════════════════════════════════════════════════════
	//	HTTP REDIRECT SERVICE
	//══════════════════════════════════════════════════════════════════════════════

	const insecure = new http_redirect_service({
		settings: settings,
	}).initialize();

	//══════════════════════════════════════════════════════════════════════════════
	//	HTTPS SERVICE
	//══════════════════════════════════════════════════════════════════════════════

	const server = new https_service({
		app: app,
		settings: settings,
	}).initialize();

	//══════════════════════════════════════════════════════════════════════════════
	//	WSS SERVICE
	//══════════════════════════════════════════════════════════════════════════════

	//	Apply Express Ws to App
	const expressWsSocket = expressWs(app, server);

	const wss = new wss_service({
		app: app,
		expressWs: expressWsSocket,
		socket: expressWsSocket.getWss(),
		routePath: '',
	}).initialize();

	//══════════════════════════════════════════════════════════════════════════════
	//	DB SERVICE
	//══════════════════════════════════════════════════════════════════════════════

	const db = new db_service({
		app: app,
		wss: wss,
		settings: settings,
		routePath: '/api/db',
	}).initialize();

	//══════════════════════════════════════════════════════════════════════════════
	//	GUI SERVICE
	//══════════════════════════════════════════════════════════════════════════════

	const gui = new gui_service({
		express: express,
		app: app,
		server: server,
		db: db.connection,
		settings: settings,
		routePath: '',
	}).initialize();

	//══════════════════════════════════════════════════════════════════════════════
	//	CATCHALL ROUTES
	//══════════════════════════════════════════════════════════════════════════════

	// catch 404
	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		res.status(err.status || 404);
		res.send({
			status: err.status,
			message: err.message,
			error: err,
		});
	});

	// error handlers
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.send({
			status: err.status,
			message: err.message,
			error: err,
		});
	});

	process.on('SIGINT', () => {
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		process.exit(0);
	});

	module.exports = { app };
} //end db migrations <else>
