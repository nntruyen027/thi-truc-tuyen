const dbHelper = require("../../utils/dbHelper")

exports.layDsTracNghiem = (
    size,
    page,
    search,
    sortField,
    sortType,
) => {

    return dbHelper.call(
        "select thi.lay_trac_nghiem($1,$2,$3,$4,$5) as data",
        [
            size,
            page,
            search,
            sortField,
            sortType,
        ]
    )
}

exports.themTracNghiem = (linh_vuc_id,
                          nhom_id,
                          cau_hoi,
                          cauA,
                          cauB,
                          cauC,
                          cauD,
                          dapAn,
                          diem) => {


    const sql =
        `select thi.them_trac_nghiem($1,$2,$3,$4,$5,$6,$7,$8,$9) as data`

    return dbHelper.call(
        sql,
        [linh_vuc_id,
            nhom_id,
            cau_hoi,
            cauA,
            cauB,
            cauC,
            cauD,
            dapAn,
            diem]
    )

}

exports.suaTracNghiem = (id,
                         linh_vuc_id,
                         nhom_id,
                         cau_hoi,
                         cauA,
                         cauB,
                         cauC,
                         cauD,
                         dapAn,
                         diem) => {


    const sql =
        `select thi.sua_trac_nghiem($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) as data`

    return dbHelper.call(
        sql,
        [id,
            linh_vuc_id,
            nhom_id,
            cau_hoi,
            cauA,
            cauB,
            cauC,
            cauD,
            dapAn,
            diem]
    )
}

exports.xoaTracNghiem = (id) => {
    return dbHelper.call(
        `select thi.xoa_trac_nghiem($1) as data`,
        [id],
    )
}

exports.themTracNghiemImport = (r) => {

    return dbHelper.call(
        `
        select thi.fn_import_trac_nghiem(
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        `,
        [
            r["Câu hỏi"],
            r["Câu a"],
            r["Câu b"],
            r["Câu c"],
            r["Câu d"],
            r["Đáp án"],
            r["Lĩnh vực"],
            r["Nhóm"],
            r["Điểm mặc định"]
        ]
    )

}