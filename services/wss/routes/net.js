var express = require('express');
var router = express.Router();

let callbackEstablished = false;

//=============================================================================
//
//	Routes
//
//=============================================================================

router.ws('/net', function (ws, req) {
	let _this = this;

	ws.room = _this.setRoom(req);

	ws.on('message', function incoming(message) {
		if (message == 'init') {
			// console.log(`Client subscribed to /net`);
		}
	});
});

module.exports = router;
