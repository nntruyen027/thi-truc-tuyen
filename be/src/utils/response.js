exports.ok = (res, data) => {
    res.json({
        success: true,
        data
    })
}

exports.error = (res, err) => {
    res.status(500).json({
        success: false,
        message: err.message
    })
}