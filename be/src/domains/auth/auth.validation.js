const PHONE_REGEX = /^0\d{9}$/;

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

exports.validateLoginPayload = ({username, password}) => ({
    username: normalizeText(username, "số điện thoại hoặc tên đăng nhập", {
        required: true,
        maxLength: 50,
    }),
    password: normalizePassword(password),
});

exports.validateRegisterPayload = ({username, hoTen, password, repeatPassword, donViId}) => {
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
            required: true,
            maxLength: 120,
        }),
        password: normalizedPassword,
        repeatPassword: normalizedRepeatPassword,
        donViId: normalizeDonViId(donViId, {required: true}),
    };
};

exports.validateProfilePayload = ({hoTen, donViId}) => ({
    hoTen: normalizeText(hoTen, "họ tên", {
        required: true,
        maxLength: 120,
    }),
    donViId: normalizeDonViId(donViId, {required: true}),
});

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

