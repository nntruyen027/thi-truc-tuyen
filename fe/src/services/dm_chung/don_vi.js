import api from "~/services/api";

const BASE_PATH = "/dm-chung/don-vi";
const DON_VI_CACHE_TTL_MS = 10 * 60 * 1000;
const donViCache = new Map();
const donViInFlight = new Map();

function getDonViCacheKey({
    size,
    page,
    search,
    sortField,
    sortType,
}) {
    return [
        Number(size || 0),
        Number(page || 0),
        String(search || ""),
        String(sortField || ""),
        String(sortType || ""),
    ].join(":");
}

function readDonViCache(key) {
    const entry = donViCache.get(key);

    if (!entry) {
        return null;
    }

    if ((Date.now() - entry.createdAt) > DON_VI_CACHE_TTL_MS) {
        donViCache.delete(key);
        return null;
    }

    return entry.data;
}

function clearDonViCache() {
    donViCache.clear();
    donViInFlight.clear();
}

// Lay ds don vi
export async function getDonVi({ size = 10,
                                   page = 1,
                                   search = "",
                                   sortField = "id",
                                   sortType = "asc"}){
    try {
        const params = {
            size,
            page,
            search,
            sortField,
            sortType
        };
        const cacheKey = getDonViCacheKey(params);
        const cached = readDonViCache(cacheKey);

        if (cached) {
            return cached;
        }

        const existingRequest = donViInFlight.get(cacheKey);

        if (existingRequest) {
            return existingRequest;
        }

        const request = (async () => {
            try {
                const res = await api.get(BASE_PATH, {
                    params,
                });
                const data = res.data.data;

                donViCache.set(cacheKey, {
                    createdAt: Date.now(),
                    data,
                });

                return data;
            } finally {
                donViInFlight.delete(cacheKey);
            }
        })();

        donViInFlight.set(cacheKey, request);

        return request;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themDonVi(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        clearDonViCache();
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaDonVi(id, value) {
    try {
        const res = await api.put(BASE_PATH + '/' + id, value);
        clearDonViCache();
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaDonVi(id) {
    try {
        await api.delete(BASE_PATH + '/' + id);
        clearDonViCache();
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}
