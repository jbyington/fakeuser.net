var express = require('express');
var router = express.Router();

var EasyXml = require('easyxml');
 
var xmlSerializer = new EasyXml({
    singularize: true,
    rootElement: 'response',
    dateFormat: 'ISO',
    manifest: true
});

//=============================================================================
//
//	Routes
//
//=============================================================================

/// List

router.get('/', function (req, res, next) {
	// let settings = req.app.locals.services.settings;
	res.render("index.html");
});

router.get('/user/:token(\\d+)', function (req, res, next) {
	console.syslog(`Fake User ${req.params.token} recalled as JSON`);
	
	let db = req.app.locals.services.db.connection;
	let seed = req.params.token;

	db.query(`SELECT '${seed}' as hash,
			(SELECT \`name\` FROM titles WHERE gender = g.id ORDER BY rand('${seed}') LIMIT 1 ) AS title,
			f.\`name\` AS first_name, 
			l.\`name\` AS last_name,
			g.\`name\` AS gender,
			lcase(concat(f.\`name\`, '.', l.\`name\`, a.age, '@example.com')) AS email_address,
			concat(u1.word, u2.word, floor(10+rand('${seed}') * 90)) AS \`username\`,
			concat(w1.word, w2.word, floor(10+rand('${seed}' + 1) * 90)) AS \`password\`,
			date_format(date_sub(date_sub( now(), INTERVAL a.age YEAR), INTERVAL day_salt DAY), '%Y-%m-%d') AS dob,
			concat('555-', floor(100 + rand('${seed}') * 900), '-', floor(1000 + rand('${seed}') * 9000)) AS phone_number,
			concat('555-', floor(100 + rand('${seed}' + 1) * 900), '-', floor(1000 + rand('${seed}' + 1) * 9000)) AS cell_number,
			concat( a.street_number, ' ', s.\`NAME\`, ' ', st.\`NAME\`) AS street,
			lo.city,
			lo.state,
			lo.zip,
			lo.latitude,
			lo.longitude,
			lo.timezone,
			lo.dst
		FROM
			(
				SELECT 
					(SELECT id FROM first_names ORDER BY rand('${seed}') LIMIT 1) AS first_name_id,
					(SELECT id FROM last_names ORDER BY rand('${seed}') LIMIT 1) AS last_name_id,
					(SELECT floor(rand('${seed}') * 50) + 18 AS num FROM DUAL) AS age,
					(SELECT floor(rand('${seed}') * 100) AS num FROM DUAL) AS day_salt,
					(SELECT floor(rand('${seed}') * 10000) AS num FROM DUAL) AS street_number,
					(SELECT id FROM streets ORDER BY rand('${seed}') LIMIT 1) AS street_id,
					(SELECT id FROM street_types ORDER BY rand('${seed}') LIMIT 1) AS street_type_id,
					(SELECT id FROM locations ORDER BY rand('${seed}') LIMIT 1) AS location_id,
					(SELECT id FROM adjectives ORDER BY rand('${seed}') LIMIT 1) AS pw_adjective_id,
					(SELECT id FROM nouns ORDER BY rand('${seed}') LIMIT 1) AS pw_noun_id,
					(SELECT id FROM adjectives ORDER BY rand('${seed}' + 1) LIMIT 1) AS u_adjective_id,
					(SELECT id FROM nouns ORDER BY rand('${seed}' + 1) LIMIT 1) AS u_noun_id
				FROM DUAL
			) a
			JOIN first_names f ON f.id = a.first_name_id
			JOIN last_names l ON l.id = a.last_name_id
			JOIN genders g ON g.id = f.gender
			JOIN streets s ON s.id = a.street_id
			JOIN street_types st ON st.id = a.street_type_id
			JOIN locations lo ON lo.id = a.location_id
			JOIN adjectives w1 ON w1.id = a.pw_adjective_id
			JOIN nouns w2 ON w2.id = a.pw_noun_id
			JOIN adjectives u1 ON u1.id = a.u_adjective_id
			JOIN nouns u2 ON u2.id = a.u_noun_id;`)
	.then( function(result){
		let asXml = xmlSerializer.render(result[0][0]);
		let asJson = JSON.stringify(result[0][0]);

		let record = result[0][0];

		record.asXml = asXml;
		record.asJson = asJson;

		res.render('user.html',record);
	});


});


module.exports = router;
