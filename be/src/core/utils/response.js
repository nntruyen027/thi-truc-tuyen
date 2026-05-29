exports.ok = (res, data) => {
    res.json({
        success: true,
        data
    })
}

exports.error = (res, err) => {
    const status =
        typeof err === "string"
            ? 400
            : Number(err?.status || err?.statusCode) || 500;

    const message =
        typeof err === "string"
            ? err
            : err?.message || "Có lỗi xảy ra";

    res.status(status).json({
        success: false,
        message
    })
}
