const PHONE_REGEX = /^0\d{9}$/;
const {
    DOI_TUONG_OPTIONS,
    NGHE_NGHIEP_OPTIONS,
    TINH_THANH_OPTIONS,
    USER_PROFILE_FIELD_KEYS,
} = require("./auth.profile-fields");

function normalizeText(value, fieldName, options = {}) {
    const {
        required = false,
        maxLength = null,
    } = options;

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

function normalizePassword(value, fieldName = "mật khẩu") {
    const normalized =
        typeof value === "string"
            ? value
            : "";

    if (!normalized || !normalized.trim()) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    if (normalized.length < 6) {
        throw `${fieldName} phải có ít nhất 6 ký tự.`;
    }

    return normalized;
}

function normalizeDonViId(donViId, {required = false} = {}) {
    if (donViId == null || donViId === "") {
        if (required) {
            throw "Vui lòng chọn đơn vị.";
        }

        return null;
    }

    const normalized = Number(donViId);

    if (!Number.isInteger(normalized) || normalized < 1) {
        throw "Đơn vị không hợp lệ.";
    }

    return normalized;
}

function hasEnabledField(enabledFields, key) {
    return enabledFields.includes(key);
}

function normalizeSelectValue(value, options, fieldName, {required = false} = {}) {
    if (value == null || value === "") {
        if (required) {
            throw `Vui lòng chọn ${fieldName}.`;
        }

        return null;
    }

    const normalized = String(value).trim();

    if (!options.includes(normalized)) {
        throw `${fieldName} không hợp lệ.`;
    }

    return normalized;
}

exports.validateLoginPayload = ({username, password}) => ({
    username: normalizeText(username, "số điện thoại hoặc tên đăng nhập", {
        required: true,
        maxLength: 50,
    }),
    password: normalizePassword(password),
});

exports.validateRegisterPayload = (payload, enabledFields = []) => {
    const {
        username,
        hoTen,
        password,
        repeatPassword,
        donViId,
        diaChiDong1,
        xaPhuong,
        tinhThanh,
        ngheNghiep,
        doiTuong,
    } = payload || {};
    const normalizedUsername = normalizeText(username, "số điện thoại", {
        required: true,
        maxLength: 20,
    });

    if (!PHONE_REGEX.test(normalizedUsername)) {
        throw "Số điện thoại không hợp lệ.";
    }

    const normalizedPassword = normalizePassword(password);
    const normalizedRepeatPassword = normalizePassword(repeatPassword, "mật khẩu nhập lại");

    if (normalizedRepeatPassword !== normalizedPassword) {
        throw "Mật khẩu không khớp!";
    }

    return {
        username: normalizedUsername,
        hoTen: normalizeText(hoTen, "họ tên", {
            required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.hoTen),
            maxLength: 120,
        }),
        password: normalizedPassword,
        repeatPassword: normalizedRepeatPassword,
        diaChiDong1: normalizeText(diaChiDong1, "địa chỉ dòng 1", {
            required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.diaChiDong1),
            maxLength: 500,
        }),
        xaPhuong: normalizeText(xaPhuong, "xã/phường", {
            required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.xaPhuong),
            maxLength: 255,
        }),
        tinhThanh: normalizeSelectValue(
            tinhThanh,
            TINH_THANH_OPTIONS,
            "tỉnh/thành phố",
            {required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.tinhThanh)}
        ),
        ngheNghiep: normalizeSelectValue(
            ngheNghiep,
            NGHE_NGHIEP_OPTIONS,
            "nghề nghiệp",
            {required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.ngheNghiep)}
        ),
        doiTuong: normalizeSelectValue(
            doiTuong,
            DOI_TUONG_OPTIONS,
            "đối tượng",
            {required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.doiTuong)}
        ),
        donViId: normalizeDonViId(
            donViId,
            {required: hasEnabledField(enabledFields, USER_PROFILE_FIELD_KEYS.donViId)}
        ),
    };
};

exports.validateProfilePayload = (payload = {}) => {
    const normalized = {};

    if (Object.prototype.hasOwnProperty.call(payload, "hoTen")) {
        normalized.hoTen = normalizeText(payload.hoTen, "họ tên", {
            required: true,
            maxLength: 120,
        });
    }

    if (Object.prototype.hasOwnProperty.call(payload, "diaChiDong1")) {
        normalized.diaChiDong1 = normalizeText(payload.diaChiDong1, "địa chỉ dòng 1", {
            required: false,
            maxLength: 500,
        });
    }

    if (Object.prototype.hasOwnProperty.call(payload, "xaPhuong")) {
        normalized.xaPhuong = normalizeText(payload.xaPhuong, "xã/phường", {
            required: false,
            maxLength: 255,
        });
    }

    if (Object.prototype.hasOwnProperty.call(payload, "tinhThanh")) {
        normalized.tinhThanh = normalizeSelectValue(payload.tinhThanh, TINH_THANH_OPTIONS, "tỉnh/thành phố");
    }

    if (Object.prototype.hasOwnProperty.call(payload, "ngheNghiep")) {
        normalized.ngheNghiep = normalizeSelectValue(payload.ngheNghiep, NGHE_NGHIEP_OPTIONS, "nghề nghiệp");
    }

    if (Object.prototype.hasOwnProperty.call(payload, "doiTuong")) {
        normalized.doiTuong = normalizeSelectValue(payload.doiTuong, DOI_TUONG_OPTIONS, "đối tượng");
    }

    if (Object.prototype.hasOwnProperty.call(payload, "donViId")) {
        normalized.donViId = normalizeDonViId(payload.donViId, {required: false});
    }

    return normalized;
};

exports.validateChangePasswordPayload = ({oldPassword, newPassword, repeatPass}) => {
    const normalizedOldPassword = normalizePassword(oldPassword, "mật khẩu hiện tại");
    const normalizedNewPassword = normalizePassword(newPassword, "mật khẩu mới");
    const normalizedRepeatPass = normalizePassword(repeatPass, "mật khẩu nhập lại");

    if (normalizedNewPassword !== normalizedRepeatPass) {
        throw "Mật khẩu xác nhận không khớp.";
    }

    if (normalizedOldPassword === normalizedNewPassword) {
        throw "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
    }

    return {
        oldPassword: normalizedOldPassword,
        newPassword: normalizedNewPassword,
        repeatPass: normalizedRepeatPass,
    };
};

exports.validateRefreshPayload = ({refresh}) => {
    const normalizedRefresh = normalizeText(refresh, "refresh token", {
        required: true,
        maxLength: 1000,
    });

    return {refresh: normalizedRefresh};
};

