const FALLBACK_API_BASE_URL =
    "https://thitructuyen-demo-api.tmqcreator.top/api";

export const API_BASE_URL =
    (process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL)
        .replace(/\/+$/, "");

export const PUBLIC_API_BASE_URL =
    API_BASE_URL.replace(/\/api\/?$/, "");
