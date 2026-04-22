const dbHelper =
    require("../../utils/dbHelper");


exports.themFile = (
    ten,
    tenGoc,
    duongDan,
    loai,
    kichThuoc,
    nguoiTao
) => {

    return dbHelper.call(
        "select file.fn_them_file($1,$2,$3,$4,$5,$6) as data",
        [
            ten,
            tenGoc,
            duongDan,
            loai,
            kichThuoc,
            nguoiTao
        ]
    );

};


exports.layFile = (
    page,
    size,
    search
) => {

    return dbHelper.call(
        "select file.fn_lay_file($1,$2,$3) as data",
        [
            page,
            size,
            search
        ]
    );

};


exports.xoaFile = (id) => {

    return dbHelper.call(
        "select file.fn_xoa_file($1) as data",
        [id]
    );

};