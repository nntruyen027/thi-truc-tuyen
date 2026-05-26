const USER_PROFILE_FIELD_KEYS = {
    hoTen: "hoTen",
    soDienThoai: "soDienThoai",
    diaChiDong1: "diaChiDong1",
    tinhThanh: "tinhThanh",
    ngheNghiep: "ngheNghiep",
    doiTuong: "doiTuong",
    donViId: "donViId",
};

const LOCKED_USER_PROFILE_FIELDS = [
    USER_PROFILE_FIELD_KEYS.hoTen,
    USER_PROFILE_FIELD_KEYS.soDienThoai,
];

const DEFAULT_USER_PROFILE_FIELDS = [
    USER_PROFILE_FIELD_KEYS.hoTen,
    USER_PROFILE_FIELD_KEYS.soDienThoai,
    USER_PROFILE_FIELD_KEYS.diaChiDong1,
    USER_PROFILE_FIELD_KEYS.tinhThanh,
    USER_PROFILE_FIELD_KEYS.ngheNghiep,
    USER_PROFILE_FIELD_KEYS.doiTuong,
    USER_PROFILE_FIELD_KEYS.donViId,
];

const NGHE_NGHIEP_OPTIONS = [
    "cong_chuc_vien_chuc",
    "luc_luong_vu_trang",
    "hoc_sinh_sinh_vien",
    "nguoi_lao_dong_khac",
];

const DOI_TUONG_OPTIONS = [
    "dang_vien",
    "doan_vien",
    "hoi_vien",
    "khac",
];

const TINH_THANH_OPTIONS = [
    "Cần Thơ",
    "Khác",
];

function parseUserProfileFieldConfig(giaTri) {
    if (!giaTri) {
        return [...DEFAULT_USER_PROFILE_FIELDS];
    }

    try {
        const parsed = JSON.parse(giaTri);
        const enabledFields =
            Array.isArray(parsed)
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

module.exports = {
    USER_PROFILE_FIELD_KEYS,
    LOCKED_USER_PROFILE_FIELDS,
    DEFAULT_USER_PROFILE_FIELDS,
    NGHE_NGHIEP_OPTIONS,
    DOI_TUONG_OPTIONS,
    TINH_THANH_OPTIONS,
    parseUserProfileFieldConfig,
};
