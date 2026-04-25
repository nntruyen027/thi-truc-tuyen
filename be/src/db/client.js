const { drizzle } = require("drizzle-orm/node-postgres");
const pool = require("../core/config/db");

const db = drizzle(pool);

module.exports = db;

