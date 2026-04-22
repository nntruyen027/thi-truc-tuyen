const { drizzle } = require("drizzle-orm/node-postgres");
const pool = require("../config/db");

const db = drizzle(pool);

module.exports = db;
