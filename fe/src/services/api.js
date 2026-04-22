import axios from "axios";
import { useAuthStore } from "~/store/auth";
import { API_BASE_URL } from "~/config/env";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const access = useAuthStore.getState().access; // ✅ ĐÚNG

    if (access) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
});

export default api;
