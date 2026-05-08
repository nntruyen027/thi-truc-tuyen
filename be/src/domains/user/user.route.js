const router = require("express").Router()

const query = require("./user.query")

const auth = require("../../core/middlewares/auth")
const role = require("../../core/middlewares/role")

const resUtil = require("../../core/utils/response")
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

function resolveAssignedWorkspaceId(scope, nextRole) {
    if (nextRole === "super_admin") {
        return null;
    }

    return scope.workspaceId ? Number(scope.workspaceId) : null;
}

function resolveReadScope(scope, nextRole) {
    if (nextRole === "super_admin") {
        return {
            role: scope?.role,
            workspaceId: null,
        };
    }

    return scope;
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
                diaChiDong1,
                xaPhuong,
                tinhThanh,
                ngheNghiep,
                doiTuong,
                role: userRole,
            } = req.body

            if (!username || !hoTen || !password) {
                throw "Vui lòng nhập đầy đủ tên đăng nhập, họ tên và mật khẩu."
            }

            const scope = getWorkspaceScope(req)
            const nextRole = normalizeRoleForActor(userRole, req.user?.role)
            const assignedWorkspaceId = resolveAssignedWorkspaceId(scope, nextRole)
            const readScope = resolveReadScope(scope, nextRole)

            ensureWorkspaceAssignment(scope, req.user?.role, nextRole)

            if (await query.usernameExists(username, null, assignedWorkspaceId)) {
                throw `Tài khoản ${username} đã tồn tại.`
            }

            const hash =
                await hashPassword(password)

            const id =
                await query.createUser({
                    username,
                    hoTen,
                    password: hash,
                    workspaceId: assignedWorkspaceId,
                    donViId: donViId || null,
                    diaChiDong1: diaChiDong1 || null,
                    xaPhuong: xaPhuong || null,
                    tinhThanh: tinhThanh || null,
                    ngheNghiep: ngheNghiep || null,
                    doiTuong: doiTuong || null,
                    role: nextRole,
                })

            const data =
                await query.getUserById(id, readScope)

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
                diaChiDong1,
                xaPhuong,
                tinhThanh,
                ngheNghiep,
                doiTuong,
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
            const assignedWorkspaceId = resolveAssignedWorkspaceId(scope, nextRole)
            const readScope = resolveReadScope(scope, nextRole)

            ensureWorkspaceAssignment(scope, req.user?.role, nextRole)

            if (await query.usernameExists(username, id, assignedWorkspaceId)) {
                throw `Tài khoản ${username} đã tồn tại.`
            }

            let hash = null

            if (password) {
                hash = await hashPassword(password)
            }

            await query.updateUser({
                id,
                workspaceId: assignedWorkspaceId,
                username,
                hoTen,
                donViId: donViId || null,
                diaChiDong1: diaChiDong1 || null,
                xaPhuong: xaPhuong || null,
                tinhThanh: tinhThanh || null,
                ngheNghiep: ngheNghiep || null,
                doiTuong: doiTuong || null,
                role: nextRole,
                password: hash,
            })

            const data =
                await query.getUserById(id, readScope)

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
            const scope = getWorkspaceScope(req)
            const readScope = resolveReadScope(scope, nextRole)

            const existing =
                await query.getUserById(id, scope)

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

            ensureWorkspaceAssignment(scope, req.user?.role, nextRole)

            await query.updateRole(id, nextRole, scope)

            const data =
                await query.getUserById(id, readScope)

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
            const scope = getWorkspaceScope(req)

            if (req.user?.role === "super_admin" && !scope.workspaceId) {
                throw "Vui lòng chọn workspace khi đặt lại mật khẩu người dùng."
            }

            const hash =
                await hashPassword("Thitructuyen@2026")

            resUtil.ok(
                res,
                await query.updatePassword(
                    username,
                    hash,
                    scope.workspaceId
                )
            )
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

module.exports = router

