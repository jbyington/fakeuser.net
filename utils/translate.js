const axios = require('axios');
const { parse } = require('node-html-parser');
const fs = require('fs');
const path = '../services/gui/build/i18n/src/';
const keys_path = '../services/gui/build/i18n/keys.json';
const dist_path = '../services/gui/build/i18n/dist/';
const key = 'AIzaSyDaeLIlMB2B5yk-NY8u3hX30M3Y1Rmc19s';
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();
const qs = require('querystring');

function Translation() {}

Translation.prototype.from_lang = 'en';
Translation.prototype.map = {};
Translation.prototype.parameter_1 = process.argv[2] || '';
Translation.prototype.parameter_2 = process.argv[3] || '';
Translation.prototype.locales = {
	af: 'Afrikaans',
	ar: 'Arabic',
	az: 'Azerbaijani',
	be: 'Belarusian',
	bg: 'Bulgarian',
	bn: 'Bengali',
	bs: 'Bosnian',
	ca: 'Catalan',
	ceb: 'Cebuano',
	cs: 'Czech',
	cy: 'Welsh',
	da: 'Danish',
	de: 'German',
	el: 'Greek',
	en: 'English',
	eo: 'Esperanto',
	es: 'Spanish',
	et: 'Estonian',
	eu: 'Basque',
	fa: 'Persian',
	fi: 'Finnish',
	fr: 'French',
	ga: 'Irish',
	gl: 'Galician',
	gu: 'Gujarati',
	ha: 'Hausa',
	hi: 'Hindi',
	hmn: 'Hmong',
	hr: 'Croatian',
	ht: 'Haitian Creole',
	hu: 'Hungarian',
	hy: 'Armenian',
	id: 'Indonesian',
	ig: 'Igbo',
	is: 'Icelandic',
	it: 'Italian',
	iw: 'Hebrew',
	ja: 'Japanese',
	jw: 'Javanese',
	ka: 'Georgian',
	kk: 'Kazakh',
	km: 'Khmer',
	kn: 'Kannada',
	ko: 'Korean',
	la: 'Latin',
	lo: 'Lao',
	lt: 'Lithuanian',
	lv: 'Latvian',
	mg: 'Malagasy',
	mi: 'Maori',
	mk: 'Macedonian',
	ml: 'Malayalam',
	mn: 'Mongolian',
	mr: 'Marathi',
	ms: 'Malay',
	mt: 'Maltese',
	my: 'Myanmar (Burmese)',
	ne: 'Nepali',
	nl: 'Dutch',
	no: 'Norwegian',
	ny: 'Chichewa',
	pa: 'Punjabi',
	pl: 'Polish',
	pt: 'Portuguese',
	ro: 'Romanian',
	ru: 'Russian',
	si: 'Sinhala',
	sk: 'Slovak',
	sl: 'Slovenian',
	so: 'Somali',
	sq: 'Albanian',
	sr: 'Serbian',
	st: 'Sesotho',
	su: 'Sundanese',
	sv: 'Swedish',
	sw: 'Swahili',
	ta: 'Tamil',
	te: 'Telugu',
	tg: 'Tajik',
	th: 'Thai',
	tl: 'Filipino',
	tr: 'Turkish',
	uk: 'Ukrainian',
	ur: 'Urdu',
	uz: 'Uzbek',
	vi: 'Vietnamese',
	yi: 'Yiddish',
	yo: 'Yoruba',
	zh: 'Chinese',
	'zh-CN': 'Chinese (Simplified)',
	'zh-TW': 'Chinese (Traditional)',
	zu: 'Zulu',
};

Translation.prototype.init = function () {
	let _this = this;

	switch (_this.parameter_1) {
		case '-h':
		case '--help':
			console.log('translate.js');
			console.log('                    Standard behavor, processes all keys and languages');
			console.log('\ntranslate.js [OPTION]');
			console.log('OPTIONS');
			console.log('--resort         Resorts the data in the files');
			console.log('--keys           Only creates the key files');
			console.log('--languages      Only processes the language files');
			console.log('\ntranslate.js [KEYWORD] [STRING]');
			console.log('                    Adds "[KEYWORD]: [STRING]" to key file, auto translates');

			break;

		case '--resort':
			let orderedList = {};

			let unorderedData = fs.readFileSync(keys_path, 'utf8');
			let unorderedList = JSON.parse(unorderedData);

			Object.keys(unorderedList)
				.sort()
				.forEach(function (key) {
					orderedList[key] = unorderedList[key];
				});

			fs.writeFileSync(keys_path, JSON.stringify(orderedList, '', '	'));
			break;

		case '--keys':
			fs.readFile(keys_path, 'utf8', async function (err, data) {
				if (err) throw err;
				let list = JSON.parse(data);

				for (let item in list) {
					await _this
						.create(item, list[item])
						.then(() => {
							console.debug('Completed');
						})
						.catch((err) => {
							console.debug(err);
						});
				}
			});

			break;

		case '--languages':
			_this
				.createDictionary()
				.then((dictionary) => {
					for (let locale in _this.locales) {
						let locale_dictionary = {};

						for (let keyword in dictionary) {
							locale_dictionary[keyword] = dictionary[keyword][locale];
						}

						fs.writeFile(dist_path + locale + '.json', JSON.stringify(locale_dictionary, null, 2), (err) => {
							if (err) {
								throw err;
							}
							console.debug(`Language file ${locale} created.`);
						});
					}
				})
				.catch((err) => {
					console.debug(err);
				});

			break;

		default:
			_this
				.create(_this.parameter_1, _this.parameter_2)
				.then(() => {
					console.debug('Completed');
				})
				.catch((err) => {
					console.debug(err);
				});
	}
};

Translation.prototype.createDictionary = function () {
	return new Promise(function (resolve, reject) {
		let dictionary = {};
		let files = fs.readdirSync(path);

		for (const file of files) {
			if (file.indexOf('.json') !== -1) {
				let keyword = file.replace('.json', '');

				let data = fs.readFileSync(path + file, 'utf8');
				dictionary[keyword] = JSON.parse(data);
			}
		}

		resolve(dictionary);
	});
};

Translation.prototype.checkFile = function (keyword) {
	return new Promise(function (resolve, reject) {
		if (fs.existsSync(path + keyword + '.json')) {
			reject();
		}
		resolve();
	});
};

Translation.prototype.create = function (keyword, string) {
	let _this = this;

	return new Promise(function (resolve, reject) {
		_this
			.checkFile(keyword)
			.then(() => {
				_this
					.translate_keyword(keyword, string)
					.then((data) => {
						fs.writeFile(path + keyword + '.json', JSON.stringify(data, null, 2), { flag: 'wx' }, (err) => {
							if (err) {
								console.debug(`Keyword file ${keyword} already exists.  Aborting creation.`);
								throw err;
							}
							console.debug(`Keyword file ${keyword} created.`);
							resolve();
						});
					})
					.catch((err) => {
						console.debug('Something went wrong');
						console.debug(path + keyword + '.json');
						reject(err);
					});
			})
			.catch((err) => {
				reject(`File ${keyword} already exists.`);
			});
	});
};

Translation.prototype.getTranslation = function (string, to, from) {
	let _this = this;
	let link = `https://translation.googleapis.com/language/translate/v2`;
	let query = {
		q: string,
		source: from,
		target: to,
		format: 'text',
		key: key,
	};

	return new Promise(function (resolve, reject) {
		if (to == from) {
			resolve(string);
		} else {
			axios
				.post(link, qs.stringify(query), {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				})
				.then((response) => {
					//console.debug(response)
					let root = response.data.data.translations[0];
					let translation = root.translatedText;
					console.debug(string, to, from, translation);
					resolve(translation);
				})
				.catch((err) => {
					console.debug(err);
					reject(err);
				});
		}
	});
};

Translation.prototype.translate_keyword = async function (keyword, string) {
	let _this = this;
	let language_data = {};

	for (let locale in _this.locales) {
		await _this.getTranslation(string, locale, _this.from_lang).then((data) => {
			language_data[locale] = data;
		});
	}

	return language_data;
};

Translation.prototype.dirty_string = function (string) {
	let _this = this;

	for (let item in _this.map) {
		string = string.replace(item, _this.map[item]);
	}

	return string;
};

let translation = new Translation();
translation.init();
