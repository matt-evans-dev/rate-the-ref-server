const initOptions = {};
const pgp = require('pg-promise')(initOptions);

pgp.pg.defaults.ssl = true;
const db = pgp({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = db;
