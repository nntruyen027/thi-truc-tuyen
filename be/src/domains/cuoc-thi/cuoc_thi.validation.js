function normalizeText(value, fieldName, {required = false, maxLength = null} = {}) {
    const normalized =
        typeof value === "string"
            ? value.trim()
            : "";

    if (required && !normalized) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    if (maxLength && normalized.length > maxLength) {
        throw `${fieldName} không được vượt quá ${maxLength} ký tự.`;
    }

    return normalized;
}

function normalizeBoolean(value) {
    return Boolean(value);
}

function normalizeDateValue(value, fieldName) {
    if (!value) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw `${fieldName} không hợp lệ.`;
    }

    return date;
}

exports.normalizeCuocThiPayload = (payload = {}) => {
    const thoiGianBatDau = normalizeDateValue(payload.thoi_gian_bat_dau, "thời gian bắt đầu");
    const thoiGianKetThuc = normalizeDateValue(payload.thoi_gian_ket_thuc, "thời gian kết thúc");

    if (thoiGianBatDau.getTime() >= thoiGianKetThuc.getTime()) {
        throw "Thời gian kết thúc phải sau thời gian bắt đầu.";
    }

    const choPhepXemLichSu = normalizeBoolean(payload.cho_phep_xem_lich_su);
    const choPhepXemLaiDapAn = normalizeBoolean(payload.cho_phep_xem_lai_dap_an);

    if (choPhepXemLaiDapAn && !choPhepXemLichSu) {
        throw "Muốn cho xem lại đáp án thì phải bật công bố kết quả.";
    }

    return {
        ten: normalizeText(payload.ten, "tên cuộc thi", {
            required: true,
            maxLength: 255,
        }),
        mo_ta: typeof payload.mo_ta === "string" ? payload.mo_ta.trim() : "",
        thoi_gian_bat_dau: thoiGianBatDau,
        thoi_gian_ket_thuc: thoiGianKetThuc,
        trang_thai: normalizeBoolean(payload.trang_thai),
        cho_phep_xem_lich_su: choPhepXemLichSu,
        cho_phep_xem_lai_dap_an: choPhepXemLaiDapAn,
        co_tu_luan: normalizeBoolean(payload.co_tu_luan),
    };
};

