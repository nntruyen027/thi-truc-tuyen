const ExcelJS = require("exceljs");
const { eq } = require("drizzle-orm");
const db = require("../../db/client");
const { cuocThi } = require("../../db/schema");
const cuocThiQuery = require("./cuoc_thi.query");
const dotThiQuery = require("../dot-thi/dot_thi.query");
const cuocThiValidation = require("./cuoc_thi.validation");
const thiValidation = require("../thi/thi.validation");

const DATA_START_ROW = 4;
const BOOLEAN_OPTIONS = ["Có", "Không"];

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeLookupKey(value) {
    return normalizeText(value).toLocaleLowerCase("vi");
}

function isTruthyText(value) {
    const normalized = normalizeLookupKey(value);
    return ["có", "co", "yes", "y", "true", "1", "x", "mở", "mo", "bật", "bat"].includes(normalized);
}

function parseBooleanValue(value, fallback = false) {
    if (value == null || value === "") {
        return fallback;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    return isTruthyText(value);
}

function excelSerialToDate(serial) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const milliseconds = Number(serial) * 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + milliseconds);
}

function parseDateValue(value, fieldName) {
    if (!value) {
        throw `Thiếu ${fieldName}.`;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        const date = excelSerialToDate(value);
        if (!Number.isNaN(date.getTime())) {
            return date;
        }
    }

    if (typeof value === "string") {
        const normalized = value.trim();
        const ddmmyyyyMatch = normalized.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
        );

        if (ddmmyyyyMatch) {
            const [, dd, mm, yyyy, hh = "0", min = "0", ss = "0"] = ddmmyyyyMatch;
            const date = new Date(
                Number(yyyy),
                Number(mm) - 1,
                Number(dd),
                Number(hh),
                Number(min),
                Number(ss)
            );

            if (!Number.isNaN(date.getTime())) {
                return date;
            }
        }

        const isoDate = new Date(normalized);
        if (!Number.isNaN(isoDate.getTime())) {
            return isoDate;
        }
    }

    throw `${fieldName} không hợp lệ. Dùng định dạng DD/MM/YYYY HH:mm hoặc kiểu ngày của Excel.`;
}

function parseIntegerValue(value, fieldName, { min = 0 } = {}) {
    const normalized = Number(value);

    if (!Number.isInteger(normalized) || normalized < min) {
        throw `${fieldName} phải là số nguyên lớn hơn hoặc bằng ${min}.`;
    }

    return normalized;
}

function addTemplateSheet(workbook, {
    name,
    title,
    instruction,
    columns,
    exampleRows = [],
    booleanColumnIndexes = [],
}) {
    const sheet = workbook.addWorksheet(name, {
        views: [{ state: "frozen", ySplit: 3 }],
    });

    sheet.mergeCells(1, 1, 1, columns.length);
    sheet.getCell("A1").value = title;
    sheet.getCell("A1").font = { size: 16, bold: true, color: { argb: "FF0F172A" } };
    sheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEAF3FF" },
    };
    sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };

    sheet.mergeCells(2, 1, 2, columns.length);
    sheet.getCell("A2").value = instruction;
    sheet.getCell("A2").font = { size: 11, color: { argb: "FF475569" } };
    sheet.getCell("A2").alignment = { wrapText: true, vertical: "middle" };

    const headerRow = sheet.getRow(3);
    columns.forEach((column, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = column.label;
        sheet.getColumn(index + 1).width = column.width || 24;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1948BE" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    for (let rowNumber = DATA_START_ROW; rowNumber < DATA_START_ROW + 12; rowNumber += 1) {
        const row = sheet.getRow(rowNumber);
        columns.forEach((column, index) => {
            const cell = row.getCell(index + 1);
            cell.border = {
                top: { style: "thin", color: { argb: "FFE2E8F0" } },
                left: { style: "thin", color: { argb: "FFE2E8F0" } },
                bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
                right: { style: "thin", color: { argb: "FFE2E8F0" } },
            };
        });
    }

    exampleRows.forEach((exampleRow, exampleIndex) => {
        const row = sheet.getRow(DATA_START_ROW + exampleIndex);

        columns.forEach((column, index) => {
            const cell = row.getCell(index + 1);
            cell.value = exampleRow[column.key] ?? "";
            cell.font = { italic: true, color: { argb: "FF475569" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFDCEBFF" },
            };
        });
    });

    booleanColumnIndexes.forEach((columnIndex) => {
        for (let rowNumber = DATA_START_ROW; rowNumber <= 200; rowNumber += 1) {
            sheet.getCell(rowNumber, columnIndex).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [`"${BOOLEAN_OPTIONS.join(",")}"`],
                showErrorMessage: true,
                errorTitle: "Giá trị không hợp lệ",
                error: "Vui lòng chọn Có hoặc Không.",
            };
        }
    });

    sheet.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: 3, column: columns.length },
    };
}

function addGuideSheet(workbook) {
    const sheet = workbook.addWorksheet("Huong_dan");
    sheet.columns = [{ width: 24 }, { width: 88 }];
    sheet.mergeCells("A1:B1");
    sheet.getCell("A1").value = "MẪU NHẬP CUỘC THI VÀ ĐỢT THI";
    sheet.getCell("A1").font = { size: 18, bold: true, color: { argb: "FF0F172A" } };
    sheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEAF3FF" },
    };
    sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

    [
        ["Mục đích", "Dùng để nhập nhanh cuộc thi và các đợt thi cho workspace hiện tại."],
        ["Cách nhập", "Điền dữ liệu từ dòng 4 trở đi ở từng sheet. Không đổi tên sheet và không xóa hàng tiêu đề."],
        ["Ngày giờ", "Dùng định dạng DD/MM/YYYY HH:mm hoặc nhập trực tiếp kiểu ngày của Excel."],
        ["Liên kết sheet", "Ở sheet Đợt thi, cột Tên cuộc thi phải trùng với tên đã nhập ở sheet Cuộc thi."],
        ["Kết quả import", "Dữ liệu trùng sẽ được bỏ qua. Dòng lỗi sẽ được trả về để chỉnh lại rồi import tiếp."],
    ].forEach((row, index) => {
        const targetRow = sheet.getRow(index + 3);
        targetRow.getCell(1).value = row[0];
        targetRow.getCell(2).value = row[1];
        targetRow.getCell(1).font = { bold: true, color: { argb: "FF1948BE" } };
        targetRow.getCell(2).alignment = { wrapText: true };
    });
}

async function preloadContestMap(workspaceId) {
    const rows = await db
        .select({
            id: cuocThi.id,
            ten: cuocThi.ten,
        })
        .from(cuocThi)
        .where(eq(cuocThi.workspaceId, Number(workspaceId)));

    return new Map(
        rows
            .filter((row) => normalizeText(row.ten))
            .map((row) => [normalizeLookupKey(row.ten), row])
    );
}

function worksheetRowsToObjects(worksheet, columns) {
    const rows = [];

    for (let rowNumber = DATA_START_ROW; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const item = {};
        let hasValue = false;

        columns.forEach((column, index) => {
            const cellValue = row.getCell(index + 1).value;
            const value =
                cellValue && typeof cellValue === "object" && "text" in cellValue
                    ? cellValue.text
                    : cellValue;

            if (value != null && String(value).trim() !== "") {
                hasValue = true;
            }

            item[column.key] = value;
        });

        if (!hasValue) {
            continue;
        }

        rows.push({
            rowNumber,
            value: item,
        });
    }

    return rows;
}

async function importCuocThiSheet({ workspaceId, rows, contestsByName, summary }) {
    for (const item of rows) {
        try {
            const payload = cuocThiValidation.normalizeCuocThiPayload({
                ten: item.value.ten,
                mo_ta: normalizeText(item.value.mo_ta),
                thoi_gian_bat_dau: parseDateValue(item.value.thoi_gian_bat_dau, "thời gian bắt đầu cuộc thi"),
                thoi_gian_ket_thuc: parseDateValue(item.value.thoi_gian_ket_thuc, "thời gian kết thúc cuộc thi"),
                trang_thai: parseBooleanValue(item.value.trang_thai),
                cho_phep_xem_lich_su: parseBooleanValue(item.value.cho_phep_xem_lich_su),
                cho_phep_xem_lai_dap_an: parseBooleanValue(item.value.cho_phep_xem_lai_dap_an),
                co_tu_luan: parseBooleanValue(item.value.co_tu_luan),
            });

            const lookupKey = normalizeLookupKey(payload.ten);

            if (contestsByName.has(lookupKey)) {
                summary.skipped.cuoc_thi += 1;
                continue;
            }

            const created = await cuocThiQuery.themCuocThi(workspaceId, payload);
            contestsByName.set(lookupKey, created);
            summary.created.cuoc_thi += 1;
        } catch (error) {
            summary.errors.push({
                sheet: "Cuộc thi",
                row: item.rowNumber,
                message: String(error),
            });
        }
    }
}

async function importDotThiSheet({ workspaceId, rows, contestsByName, summary }) {
    for (const item of rows) {
        try {
            const tenCuocThi = normalizeText(item.value.ten_cuoc_thi);

            if (!tenCuocThi) {
                throw "Thiếu tên cuộc thi tham chiếu.";
            }

            const contest = contestsByName.get(normalizeLookupKey(tenCuocThi));

            if (!contest?.id) {
                throw `Không tìm thấy cuộc thi "${tenCuocThi}".`;
            }

            const payload = thiValidation.normalizeDotThiPayload({
                ten: item.value.ten,
                mo_ta: normalizeText(item.value.mo_ta),
                so_lan_tham_gia_toi_da: parseIntegerValue(item.value.so_lan_tham_gia_toi_da, "Số lần thi tối đa", { min: 1 }),
                thoi_gian_thi: parseIntegerValue(item.value.thoi_gian_thi, "Thời gian thi", { min: 1 }),
                ty_le_danh_gia_dat: parseIntegerValue(item.value.ty_le_danh_gia_dat, "Tỷ lệ đạt", { min: 0 }),
                thoi_gian_bat_dau: parseDateValue(item.value.thoi_gian_bat_dau, "thời gian bắt đầu đợt thi"),
                thoi_gian_ket_thuc: parseDateValue(item.value.thoi_gian_ket_thuc, "thời gian kết thúc đợt thi"),
                co_tron_cau_hoi: parseBooleanValue(item.value.co_tron_cau_hoi),
                cho_phep_luu_bai: parseBooleanValue(item.value.cho_phep_luu_bai),
                du_doan: parseBooleanValue(item.value.du_doan),
                trang_thai: parseBooleanValue(item.value.trang_thai),
            });

            await thiValidation.ensureDotThiWithinCuocThi({
                workspaceId,
                cuocThiId: contest.id,
                thoiGianBatDau: payload.thoi_gian_bat_dau,
                thoiGianKetThuc: payload.thoi_gian_ket_thuc,
            });

            await dotThiQuery.themDotThi(
                workspaceId,
                contest.id,
                payload.ten,
                payload.mo_ta,
                payload.so_lan_tham_gia_toi_da,
                payload.thoi_gian_thi,
                payload.ty_le_danh_gia_dat,
                payload.thoi_gian_bat_dau,
                payload.thoi_gian_ket_thuc,
                payload.co_tron_cau_hoi,
                payload.cho_phep_luu_bai,
                payload.du_doan,
                payload.trang_thai
            );

            summary.created.dot_thi += 1;
        } catch (error) {
            const message = String(error);

            if (message.includes("đã tồn tại")) {
                summary.skipped.dot_thi += 1;
                continue;
            }

            summary.errors.push({
                sheet: "Đợt thi",
                row: item.rowNumber,
                message,
            });
        }
    }
}

exports.generateImportWorkbook = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Thi trực tuyến";
    workbook.company = "VNPT";
    workbook.subject = "Mẫu nhập cuộc thi và đợt thi";
    workbook.title = "Mẫu nhập cuộc thi và đợt thi";
    workbook.created = new Date();
    workbook.modified = new Date();

    addGuideSheet(workbook);

    addTemplateSheet(workbook, {
        name: "Cuoc_thi",
        title: "Danh sách cuộc thi",
        instruction: "Cột ngày giờ dùng định dạng DD/MM/YYYY HH:mm. Các cột Có/Không hãy dùng dropdown để chọn.",
        columns: [
            { key: "ten", label: "Tên cuộc thi *", width: 30 },
            { key: "mo_ta", label: "Mô tả", width: 48 },
            { key: "thoi_gian_bat_dau", label: "Thời gian bắt đầu *", width: 22 },
            { key: "thoi_gian_ket_thuc", label: "Thời gian kết thúc *", width: 22 },
            { key: "trang_thai", label: "Mở cuộc thi", width: 16 },
            { key: "cho_phep_xem_lich_su", label: "Công bố kết quả", width: 18 },
            { key: "cho_phep_xem_lai_dap_an", label: "Cho xem lại đáp án", width: 20 },
            { key: "co_tu_luan", label: "Có tự luận", width: 14 },
        ],
        booleanColumnIndexes: [5, 6, 7, 8],
        exampleRows: [{
            ten: "Cuộc thi tìm hiểu pháp luật năm 2026",
            mo_ta: "Cuộc thi trực tuyến dành cho cán bộ, đảng viên và Nhân dân.",
            thoi_gian_bat_dau: "01/05/2026 08:00",
            thoi_gian_ket_thuc: "01/06/2026 23:59",
            trang_thai: "Có",
            cho_phep_xem_lich_su: "Có",
            cho_phep_xem_lai_dap_an: "Không",
            co_tu_luan: "Không",
        }],
    });

    addTemplateSheet(workbook, {
        name: "Dot_thi",
        title: "Danh sách đợt thi",
        instruction: "Tên cuộc thi phải trùng với sheet Cuoc_thi. Thời gian đợt thi phải nằm trong khoảng thời gian của cuộc thi tương ứng.",
        columns: [
            { key: "ten_cuoc_thi", label: "Tên cuộc thi *", width: 30 },
            { key: "ten", label: "Tên đợt thi *", width: 28 },
            { key: "mo_ta", label: "Mô tả", width: 44 },
            { key: "so_lan_tham_gia_toi_da", label: "Số lần thi tối đa *", width: 18 },
            { key: "thoi_gian_thi", label: "Thời gian thi (phút) *", width: 20 },
            { key: "ty_le_danh_gia_dat", label: "Tỷ lệ đạt (%) *", width: 18 },
            { key: "thoi_gian_bat_dau", label: "Thời gian bắt đầu *", width: 22 },
            { key: "thoi_gian_ket_thuc", label: "Thời gian kết thúc *", width: 22 },
            { key: "co_tron_cau_hoi", label: "Trộn câu hỏi", width: 16 },
            { key: "cho_phep_luu_bai", label: "Cho phép lưu bài", width: 18 },
            { key: "du_doan", label: "Cho phép dự đoán", width: 18 },
            { key: "trang_thai", label: "Mở đợt thi", width: 14 },
        ],
        booleanColumnIndexes: [9, 10, 11, 12],
        exampleRows: [{
            ten_cuoc_thi: "Cuộc thi tìm hiểu pháp luật năm 2026",
            ten: "Đợt thi vòng 1",
            mo_ta: "Đợt thi dành cho toàn bộ thí sinh",
            so_lan_tham_gia_toi_da: 1,
            thoi_gian_thi: 30,
            ty_le_danh_gia_dat: 60,
            thoi_gian_bat_dau: "01/05/2026 08:00",
            thoi_gian_ket_thuc: "15/05/2026 23:59",
            co_tron_cau_hoi: "Có",
            cho_phep_luu_bai: "Không",
            du_doan: "Không",
            trang_thai: "Có",
        }],
    });

    return workbook.xlsx.writeBuffer();
};

exports.importWorkbook = async (workspaceId, filePath) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const summary = {
        created: {
            cuoc_thi: 0,
            dot_thi: 0,
        },
        skipped: {
            cuoc_thi: 0,
            dot_thi: 0,
        },
        errors: [],
    };

    const contestsByName = await preloadContestMap(workspaceId);

    await importCuocThiSheet({
        workspaceId,
        rows: worksheetRowsToObjects(
            workbook.getWorksheet("Cuoc_thi"),
            [
                { key: "ten" },
                { key: "mo_ta" },
                { key: "thoi_gian_bat_dau" },
                { key: "thoi_gian_ket_thuc" },
                { key: "trang_thai" },
                { key: "cho_phep_xem_lich_su" },
                { key: "cho_phep_xem_lai_dap_an" },
                { key: "co_tu_luan" },
            ]
        ),
        contestsByName,
        summary,
    });

    await importDotThiSheet({
        workspaceId,
        rows: worksheetRowsToObjects(
            workbook.getWorksheet("Dot_thi"),
            [
                { key: "ten_cuoc_thi" },
                { key: "ten" },
                { key: "mo_ta" },
                { key: "so_lan_tham_gia_toi_da" },
                { key: "thoi_gian_thi" },
                { key: "ty_le_danh_gia_dat" },
                { key: "thoi_gian_bat_dau" },
                { key: "thoi_gian_ket_thuc" },
                { key: "co_tron_cau_hoi" },
                { key: "cho_phep_luu_bai" },
                { key: "du_doan" },
                { key: "trang_thai" },
            ]
        ),
        contestsByName,
        summary,
    });

    return summary;
};
