import { PUBLIC_API_BASE_URL, API_BASE_URL } from "~/config/env";
import { useAuthStore } from "~/store/auth";


const BASE_PATH = "/file";
export const MAX_UPLOAD_SIZE_MB = 50;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export function normalizeUploadFile(file) {
    if (!file) {
        return null;
    }

    const candidates = [
        file,
        file.originFileObj,
        file.file,
        file?.file?.originFileObj,
    ].filter(Boolean);

    return candidates.find((candidate) =>
        typeof candidate === "object"
        && (
            candidate instanceof Blob
            || typeof candidate.arrayBuffer === "function"
            || typeof candidate.stream === "function"
        )
    ) || null;
}

export function ensureUploadableFile(file) {
    const normalizedFile = normalizeUploadFile(file);

    if (!normalizedFile) {
        throw new Error("Không tìm thấy file để tải lên");
    }

    if (typeof normalizedFile.size !== "number") {
        throw new Error("Dữ liệu file không hợp lệ");
    }

    if (normalizedFile.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error(`File vượt quá giới hạn ${MAX_UPLOAD_SIZE_MB}MB`);
    }

    return normalizedFile;
}

function normalizeUploadedFileResponse(payload = {}) {
    const duongDan = payload.duongDan || payload.duong_dan || payload.url || "";

    return {
        ...payload,
        duongDan,
        duong_dan: payload.duong_dan || duongDan,
        url: payload.url || duongDan,
    };
}

export async function uploadFile(file, options = {}) {
    const normalizedFile = ensureUploadableFile(file);
    const access = useAuthStore.getState().access;

    return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", `${API_BASE_URL}${BASE_PATH}/upload`);
        xhr.timeout = 10 * 60 * 1000;

        if (typeof window !== "undefined") {
            xhr.setRequestHeader("X-Workspace-Host", window.location.host);
        }

        if (access) {
            xhr.setRequestHeader("Authorization", `Bearer ${access}`);
        }

        const formData = new FormData();
        formData.append("file", normalizedFile);

        if (xhr.upload && typeof options.onUploadProgress === "function") {
            xhr.upload.onprogress = (event) => {
                options.onUploadProgress(event);
            };
        }

        xhr.onload = () => {
            try {
                const payload = JSON.parse(xhr.responseText || "{}");

                if (xhr.status >= 200 && xhr.status < 300 && payload.success) {
                    resolve(normalizeUploadedFileResponse(payload.data));
                    return;
                }

                reject(
                    new Error(
                        payload.message || `Tải file thất bại (${xhr.status})`
                    )
                );
            } catch {
                reject(new Error("Phản hồi upload không hợp lệ"));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Không thể kết nối tới máy chủ upload"));
        };

        xhr.ontimeout = () => {
            reject(new Error("Upload quá thời gian chờ"));
        };

        xhr.send(formData);
    });
}

export async function xoaFile(id) {
    if (!id) {
        return null;
    }

    const access = useAuthStore.getState().access;
    const response = await fetch(`${API_BASE_URL}${BASE_PATH}/${id}`, {
        method: "DELETE",
        headers: {
            ...(access ? {Authorization: `Bearer ${access}`} : {}),
            ...(typeof window !== "undefined"
                ? {"X-Workspace-Host": window.location.host}
                : {}),
        },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Không thể xóa file");
    }

    return payload.data || null;
}


export function getPublicFileUrl(duongDan) {
    if (!duongDan) return "";

    if (/^https?:\/\//i.test(duongDan)) {
        return duongDan;
    }

    const normalizedPath =
        duongDan.replace(/^\/+/, "");

    return `${PUBLIC_API_BASE_URL}/${normalizedPath}`;
}
