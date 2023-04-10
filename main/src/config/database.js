const pgp = require('pg-promise')();

const connection = {
    user: 'menzou@couponpostgresql12',
    host: 'couponpostgresql12.postgres.database.azure.com',
    database: 'postgres',
    password: '1234567/a',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
}
const db = pgp(connection);
module.exports = db;