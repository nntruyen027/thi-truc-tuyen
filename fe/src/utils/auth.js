import axios from "axios";
import { useAuthStore } from "~/store/auth";

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export async function isTokenValid() {
    const { access,refresh, setAuth, clearAuth } = useAuthStore.getState();

    if (!access) {
        clearAuth();
        return false;
    }

    try {
        const res = await axios.get(
            `localhost:3000/api/auth/me`,
            {
                headers: { Authorization: `Bearer ${access}` }
            }
        );

        setAuth(res.data, access, refresh);
        return true;

    } catch {
        clearAuth();
        return false;
    }
}
