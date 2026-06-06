const ExcelJS = require("exceljs");
const query = require("./trac_nghiem.query");

const DATA_START_ROW = 6;
const SHEET_NAME = "Du_lieu";

function normalizeCellValue(value) {
    if (value && typeof value === "object" && "text" in value) {
        return value.text;
    }

    return value;
}

function buildWorkbook() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Thi trực tuyến";
    workbook.company = "VNPT";
    workbook.subject = "Mẫu import câu hỏi trắc nghiệm";
    workbook.title = "Mẫu import câu hỏi trắc nghiệm";
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(SHEET_NAME, {
        views: [{ state: "frozen", ySplit: 4 }],
    });

    sheet.mergeCells("A1:L1");
    sheet.getCell("A1").value = "Import câu hỏi trắc nghiệm";
    sheet.getCell("A1").font = { size: 16, bold: true, color: { argb: "FF0F172A" } };
    sheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8EEFf" },
    };

    sheet.mergeCells("A2:L2");
    sheet.getCell("A2").value =
        "Điền dữ liệu từ dòng 6. Dòng trùng theo ID lĩnh vực + ID nhóm + loại câu hỏi + nội dung câu hỏi sẽ được bỏ qua.";
    sheet.getCell("A2").font = { size: 11, color: { argb: "FF475569" } };
    sheet.getCell("A2").alignment = { wrapText: true, vertical: "middle" };

    sheet.mergeCells("A3:L3");
    sheet.getCell("A3").value =
        "Loại câu hỏi dùng: chon_mot, chon_nhieu, dien_tu. Với chon_mot điền cột I bằng A/B/C/D. Với chon_nhieu điền cột J dạng A,B hoặc 1,2. Với dien_tu điền cột K.";
    sheet.getCell("A3").font = { size: 11, color: { argb: "FF475569" } };
    sheet.getCell("A3").alignment = { wrapText: true, vertical: "middle" };

    sheet.getRow(4).values = [
        "Loại câu hỏi *",
        "Lĩnh vực ID *",
        "Nhóm ID *",
        "Câu hỏi *",
        "Câu A",
        "Câu B",
        "Câu C",
        "Câu D",
        "Đáp án",
        "Đáp án nhiều",
        "Đáp án điền từ",
        "Điểm mặc định *",
    ];
    sheet.getRow(4).height = 26;
    sheet.getRow(4).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1948BE" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    sheet.columns = [
        { width: 18 },
        { width: 14 },
        { width: 14 },
        { width: 42 },
        { width: 28 },
        { width: 28 },
        { width: 28 },
        { width: 28 },
        { width: 14 },
        { width: 18 },
        { width: 28 },
        { width: 16 },
    ];

    const exampleRowNumber = 5;
    sheet.getCell(`A${exampleRowNumber}`).value = "Ví dụ";
    sheet.getCell(`B${exampleRowNumber}`).value = "1";
    sheet.getCell(`C${exampleRowNumber}`).value = "1";
    sheet.getCell(`D${exampleRowNumber}`).value = "Ví dụ câu hỏi chọn 1";
    sheet.getCell(`E${exampleRowNumber}`).value = "Phương án A";
    sheet.getCell(`F${exampleRowNumber}`).value = "Phương án B";
    sheet.getCell(`G${exampleRowNumber}`).value = "Phương án C";
    sheet.getCell(`H${exampleRowNumber}`).value = "Phương án D";
    sheet.getCell(`I${exampleRowNumber}`).value = "A";
    sheet.getCell(`L${exampleRowNumber}`).value = "1";

    const exampleRow = sheet.getRow(exampleRowNumber);
    exampleRow.eachCell((cell) => {
        cell.font = { italic: true, color: { argb: "FF475569" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
        };
    });

    return workbook.xlsx.writeBuffer();
}

function worksheetRowsToObjects(worksheet) {
    const rows = [];

    for (let rowNumber = DATA_START_ROW; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = {
            rowNumber,
            loai_cau_hoi: normalizeCellValue(worksheet.getCell(`A${rowNumber}`).value),
            linh_vuc_id: normalizeCellValue(worksheet.getCell(`B${rowNumber}`).value),
            nhom_id: normalizeCellValue(worksheet.getCell(`C${rowNumber}`).value),
            cau_hoi: normalizeCellValue(worksheet.getCell(`D${rowNumber}`).value),
            cau_a: normalizeCellValue(worksheet.getCell(`E${rowNumber}`).value),
            cau_b: normalizeCellValue(worksheet.getCell(`F${rowNumber}`).value),
            cau_c: normalizeCellValue(worksheet.getCell(`G${rowNumber}`).value),
            cau_d: normalizeCellValue(worksheet.getCell(`H${rowNumber}`).value),
            dap_an: normalizeCellValue(worksheet.getCell(`I${rowNumber}`).value),
            dap_an_nhieu: normalizeCellValue(worksheet.getCell(`J${rowNumber}`).value),
            dap_an_text: normalizeCellValue(worksheet.getCell(`K${rowNumber}`).value),
            diem: normalizeCellValue(worksheet.getCell(`L${rowNumber}`).value),
        };

        const hasValue = Object.entries(row).some(([key, value]) => key !== "rowNumber" && String(value ?? "").trim());

        if (hasValue) {
            rows.push(row);
        }
    }

    return rows;
}

exports.generateTemplate = async () => {
    return {
        fileName: "mau-import-trac-nghiem.xlsx",
        buffer: await buildWorkbook(),
    };
};

exports.importWorkbook = async (filePath) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(SHEET_NAME);
    if (!sheet) {
        throw "File mẫu không hợp lệ.";
    }

    const rows = worksheetRowsToObjects(sheet);
    const summary = {
        created: 0,
        skipped: 0,
        errors: [],
    };

    for (const row of rows) {
        try {
            const result = await query.themTracNghiemImport({
                "Loại câu hỏi": row.loai_cau_hoi,
                "Lĩnh vực ID": row.linh_vuc_id,
                "Nhóm ID": row.nhom_id,
                "Câu hỏi": row.cau_hoi,
                "Câu A": row.cau_a,
                "Câu B": row.cau_b,
                "Câu C": row.cau_c,
                "Câu D": row.cau_d,
                "Đáp án": row.dap_an,
                "Đáp án nhiều": row.dap_an_nhieu,
                "Đáp án điền từ": row.dap_an_text,
                "Điểm mặc định": row.diem,
            });

            if (result.status === "skipped") {
                summary.skipped += 1;
                continue;
            }

            summary.created += 1;
        } catch (error) {
            summary.errors.push({
                row: row.rowNumber,
                message: typeof error === "string" ? error : error?.message || "Có lỗi xảy ra",
            });
        }
    }

    return summary;
};
