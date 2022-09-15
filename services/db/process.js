module.exports = function (db, Sequelize, Op) {
	let models = {
		languages: require('./models/languages')(db, Sequelize, Op),
	};

	//db.models.users.belongsTo(db.models.user_types, { foreignKey: 'user_type_id' });
	//db.models.users.belongsTo(db.models.roles, { foreignKey: 'role_id' });

	return models;
};
