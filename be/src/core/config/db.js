require("dotenv").config()

const { Pool } = require("pg")

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS ?? "",
    database: process.env.DB_NAME,
    max: Number(process.env.DB_POOL_MAX || 20),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
    query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 30000),
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 30000),
    keepAlive: true,
})

module.exports = pool
