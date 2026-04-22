exports.ok = (res, data) => {
    res.json({
        success: true,
        data
    })
}

exports.error = (res, err) => {
    const message =
        typeof err === "string"
            ? err
            : err?.message || "Có lỗi xảy ra";

    res.status(500).json({
        success: false,
        message
    })
}
