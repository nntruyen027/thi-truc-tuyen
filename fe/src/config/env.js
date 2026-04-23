const FALLBACK_API_BASE_URL =
    "https://thitructuyen-demo-api.tmqcreator.top/api";

function normalizeApiBaseUrl(value) {
    let url =
        (value || FALLBACK_API_BASE_URL)
            .trim()
            .replace(/\/+$/, "");

    if (!/^https?:\/\//i.test(url)) {
        url = `http://${url}`;
    }

    if (!/\/api$/i.test(url)) {
        url = `${url}/api`;
    }

    return url;
}

export const API_BASE_URL =
    normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const PUBLIC_API_BASE_URL =
    API_BASE_URL.replace(/\/api\/?$/, "");
