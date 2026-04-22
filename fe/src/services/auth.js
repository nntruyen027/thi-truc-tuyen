import {useAuthStore} from "~/store/auth";
import api from "~/services/api";

/* ================= LOGIN ================= */

export async function login(username, password) {
    try {
        // 1️⃣ Login
        const res = await api.post("/auth/login", {username, password});
        const {access,refresh, user} = res.data;

        if (!access) {
            throw new Error("Không nhận được access!");
        }


        // 4️⃣ cập nhật lại store
        useAuthStore.getState().setAuth({
            access,
            user,
            refresh
        });

        // 5️⃣ lưu localStorage để reload
        if (typeof window !== "undefined") {
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);
            localStorage.setItem("user", JSON.stringify(user));
        }

        return {access, refresh, user};

    } catch (e) {
        // clear nếu login lỗi
        useAuthStore.getState().clearAuth();

        throw new Error(
            e?.response?.data?.message || "Sai tài khoản hoặc mật khẩu"
        );
    }
}

/* ================= GET ME ================= */

export async function getMe() {
    const res = await api.get("/auth/me");
    return res.data.data;
}

export async function dangKy({username, password, repeatPassword, hoTen, donViId}) {
    try {
        const res = await api.post("/auth/register", {username, password, repeatPassword, hoTen, donViId});
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function thayDoiMatKhau({oldPassword,
                                         newPassword,
                                         repeatPass}) {
    try {
        const res = await api.put("/auth/password", {oldPassword,
            newPassword,
            repeatPass});
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function thayDoiThongTinCaNhan({hoTen, donViId}) {
    try {
        const res = await api.put("/auth/profile", {hoTen, donViId});
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}


