require("dotenv").config();

module.exports = {
    dialect: "postgresql",
    schema: "./src/db/schema/**/*.js",
    out: "./drizzle",
    dbCredentials: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    },
};
