var express = require('express');
var router = express.Router();

//=============================================================================
//
//	Routes
//
//=============================================================================

router.ws('/devices', function (ws, req) {
	let _this = this;
	let db = req.app.locals.services.db;

	ws.room = _this.setRoom(req);

	ws.on('message', function incoming(message) {
		if (message == 'init') {
			db.models.device_refresh.findAll().then(function (res) {
				ws.send(
					JSON.stringify({
						code: 'devices/set',
						ts: Date.now(),
						data: {
							count: res.length,
							data: res,
						},
					})
				);
			});
		}
	});
});

module.exports = router;
