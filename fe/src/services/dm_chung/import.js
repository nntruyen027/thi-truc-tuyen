import api from "~/services/api";
import { ensureUploadableFile } from "~/services/file";

function normalizeTenDm(tenDm) {
    return String(tenDm || "").replaceAll("_", "-");
}

export async function taiTemplateDanhMuc(tenDm) {
    try {
        const res = await api.get(`/dm-chung/${normalizeTenDm(tenDm)}/import/template`, {
            responseType: "blob",
        });

        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message || "Không thể tải file mẫu");
    }
}

export async function importDanhMuc(tenDm, file) {
    const normalizedFile = ensureUploadableFile(file);
    const form = new FormData();

    form.append("file", normalizedFile);

    try {
        const res = await api.post(
            `/dm-chung/${normalizeTenDm(tenDm)}/import`,
            form,
            {
                timeout: 10 * 60 * 1000,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            }
        );

        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message || e?.message);
    }
}
