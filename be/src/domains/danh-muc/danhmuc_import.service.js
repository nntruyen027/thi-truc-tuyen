const { eq } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, linhVuc, nhomCauHoi } = require("../../db/schema");
const danhMucQuery = require("./danhmuc.query");

const DATA_START_ROW = 4;

const DANH_MUC_CONFIG = {
    don_vi: {
        title: "Danh mục đơn vị",
        fileName: "mau-import-don-vi.xlsx",
        instruction: "Điền tên đơn vị từ dòng 4 trở đi. Dòng trùng tên trong cùng workspace sẽ được bỏ qua khi import.",
        example: {
            ten: "Đảng ủy phường An Cư",
            mo_ta: "Đơn vị tham gia cấp phường",
        },
        table: donVi,
        label: "Đơn vị",
    },
    linh_vuc: {
        title: "Danh mục lĩnh vực",
        fileName: "mau-import-linh-vuc.xlsx",
        instruction: "Điền tên lĩnh vực từ dòng 4 trở đi. Nên dùng tên ngắn gọn, dễ hiểu để tiện cấu hình trắc nghiệm.",
        example: {
            ten: "Luật Tổ chức chính quyền địa phương",
            mo_ta: "Lĩnh vực pháp luật về tổ chức bộ máy",
        },
        table: linhVuc,
        label: "Lĩnh vực",
    },
    nhom_cau_hoi: {
        title: "Danh mục nhóm câu hỏi",
        fileName: "mau-import-nhom-cau-hoi.xlsx",
        instruction: "Điền tên nhóm câu hỏi từ dòng 4 trở đi. Tên nhóm nên ổn định để dùng lại khi import trắc nghiệm.",
        example: {
            ten: "Nhóm cơ bản",
            mo_ta: "Nhóm câu hỏi nền tảng",
        },
        table: nhomCauHoi,
        label: "Nhóm câu hỏi",
    },
};

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeLookupKey(value) {
    return normalizeText(value).toLocaleLowerCase("vi");
}

function getConfig(tenDm) {
    const config = DANH_MUC_CONFIG[tenDm];

    if (!config) {
        throw new Error("Danh mục không hợp lệ");
    }

    return config;
}

function buildWorkbook(config) {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Thi trực tuyến";
    workbook.company = "VNPT";
    workbook.subject = config.title;
    workbook.title = config.title;
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet("Du_lieu", {
        views: [{ state: "frozen", ySplit: 3 }],
    });

    sheet.mergeCells("A1:B1");
    sheet.getCell("A1").value = config.title;
    sheet.getCell("A1").font = { size: 16, bold: true, color: { argb: "FF0F172A" } };
    sheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF7F3E8" },
    };
    sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };

    sheet.mergeCells("A2:B2");
    sheet.getCell("A2").value = config.instruction;
    sheet.getCell("A2").font = { size: 11, color: { argb: "FF475569" } };
    sheet.getCell("A2").alignment = { wrapText: true, vertical: "middle" };

    sheet.getRow(3).values = ["Tên *", "Mô tả"];
    sheet.getRow(3).height = 26;
    sheet.getRow(3).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF9A6700" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    sheet.columns = [
        { width: 36 },
        { width: 48 },
    ];

    for (let rowNumber = DATA_START_ROW; rowNumber < DATA_START_ROW + 12; rowNumber += 1) {
        const row = sheet.getRow(rowNumber);

        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin", color: { argb: "FFE2E8F0" } },
                left: { style: "thin", color: { argb: "FFE2E8F0" } },
                bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
                right: { style: "thin", color: { argb: "FFE2E8F0" } },
            };
        });
    }

    sheet.getCell(`A${DATA_START_ROW}`).value = config.example.ten;
    sheet.getCell(`B${DATA_START_ROW}`).value = config.example.mo_ta;
    sheet.getRow(DATA_START_ROW).eachCell((cell) => {
        cell.font = { italic: true, color: { argb: "FF475569" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2E8C9" },
        };
    });

    sheet.autoFilter = "A3:B3";

    return workbook.xlsx.writeBuffer();
}

function worksheetRowsToObjects(worksheet) {
    const rows = [];

    for (let rowNumber = DATA_START_ROW; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const ten = worksheet.getCell(`A${rowNumber}`).value;
        const moTa = worksheet.getCell(`B${rowNumber}`).value;

        const normalizedTen =
            ten && typeof ten === "object" && "text" in ten ? ten.text : ten;
        const normalizedMoTa =
            moTa && typeof moTa === "object" && "text" in moTa ? moTa.text : moTa;

        if (!normalizeText(normalizedTen) && !normalizeText(normalizedMoTa)) {
            continue;
        }

        rows.push({
            rowNumber,
            ten: normalizedTen,
            mo_ta: normalizedMoTa,
        });
    }

    return rows;
}

async function preloadNameMap(table) {
    const rows = await db
        .select({
            id: table.id,
            ten: table.ten,
        })
        .from(table);

    return new Map(
        rows
            .filter((row) => normalizeText(row.ten))
            .map((row) => [normalizeLookupKey(row.ten), row])
    );
}

exports.generateTemplate = async (tenDm) => {
    const config = getConfig(tenDm);

    return {
        fileName: config.fileName,
        buffer: await buildWorkbook(config),
    };
};

exports.importWorkbook = async (tenDm, filePath) => {
    const config = getConfig(tenDm);
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet("Du_lieu");
    if (!sheet) {
        throw "File mẫu không hợp lệ.";
    }

    const existingMap = await preloadNameMap(config.table);
    const rows = worksheetRowsToObjects(sheet);
    const summary = {
        created: 0,
        skipped: 0,
        errors: [],
        label: config.label,
    };

    for (const row of rows) {
        const ten = normalizeText(row.ten);
        const moTa = normalizeText(row.mo_ta);

        if (!ten) {
            summary.errors.push({
                row: row.rowNumber,
                message: "Thiếu tên danh mục.",
            });
            continue;
        }

        const lookupKey = normalizeLookupKey(ten);

        if (existingMap.has(lookupKey)) {
            summary.skipped += 1;
            continue;
        }

        await danhMucQuery.themDanhMuc(tenDm, {
            ten,
            mo_ta: moTa,
        });

        existingMap.set(lookupKey, { ten });
        summary.created += 1;
    }

    return summary;
};
