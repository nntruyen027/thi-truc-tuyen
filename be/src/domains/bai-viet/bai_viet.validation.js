function normalizeText(value, fieldName, {required = false} = {}) {
    const normalized = typeof value === "string" ? value.trim() : "";

    if (required && !normalized) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    return normalized;
}

function normalizeDateValue(value, fieldName) {
    if (!value) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    const candidate =
        value instanceof Date
            ? value
            : typeof value?.toDate === "function"
                ? value.toDate()
                : new Date(value);

    if (Number.isNaN(candidate.getTime())) {
        throw `${fieldName} không hợp lệ.`;
    }

    return candidate;
}

exports.normalizeBaiVietPayload = (payload = {}) => ({
    tieuDe: normalizeText(payload.tieuDe, "tiêu đề", {required: true}),
    tomTat: normalizeText(payload.tomTat, "tóm tắt", {required: true}),
    noiDung: normalizeText(payload.noiDung, "nội dung bài viết", {required: true}),
    anhDaiDien: normalizeText(payload.anhDaiDien, "ảnh đại diện"),
    ngayDang: normalizeDateValue(payload.ngayDang, "ngày đăng"),
    trangThai: payload.trangThai ?? true,
});
