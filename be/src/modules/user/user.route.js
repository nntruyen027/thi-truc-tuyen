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
    if (value === "super_admin") {
        return "super_admin";
    }

    return value === "admin"
        ? "admin"
        : "user"
}

function getWorkspaceScope(req) {
    if (req.user?.role === "super_admin") {
        return {
            role: req.user.role,
            workspaceId: req.query?.workspaceId || req.body?.workspaceId || null,
        };
    }

    return {
        role: req.user?.role,
        workspaceId: req.user?.workspace_id || null,
    };
}

function normalizeRoleForActor(value, actorRole) {
    const nextRole = normalizeRole(value);

    if (nextRole === "super_admin" && actorRole !== "super_admin") {
        return "admin";
    }

    return nextRole;
}

function ensureWorkspaceAssignment(scope, actorRole, nextRole) {
    if (actorRole !== "super_admin") {
        return;
    }

    if (nextRole === "super_admin") {
        return;
    }

    if (!scope.workspaceId) {
        throw "Vui lòng chọn workspace cho tài khoản này.";
    }
}

router.get(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const {search, page, size} = req.query

            const data =
                await query.getUsers(search, page, size, getWorkspaceScope(req))

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

            const scope = getWorkspaceScope(req)
            const nextRole = normalizeRoleForActor(userRole, req.user?.role)

            ensureWorkspaceAssignment(scope, req.user?.role, nextRole)

            if (await query.usernameExists(username, null, scope.workspaceId)) {
                throw `Tài khoản ${username} đã tồn tại.`
            }

            const hash =
                await hashPassword(password)

            const id =
                await query.createUser({
                    username,
                    hoTen,
                    password: hash,
                    workspaceId: scope.workspaceId,
                    donViId: donViId || null,
                    role: nextRole,
                })

            const data =
                await query.getUserById(id, scope)

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
                await query.getUserById(id, getWorkspaceScope(req))

            if (!existing) {
                throw "Không tìm thấy người dùng."
            }

            if (!username || !hoTen) {
                throw "Vui lòng nhập đầy đủ tên đăng nhập và họ tên."
            }

            const scope = getWorkspaceScope(req)
            const nextRole = normalizeRoleForActor(userRole, req.user?.role)

            ensureWorkspaceAssignment(scope, req.user?.role, nextRole)

            if (await query.usernameExists(username, id, scope.workspaceId)) {
                throw `Tài khoản ${username} đã tồn tại.`
            }

            let hash = null

            if (password) {
                hash = await hashPassword(password)
            }

            await query.updateUser({
                id,
                workspaceId: scope.workspaceId,
                username,
                hoTen,
                donViId: donViId || null,
                role: nextRole,
                password: hash,
            })

            const data =
                await query.getUserById(id, scope)

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
                normalizeRoleForActor(req.body?.role, req.user?.role)

            const existing =
                await query.getUserById(id, getWorkspaceScope(req))

            if (!existing) {
                throw "Không tìm thấy người dùng."
            }

            if (req.user?.id === id) {
                if (req.user?.role === "super_admin" && nextRole !== "super_admin") {
                    throw "Không thể tự gỡ quyền super admin của chính mình."
                }

                if (req.user?.role === "admin" && nextRole !== "admin") {
                    throw "Không thể tự gỡ quyền admin của chính mình."
                }
            }

            await query.updateRole(id, nextRole, getWorkspaceScope(req))

            const data =
                await query.getUserById(id, getWorkspaceScope(req))

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
                await query.getUserById(id, getWorkspaceScope(req))

            if (!existing) {
                throw "Không tìm thấy người dùng."
            }

            await query.deleteUser(id, getWorkspaceScope(req))

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
                    hash,
                    getWorkspaceScope(req).workspaceId
                )
            )
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

module.exports = router
