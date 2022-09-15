const Client_MySQL = require('knex/lib/dialects/mysql/index');

class Client_MariaDB extends Client_MySQL {
	constructor(...args) {
		super(...args);
		this.driverName = 'mariadb';
	}

	_driver() {
		return require('mariadb/callback');
	}

	validateConnection(connection) {
		return connection.isValid();
	}
}

module.exports = Client_MariaDB;
