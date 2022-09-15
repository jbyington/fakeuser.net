var express = require('express');
var router = express.Router();

//=============================================================================
//
//	Routes
//
//=============================================================================

/// List
router.post('/', function (req, res, next) {
	let settings = req.app.locals.services.settings;
	let key = req.body.key;
	let values = settings.get(key);
	res.json(values);
});

/// Generic Update
router.post('/update', function (req, res, next) {
	let settings = req.app.locals.services.settings;
	let status = settings.set(req.body.key, req.body.data);
	let values = settings.get(req.body.key);
	res.json(values);
});

module.exports = router;
