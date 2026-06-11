require("dotenv").config()

const app = require("./app")
const { ensureBootstrapAdmin } = require("./core/bootstrap/super-admin")
const { startMemoryWatch } = require("./core/monitoring/memory-watch");

const PORT = process.env.PORT || 8080

startMemoryWatch();

app.listen(PORT, async () => {
    console.log("Server running on", PORT)

    await ensureBootstrapAdmin()
})
