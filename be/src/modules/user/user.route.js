const router = require("express").Router()

const query = require("./user.query")

const auth = require("../../middlewares/auth")
const role = require("../../middlewares/role")

const resUtil = require("../../utils/response")
const bcrypt = require("bcrypt")

async function hashPassword(password) {
    const salt =
        await bcrypt.genSalt(10)

    return bcrypt.hash(password, salt)
}

function normalizeRole(value) {
    return value === "admin"
        ? "admin"
        : "user"
}

router.get(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const {search, page, size} = req.query

            const data =
                await query.getUsers(search, page, size)

            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.post(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const {
                username,
                hoTen,
                password,
                donViId,
                role: userRole,
            } = req.body

            if (!username || !hoTen || !password) {
                throw "Vui lòng nhập đầy đủ tên đăng nhập, họ tên và mật khẩu."
            }

            if (await query.usernameExists(username)) {
                throw `Tài khoản ${username} đã tồn tại.`
            }

            const hash =
                await hashPassword(password)

            const id =
                await query.createUser({
                    username,
                    hoTen,
                    password: hash,
                    donViId: donViId || null,
                    role: normalizeRole(userRole),
                })

            const data =
                await query.getUserById(id)

            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.put(
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = Number(req.params.id)
            const {
                username,
                hoTen,
                donViId,
                role: userRole,
                password,
            } = req.body

            if (!id) {
                throw "Người dùng không hợp lệ."
            }

            const existing =
                await query.getUserById(id)

            if (!existing) {
                throw "Không tìm thấy người dùng."
            }

            if (!username || !hoTen) {
                throw "Vui lòng nhập đầy đủ tên đăng nhập và họ tên."
            }

            if (await query.usernameExists(username, id)) {
                throw `Tài khoản ${username} đã tồn tại.`
            }

            let hash = null

            if (password) {
                hash = await hashPassword(password)
            }

            await query.updateUser({
                id,
                username,
                hoTen,
                donViId: donViId || null,
                role: normalizeRole(userRole),
                password: hash,
            })

            const data =
                await query.getUserById(id)

            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.patch(
    "/:id/role",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = Number(req.params.id)
            const nextRole =
                normalizeRole(req.body?.role)

            const existing =
                await query.getUserById(id)

            if (!existing) {
                throw "Không tìm thấy người dùng."
            }

            if (req.user?.id === id && nextRole !== "admin") {
                throw "Không thể tự gỡ quyền admin của chính mình."
            }

            await query.updateRole(id, nextRole)

            const data =
                await query.getUserById(id)

            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.delete(
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = Number(req.params.id)

            if (req.user?.id === id) {
                throw "Không thể tự xóa tài khoản đang đăng nhập."
            }

            const existing =
                await query.getUserById(id)

            if (!existing) {
                throw "Không tìm thấy người dùng."
            }

            await query.deleteUser(id)

            resUtil.ok(res, true)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.post(
    "/:username/password",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const username = req.params.username
            const hash =
                await hashPassword("Thitructuyen@2026")

            resUtil.ok(
                res,
                await query.updatePassword(
                    username,
                    hash
                )
            )
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

module.exports = router
