const router = require("express").Router()

router.use("/auth", require("../modules/auth/auth.route"))
router.use("/users", require("../modules/user/user.route"))
router.use("/dm-chung", require("../modules/danh-muc/danhmuc.route"))
router.use("/cuoc-thi", require("../modules/cuoc-thi/cuoc_thi.route"))
router.use("/trac-nghiem", require("../modules/trac-nghiem/trac_nghiem.route"))
router.use("/thi", require("../modules/thi/thi.route"))
router.use("/bai-viet", require("../modules/bai-viet/bai_viet.route"))
router.use(
    "/file",
    require("../modules/file/file.route")
);
router.use("/cau-hinh", require("../modules/cau-hinh/cau-hinh.route"))

module.exports = router
