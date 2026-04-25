const path = require("path");
const fs = require("fs/promises");
const repository = require("./file.repository");

const buildPublicUrl = (relativePath) => {
    const publicBaseUrl =
        (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");

    if (!publicBaseUrl) {
        return relativePath;
    }

    return `${publicBaseUrl}/${relativePath.replace(/^\/+/, "")}`;
};

const removePhysicalFile = async (relativePath) => {
    if (!relativePath) {
        return;
    }

    const absolutePath = path.resolve(process.cwd(), relativePath);
    await fs.unlink(absolutePath).catch(() => null);
};

exports.createFile = async ({
    file,
    userId,
    workspaceId,
}) => {
    if (!file || typeof file !== "object") {
        throw new Error("Không tìm thấy file tải lên");
    }

    const filePath =
        typeof file.path === "string" && file.path
            ? file.path
            : null;

    if (!filePath) {
        throw new Error("Upload không hợp lệ: server không nhận được file nhị phân");
    }

    const relative =
        filePath.split("uploads")[1];

    if (!relative) {
        throw new Error("Không xác định được đường dẫn file");
    }

    const duongDan =
        "uploads" +
        relative.replace(/\\/g, "/");

    try {
        const created = await repository.create({
            workspaceId,
            ten: file.filename || file.originalname || path.basename(filePath),
            tenGoc: file.originalname || file.filename || path.basename(filePath),
            duongDan,
            loai: file.mimetype || "application/octet-stream",
            kichThuoc: Number(file.size) || 0,
            nguoiTao: userId,
        });

        return {
            ...created,
            url: buildPublicUrl(duongDan),
        };
    } catch (error) {
        await fs.unlink(filePath).catch(() => null);
        throw error;
    }
};

exports.listFiles = async ({
    workspaceId,
    page,
    size,
    search,
}) => {
    const result = await repository.findMany({
        workspaceId,
        page,
        size,
        search,
    });

    return {
        ...result,
        data: (result.data || []).map((item) => ({
            ...item,
            url: buildPublicUrl(item.duongDan),
        })),
    };
};

exports.deleteFile = async (workspaceId, id) => {
    const existing = await repository.findById(workspaceId, id);

    if (!existing) {
        return {
            ok: true,
        };
    }

    await repository.removeById(workspaceId, id);
    await removePhysicalFile(existing.duongDan);

    return {
        ok: true,
    };
};

