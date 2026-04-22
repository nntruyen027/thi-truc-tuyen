import axios from "axios";
import { useAuthStore } from "~/store/auth";

const api = axios.create({
    baseURL: "https://thitructuyen-demo-api.tmqcreator.top/api",
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
