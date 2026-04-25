const router = require("express").Router()

router.use("/auth", require("../domains/auth/auth.route"))
router.use("/workspaces", require("../domains/workspace/workspace.route"))
router.use("/users", require("../domains/user/user.route"))
router.use("/dm-chung", require("../domains/danh-muc/danhmuc.route"))
router.use("/cuoc-thi", require("../domains/cuoc-thi/cuoc_thi.route"))
router.use("/trac-nghiem", require("../domains/trac-nghiem/trac_nghiem.route"))
router.use("/thi", require("../domains/thi/thi.route"))
router.use("/bai-viet", require("../domains/bai-viet/bai_viet.route"))
router.use(
    "/file",
    require("../domains/file/file.route")
);
router.use("/cau-hinh", require("../domains/cau-hinh/cau-hinh.route"))

module.exports = router
