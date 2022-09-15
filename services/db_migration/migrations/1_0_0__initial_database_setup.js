exports.up = function (knex) {
	return (
		knex.schema
			.withSchema('fakeuser_net')
			.dropTableIfExists('adjectives')
			.dropTableIfExists('first_names')
			.dropTableIfExists('first_names_f')
			.dropTableIfExists('first_names_m')
			.dropTableIfExists('genders')
			.dropTableIfExists('last_names')
			.dropTableIfExists('locations')
			.dropTableIfExists('nouns')
			.dropTableIfExists('passwords')
			.dropTableIfExists('street_types')
			.dropTableIfExists('streets')
			.dropTableIfExists('titles')
			
			
			.createTable('adjectives', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('word', 255);
			})
			
			.createTable('first_names', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 255);
				table.integer('gender').notNullable().defaultTo(0);
			})
			
			.createTable('first_names_f', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 255);
				table.integer('gender').notNullable().defaultTo(1);
			})
			
			.createTable('first_names_m', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 255);
				table.integer('gender').notNullable().defaultTo(2);
			})
			
			.createTable('genders', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 20);
			})
			
			.createTable('last_names', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 255);
			})
			
			.createTable('locations', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('zip', 255);
				table.string('city', 255);
				table.string('state', 255);
				table.string('latitude', 255);
				table.string('longitude', 255);
				table.string('timezone', 255);
				table.string('dst', 255);
			})
			
			.createTable('nouns', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('word', 255);
			})
			
			.createTable('passwords', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('password', 200);
			})
			
			.createTable('street_types', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 255);
			})
			
			.createTable('streets', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 255);
			})
			
			.createTable('titles', function (table) {
				table.charset('utf8mb4');
				table.collate('utf8mb4_general_ci');
				table.increments('id').unsigned().notNullable().primary();
				table.string('name', 10);
				table.integer('gender');
			})
	);
};

exports.down = function (knex) {
	//do nothing. end of the road.
	return (
		knex.schema.withSchema('fakeuser_net')
	);
};
