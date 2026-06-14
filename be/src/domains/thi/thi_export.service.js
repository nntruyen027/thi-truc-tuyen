const query = require("./thi.query");
const { runWorkerTask } = require("../../utils/worker-task");

function formatDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (number) => String(number).padStart(2, "0");

    return [
        pad(date.getDate()),
        pad(date.getMonth() + 1),
        date.getFullYear(),
    ].join("/") + " " + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
    ].join(":");
}

function formatDuration(value) {
    if (value == null || value === "") {
        return "-";
    }

    const totalSeconds = Math.max(0, Number(value) || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return [hours, minutes, seconds]
            .map((item) => String(item).padStart(2, "0"))
            .join(":");
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDiaChi(thiSinh = {}) {
    const parts = [
        thiSinh.diaChiDong1 || thiSinh.dia_chi_dong_1,
        thiSinh.xaPhuong || thiSinh.xa_phuong,
        thiSinh.tinhThanh || thiSinh.tinh_thanh,
    ]
        .map((item) => String(item || "").trim())
        .filter(Boolean);

    return parts.join(", ");
}

function buildFileName({scopeType, scopeId, top}) {
    return `ket-qua-trac-nghiem-${scopeType}-${scopeId}-top-${top}.xlsx`;
}

function buildDonViThongKeFileName() {
    return "thong-ke-tham-gia-theo-don-vi.xlsx";
}

function createHeaderRow(worksheet, label, value) {
    const row = worksheet.addRow([label, value]);

    row.getCell(1).font = {
        bold: true,
    };

    return row;
}

async function buildKetQuaTracNghiemExport({
    scopeType,
    scopeId,
    top,
}) {
    const ExcelJS = require("exceljs");
    const rows =
        scopeType === "dot-thi"
            ? await query.xepHangTracNghiemTheoDotThi(scopeId, top)
            : await query.xepHangTracNghiemTheoCuocThi(scopeId, top);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Thi truc tuyen";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Kết quả trắc nghiệm", {
        views: [{state: "frozen", ySplit: 5}],
    });

    worksheet.columns = [
        {header: "STT", key: "stt", width: 8},
        {header: "Thí sinh", key: "thiSinh", width: 28},
        {header: "Số điện thoại", key: "soDienThoai", width: 18},
        {header: "Địa chỉ", key: "diaChi", width: 38},
        {header: "Đơn vị", key: "donVi", width: 26},
        {header: "Điểm", key: "diem", width: 10},
        {header: "Thời gian làm bài", key: "thoiGian", width: 18},
        {header: "Số dự đoán", key: "soDuDoan", width: 14},
        {header: "Kết quả dự đoán", key: "ketQuaDuDoan", width: 18},
        {header: "Sai số dự đoán", key: "saiSo", width: 16},
    ];

    worksheet.mergeCells("A1:J1");
    worksheet.getCell("A1").value = "KẾT QUẢ THI TRẮC NGHIỆM";
    worksheet.getCell("A1").font = {
        bold: true,
        size: 16,
    };
    worksheet.getCell("A1").alignment = {
        horizontal: "center",
    };

    createHeaderRow(
        worksheet,
        "Phạm vi",
        scopeType === "dot-thi" ? `Đợt thi #${scopeId}` : `Cuộc thi #${scopeId}`
    );
    createHeaderRow(worksheet, "Số lượng xếp hạng", top);
    createHeaderRow(worksheet, "Thời gian xuất", formatDateTime(new Date()));

    const headerRow = worksheet.addRow(worksheet.columns.map((column) => column.header));
    headerRow.font = {
        bold: true,
        color: {argb: "FFFFFFFF"},
    };
    headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
    };

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {argb: "FF1948BE"},
        };
        cell.border = {
            top: {style: "thin", color: {argb: "FFD9E2F2"}},
            bottom: {style: "thin", color: {argb: "FFD9E2F2"}},
            left: {style: "thin", color: {argb: "FFD9E2F2"}},
            right: {style: "thin", color: {argb: "FFD9E2F2"}},
        };
    });

    rows.forEach((row, index) => {
        const thiSinh = row?.thiSinh || row?.thi_sinh || {};
        const excelRow = worksheet.addRow({
            stt: index + 1,
            thiSinh: thiSinh.hoTen || thiSinh.ho_ten || "-",
            soDienThoai: thiSinh.username || "-",
            diaChi: formatDiaChi(thiSinh) || "-",
            donVi: thiSinh.donViTen || thiSinh.don_vi_ten || thiSinh?.don_vi?.ten || "-",
            diem: row?.diem ?? "",
            thoiGian: formatDuration(row?.thoiGian ?? row?.thoi_gian),
            soDuDoan: row?.soDuDoan ?? row?.so_du_doan ?? "",
            ketQuaDuDoan: row?.soNguoi100 ?? row?.so_nguoi_100 ?? "",
            saiSo: row?.saiSo ?? row?.sai_so ?? "",
        });

        excelRow.eachCell((cell) => {
            cell.border = {
                top: {style: "thin", color: {argb: "FFE5E7EB"}},
                bottom: {style: "thin", color: {argb: "FFE5E7EB"}},
                left: {style: "thin", color: {argb: "FFE5E7EB"}},
                right: {style: "thin", color: {argb: "FFE5E7EB"}},
            };
        });
    });

    return {
        buffer: await workbook.xlsx.writeBuffer(),
        fileName: buildFileName({scopeType, scopeId, top}),
    };
}

exports.buildKetQuaTracNghiemExport = buildKetQuaTracNghiemExport;

exports.buildThongKeThamGiaTheoDonViExport = async (filters = {}) => {
    const ExcelJS = require("exceljs");
    const rows = await query.thongKeThamGiaTheoDonVi(filters);
    const cuocThiId = Number(filters?.cuocThiId) > 0 ? Number(filters.cuocThiId) : null;
    const dotThiId = Number(filters?.dotThiId) > 0 ? Number(filters.dotThiId) : null;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Thi truc tuyen";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Thong ke theo don vi", {
        views: [{state: "frozen", ySplit: 5}],
    });

    worksheet.columns = [
        {header: "STT", key: "stt", width: 8},
        {header: "Ten don vi", key: "tenDonVi", width: 36},
        {header: "Tong tai khoan thi sinh", key: "tongTaiKhoanThiSinh", width: 22},
        {header: "So nguoi tham gia", key: "soNguoiThamGia", width: 18},
        {header: "Tong tai khoan Dang vien", key: "tongTaiKhoanDangVien", width: 24},
        {header: "So Dang vien tham gia", key: "soDangVienThamGia", width: 22},
        {header: "So luot nop bai", key: "soLuotNopBai", width: 18},
        {header: "Ty le tham gia (%)", key: "tyLeThamGia", width: 18},
    ];

    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").value = "THONG KE THAM GIA THEO DON VI";
    worksheet.getCell("A1").font = {
        bold: true,
        size: 16,
    };
    worksheet.getCell("A1").alignment = {
        horizontal: "center",
    };

    createHeaderRow(worksheet, "Thoi gian xuat", formatDateTime(new Date()));
    createHeaderRow(worksheet, "So don vi", rows.length);
    createHeaderRow(
        worksheet,
        "Pham vi",
        dotThiId
            ? `Dot thi #${dotThiId}`
            : cuocThiId
                ? `Cuoc thi #${cuocThiId}`
                : "Tat ca don vi"
    );

    const headerRow = worksheet.addRow(worksheet.columns.map((column) => column.header));
    headerRow.font = {
        bold: true,
        color: {argb: "FFFFFFFF"},
    };
    headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
    };

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {argb: "FF1948BE"},
        };
        cell.border = {
            top: {style: "thin", color: {argb: "FFD9E2F2"}},
            bottom: {style: "thin", color: {argb: "FFD9E2F2"}},
            left: {style: "thin", color: {argb: "FFD9E2F2"}},
            right: {style: "thin", color: {argb: "FFD9E2F2"}},
        };
    });

    rows.forEach((row) => {
        const excelRow = worksheet.addRow({
            stt: row?.stt ?? "",
            tenDonVi: row?.ten_don_vi || "-",
            tongTaiKhoanThiSinh: Number(row?.tong_tai_khoan_thi_sinh || 0),
            soNguoiThamGia: Number(row?.so_nguoi_tham_gia || 0),
            tongTaiKhoanDangVien: Number(row?.tong_tai_khoan_dang_vien || 0),
            soDangVienThamGia: Number(row?.so_dang_vien_tham_gia || 0),
            soLuotNopBai: Number(row?.so_luot_nop_bai || 0),
            tyLeThamGia: Number(row?.ty_le_tham_gia || 0),
        });

        excelRow.getCell("H").numFmt = "0.00";

        excelRow.eachCell((cell) => {
            cell.border = {
                top: {style: "thin", color: {argb: "FFE5E7EB"}},
                bottom: {style: "thin", color: {argb: "FFE5E7EB"}},
                left: {style: "thin", color: {argb: "FFE5E7EB"}},
                right: {style: "thin", color: {argb: "FFE5E7EB"}},
            };
        });
    });

    return {
        buffer: await workbook.xlsx.writeBuffer(),
        fileName: buildDonViThongKeFileName(),
    };
};

exports.exportKetQuaTracNghiem = async (payload) => {
    const result = await runWorkerTask(
        "domains/thi/thi_export.worker.js",
        payload
    );

    return {
        fileName: result.fileName,
        buffer: Buffer.from(result.buffer),
    };
};

exports.exportThongKeThamGiaTheoDonVi = async (filters = {}) => {
    const result = await runWorkerTask(
        "domains/thi/thi_export_don_vi.worker.js",
        filters
    );

    return {
        fileName: result.fileName,
        buffer: Buffer.from(result.buffer),
    };
};
