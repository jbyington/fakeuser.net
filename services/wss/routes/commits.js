var express = require('express');
var router = express.Router();

let clients = [];
let watchRegistered = false;

//=============================================================================
//
//	Routes
//
//=============================================================================

router.ws('/commits', function (ws, req) {
	let _this = this;

	ws.room = _this.setRoom(req);

	// if (!watchRegistered) {
	// 	register_watches(this, req);
	// }

	ws.on('message', function incoming(message) {
		if (message == 'init') {
			ws.send(
				JSON.stringify({
					code: 'commits/set',
					ts: Date.now(),
					data: {
						status: false,
					},
				})
			);
		}
	});
});

// function register_watches(_this, req) {
	
// 	let db = req.app.locals.services.db;
	
// 	let connections = db.models.device_connections;
// 	let properties = db.models.device_connections_properties;

// 	let watch_response = function (key, setting) {
// 		_this.broadcast(
// 			{
// 				room: _this.setRoom(req),
// 				readyState: 1,
// 			},
// 			JSON.stringify({
// 				code: 'settings/update',
// 				ts: Date.now(),
// 				data: { [key]: setting },
// 			})
// 		);
// 	};

// 	settings.register_watch_callback('admin_network_settings', function (setting) {
// 		watch_response('admin_network_settings', setting);
// 	});

// }

module.exports = router;
