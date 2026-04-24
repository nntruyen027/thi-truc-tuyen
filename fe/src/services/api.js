import axios from "axios";
import { useAuthStore } from "~/store/auth";
import { API_BASE_URL } from "~/config/env";
import { isPublicPath, isTokenExpired } from "~/utils/auth";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const access = useAuthStore.getState().access; // ✅ ĐÚNG

    if (typeof window !== "undefined") {
        config.headers = config.headers || {};
        config.headers["X-Workspace-Host"] = window.location.host;
    }

    if (access) {
        if (isTokenExpired(access)) {
            useAuthStore.getState().clearAuth();

            if (typeof window !== "undefined" && !isPublicPath(window.location.pathname)) {
                window.location.replace("/");
            }

            return Promise.reject(new axios.Cancel("Token đã hết hạn"));
        }

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const hasAuthHeader =
            Boolean(error?.config?.headers?.Authorization);

        if (status === 401 && hasAuthHeader) {
            useAuthStore.getState().clearAuth();

            if (typeof window !== "undefined" && !isPublicPath(window.location.pathname)) {
                window.location.replace("/");
            }
        }

        return Promise.reject(error);
    }
);

export default api;
