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

function buildFileName({scopeType, scopeId, top}) {
    return `ket-qua-trac-nghiem-${scopeType}-${scopeId}-top-${top}.xlsx`;
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

    const worksheet = workbook.addWorksheet("Ket qua trac nghiem", {
        views: [{state: "frozen", ySplit: 5}],
    });

    worksheet.columns = [
        {header: "STT", key: "stt", width: 8},
        {header: "Thi sinh", key: "thiSinh", width: 32},
        {header: "So dien thoai", key: "soDienThoai", width: 20},
        {header: "Diem", key: "diem", width: 12},
        {header: "Thoi gian lam bai", key: "thoiGian", width: 18},
        {header: "So du doan", key: "soDuDoan", width: 14},
        {header: "Sai so du doan", key: "saiSo", width: 16},
    ];

    worksheet.mergeCells("A1:G1");
    worksheet.getCell("A1").value = "KET QUA THI TRAC NGHIEM";
    worksheet.getCell("A1").font = {
        bold: true,
        size: 16,
    };
    worksheet.getCell("A1").alignment = {
        horizontal: "center",
    };

    createHeaderRow(
        worksheet,
        "Pham vi",
        scopeType === "dot-thi" ? `Dot thi #${scopeId}` : `Cuoc thi #${scopeId}`
    );
    createHeaderRow(worksheet, "So luong xep hang", top);
    createHeaderRow(worksheet, "Thoi gian xuat", formatDateTime(new Date()));

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
            diem: row?.diem ?? "",
            thoiGian: formatDuration(row?.thoiGian ?? row?.thoi_gian),
            soDuDoan: row?.soDuDoan ?? row?.so_du_doan ?? "",
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
