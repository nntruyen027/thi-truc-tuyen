const jwt = require("jsonwebtoken");

/**
 * Generate a short-lived CSRF token for a user
 * Token expires in 5 minutes by default
 * @param {number} userId
 * @returns {string} CSRF token
 */
exports.generateCsrfToken = (userId) => {
    return jwt.sign(
        { userId, type: "csrf" },
        process.env.JWT_SECRET || "csrf-secret-fallback",
        {
            expiresIn: process.env.CSRF_TOKEN_EXPIRES || "5m",
        }
    );
};

/**
 * Verify a CSRF token
 * @param {string} token
 * @param {number} userId - User ID to verify against
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
exports.verifyCsrfToken = (token, userId) => {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "csrf-secret-fallback"
        );

        // Verify token type and user ID match
        if (decoded.type !== "csrf" || decoded.userId !== userId) {
            throw new Error("CSRF token mismatch");
        }

        return decoded;
    } catch (err) {
        const message = err.name === "TokenExpiredError"
            ? "CSRF token đã hết hạn. Vui lòng tải lại trang."
            : "CSRF token không hợp lệ";
        throw new Error(message);
    }
};
