require("dotenv").config()

const app = require("./app")
const { ensureBootstrapAdmin } = require("./core/bootstrap/super-admin")
const { startMemoryWatch } = require("./core/monitoring/memory-watch");
const { createTelegramService } = require("./integrations/telegram/telegram.service");

const PORT = process.env.PORT || 8080
const telegramService = createTelegramService();

startMemoryWatch();

app.listen(PORT, async () => {
    console.log("Server running on", PORT)

    await ensureBootstrapAdmin()

    try {
        await telegramService.start()
    } catch (error) {
        console.error("[telegram-bot] Failed to start:", error.message || error)
    }
})
