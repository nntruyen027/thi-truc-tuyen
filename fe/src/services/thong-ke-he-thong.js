import api from "~/services/api";

const BASE_PATH = "/thong-ke-he-thong";

export async function layThongKeHeThong() {
    try {
        const res = await api.get(BASE_PATH);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message || "Không thể tải thống kê hệ thống");
    }
}
