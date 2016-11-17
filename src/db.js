const db = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE,

});

const tables = db.schema.createTableIfNotExists('libs', table  => {
    table.increments();
    table.jsonb('raw').notNullable();
    table.string('github').notNullable();
    table.bigInteger('time_alive');
    table.integer('stars');
    table.timestamps(true, true);
});

module.exports = tables.then(() => db);