import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";

const KHOA_GIAI_THUONG = "giai_thuong_cuoc_thi";

function normalizePrize(item = {}, index = 0) {
    return {
        id: item.id || `${Date.now()}-${index}`,
        tenGiai: item.tenGiai || "",
        soLuong: item.soLuong || "",
        triGia: item.triGia || "",
        ghiChu: item.ghiChu || "",
    };
}

function normalizeData(value = {}) {
    return {
        tieuDe: value.tieuDe || "Giải thưởng cuộc thi",
        moTa: value.moTa || "Thông tin giải thưởng dành cho cá nhân và tập thể tham gia cuộc thi.",
        giaiCaNhan: Array.isArray(value.giaiCaNhan)
            ? value.giaiCaNhan.map(normalizePrize)
            : [],
        giaiTapThe: Array.isArray(value.giaiTapThe)
            ? value.giaiTapThe.map(normalizePrize)
            : [],
    };
}

export async function layCauHinhGiaiThuong() {
    const res = await layCauHinh(KHOA_GIAI_THUONG);

    if (!res.data?.gia_tri) {
        return normalizeData();
    }

    try {
        return normalizeData(JSON.parse(res.data.gia_tri));
    } catch {
        return normalizeData();
    }
}

export async function luuCauHinhGiaiThuong(value) {
    const normalized = normalizeData(value);

    await suaCauHinh(KHOA_GIAI_THUONG, JSON.stringify(normalized));

    return normalized;
}

