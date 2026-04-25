require("dotenv").config()

const app = require("./app/index")

const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log("Server running on", PORT)
})

server.requestTimeout = 10 * 60 * 1000
server.headersTimeout = 10 * 60 * 1000
server.keepAliveTimeout = 65 * 1000
