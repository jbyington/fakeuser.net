var express = require('express');
var router = express.Router();

let clients = [];
let watchRegistered = false;

//=============================================================================
//
//	Routes
//
//=============================================================================

router.ws('/settings', function (ws, req) {
	let _this = this;

	let settings = req.app.locals.services.settings;

	ws.room = _this.setRoom(req);

	if (!watchRegistered) {
		register_watches(this, req);
	}

	ws.on('message', function incoming(message) {
		if (message == 'init') {
			ws.send(
				JSON.stringify({
					code: 'settings/set',
					ts: Date.now(),
					data: {
						timezone: settings.get('timezone'),
					},
				})
			);
		}
	});
});

function register_watches(_this, req) {
	let settings = req.app.locals.services.settings;

	let watch_response = function (key, setting) {
		_this.broadcast(
			{
				room: _this.setRoom(req),
				readyState: 1,
			},
			JSON.stringify({
				code: 'settings/update',
				ts: Date.now(),
				data: { [key]: setting },
			})
		);
	};

	settings.register_watch_callback('timezone', function (setting) {
		watch_response('timezone', setting);
	});

	watchRegistered = true;
}

module.exports = router;
