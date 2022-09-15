/* jshint indent: 1 */

module.exports = function( db, Sequelize, Op ) {
	return db.define('languages', {
		id: {
			type: Sequelize.INTEGER(10).UNSIGNED,
			allowNull: true,
			primaryKey: true,
			autoIncrement: true
		},
		abbrev: {
			type: Sequelize.STRING(10),
			allowNull: true
		},
		name: {
			type: Sequelize.STRING(30),
			allowNull: true
		},
		order: {
			type: Sequelize.INTEGER(11),
			allowNull: true
		}
	}, {
		tableName: 'languages'
	});
};
