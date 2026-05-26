export const USER_PROFILE_FIELD_KEYS = {
    hoTen: "hoTen",
    soDienThoai: "soDienThoai",
    diaChiDong1: "diaChiDong1",
    tinhThanh: "tinhThanh",
    ngheNghiep: "ngheNghiep",
    doiTuong: "doiTuong",
    donViId: "donViId",
};

export const LOCKED_USER_PROFILE_FIELDS = [
    USER_PROFILE_FIELD_KEYS.hoTen,
    USER_PROFILE_FIELD_KEYS.soDienThoai,
];

export const DEFAULT_USER_PROFILE_FIELDS = [
    USER_PROFILE_FIELD_KEYS.hoTen,
    USER_PROFILE_FIELD_KEYS.soDienThoai,
    USER_PROFILE_FIELD_KEYS.diaChiDong1,
    USER_PROFILE_FIELD_KEYS.tinhThanh,
    USER_PROFILE_FIELD_KEYS.ngheNghiep,
    USER_PROFILE_FIELD_KEYS.doiTuong,
    USER_PROFILE_FIELD_KEYS.donViId,
];

export const TINH_THANH_OPTIONS = [
    {label: "Cần Thơ", value: "Cần Thơ"},
    {label: "Khác", value: "Khác"},
];

export const NGHE_NGHIEP_OPTIONS = [
    {label: "Công chức, viên chức", value: "cong_chuc_vien_chuc"},
    {label: "Lực lượng vũ trang", value: "luc_luong_vu_trang"},
    {label: "Học sinh, sinh viên", value: "hoc_sinh_sinh_vien"},
    {label: "Người lao động/Khác", value: "nguoi_lao_dong_khac"},
];

export const DOI_TUONG_OPTIONS = [
    {label: "Đảng viên", value: "dang_vien"},
    {label: "Đoàn viên", value: "doan_vien"},
    {label: "Hội viên", value: "hoi_vien"},
    {label: "Khác", value: "khac"},
];

export const USER_PROFILE_FIELD_OPTIONS = [
    {label: "Họ và tên", value: USER_PROFILE_FIELD_KEYS.hoTen, disabled: true},
    {label: "Số điện thoại", value: USER_PROFILE_FIELD_KEYS.soDienThoai, disabled: true},
    {label: "Địa chỉ thường trú", value: USER_PROFILE_FIELD_KEYS.diaChiDong1},
    {label: "Tỉnh/Thành phố thường trú", value: USER_PROFILE_FIELD_KEYS.tinhThanh},
    {label: "Nghề nghiệp", value: USER_PROFILE_FIELD_KEYS.ngheNghiep},
    {label: "Đối tượng", value: USER_PROFILE_FIELD_KEYS.doiTuong},
    {label: "Địa phương, đơn vị đăng ký dự thi", value: USER_PROFILE_FIELD_KEYS.donViId},
];

export function parseUserProfileFieldConfig(rawValue) {
    if (!rawValue) {
        return [...DEFAULT_USER_PROFILE_FIELDS];
    }

    try {
        const parsed = JSON.parse(rawValue);
        const enabledFields = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.enabledFields)
                ? parsed.enabledFields
                : [];

        const normalized = new Set([
            ...LOCKED_USER_PROFILE_FIELDS,
            ...enabledFields.filter((item) => DEFAULT_USER_PROFILE_FIELDS.includes(item)),
        ]);

        return DEFAULT_USER_PROFILE_FIELDS.filter((item) => normalized.has(item));
    } catch {
        return [...DEFAULT_USER_PROFILE_FIELDS];
    }
}

export function buildUserProfileFieldConfig(enabledFields) {
    return JSON.stringify({
        enabledFields: DEFAULT_USER_PROFILE_FIELDS.filter((item) => enabledFields.includes(item)),
    });
}
