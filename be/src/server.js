require("dotenv").config()

const app = require("./app")
const { ensureBootstrapAdmin } = require("./core/bootstrap/super-admin")

const PORT = process.env.PORT || 8080

app.listen(PORT, async () => {
    console.log("Server running on", PORT)

    await ensureBootstrapAdmin()
})
