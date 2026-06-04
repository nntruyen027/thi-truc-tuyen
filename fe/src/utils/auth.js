import axios from "axios";
import { useAuthStore } from "~/store/auth";
import { API_BASE_URL } from "~/config/env";

export const PUBLIC_ROUTES = [
    "/",
    "/demo1",
    "/demo2",
    "/demo3",
    "/demo4",
    "/login",
    "/dang-ky",
    "/quen-mat-khau",
];

export function isPublicPath(pathname) {
    return PUBLIC_ROUTES.includes(pathname);
}

function decodeJwtPayload(token) {
    const payload = token?.split(".")?.[1];

    if (!payload) {
        return null;
    }

    const normalizedPayload =
        payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const paddedPayload =
        normalizedPayload.padEnd(
            normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
            "="
        );

    return JSON.parse(atob(paddedPayload));
}

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = decodeJwtPayload(token);

        if (!payload?.exp) {
            return true;
        }

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

    if (isTokenExpired(access)) {
        clearAuth();
        return false;
    }

    try {
        const res = await axios.get(
            `${API_BASE_URL}/auth/me`,
            {
                headers: { Authorization: `Bearer ${access}` }
            }
        );

        setAuth({
            user: res.data.data,
            access,
            refresh
        });
        return true;

    } catch {
        clearAuth();
        return false;
    }
}
