const router = require("express").Router();
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const resUtil = require("../../core/utils/response");
const service = require("./system_analytics.service");

router.get(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const data = await service.getSystemAnalytics();
            resUtil.ok(res, data);
        } catch (err) {
            resUtil.error(res, err);
        }
    }
);

module.exports = router;
