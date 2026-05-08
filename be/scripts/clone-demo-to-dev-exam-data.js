require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

function normalizeText(value) {
    return String(value || "").trim();
}

function keyOf(...parts) {
    return parts.map((item) => String(item ?? "")).join("||");
}

async function getWorkspaceByCode(client, code) {
    const result = await client.query(
        `
            select id, code, ten
            from platform.workspaces
            where code = $1
            limit 1
        `,
        [code]
    );

    return result.rows[0] || null;
}

async function cloneDanhMuc(client, sourceWorkspaceId, targetWorkspaceId) {
    const linhVucMap = new Map();
    const nhomMap = new Map();

    const sourceLinhVuc = await client.query(
        `
            select id, ten, mo_ta
            from dm_chung.linh_vuc
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetLinhVuc = await client.query(
        `
            select id, ten, mo_ta
            from dm_chung.linh_vuc
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetLinhVucByKey = new Map(
        targetLinhVuc.rows.map((row) => [
            keyOf(normalizeText(row.ten).toLowerCase(), normalizeText(row.mo_ta)),
            row,
        ])
    );

    for (const row of sourceLinhVuc.rows) {
        const lookupKey = keyOf(
            normalizeText(row.ten).toLowerCase(),
            normalizeText(row.mo_ta)
        );

        let targetRow = targetLinhVucByKey.get(lookupKey);

        if (!targetRow) {
            const inserted = await client.query(
                `
                    insert into dm_chung.linh_vuc (workspace_id, ten, mo_ta)
                    values ($1, $2, $3)
                    returning id, ten, mo_ta
                `,
                [targetWorkspaceId, row.ten, row.mo_ta]
            );

            targetRow = inserted.rows[0];
            targetLinhVucByKey.set(lookupKey, targetRow);
        }

        linhVucMap.set(Number(row.id), Number(targetRow.id));
    }

    const sourceNhom = await client.query(
        `
            select id, ten, mo_ta
            from dm_chung.nhom_cau_hoi
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetNhom = await client.query(
        `
            select id, ten, mo_ta
            from dm_chung.nhom_cau_hoi
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetNhomByKey = new Map(
        targetNhom.rows.map((row) => [
            keyOf(normalizeText(row.ten).toLowerCase(), normalizeText(row.mo_ta)),
            row,
        ])
    );

    for (const row of sourceNhom.rows) {
        const lookupKey = keyOf(
            normalizeText(row.ten).toLowerCase(),
            normalizeText(row.mo_ta)
        );

        let targetRow = targetNhomByKey.get(lookupKey);

        if (!targetRow) {
            const inserted = await client.query(
                `
                    insert into dm_chung.nhom_cau_hoi (workspace_id, ten, mo_ta)
                    values ($1, $2, $3)
                    returning id, ten, mo_ta
                `,
                [targetWorkspaceId, row.ten, row.mo_ta]
            );

            targetRow = inserted.rows[0];
            targetNhomByKey.set(lookupKey, targetRow);
        }

        nhomMap.set(Number(row.id), Number(targetRow.id));
    }

    return { linhVucMap, nhomMap };
}

async function cloneTracNghiem(client, sourceWorkspaceId, targetWorkspaceId, maps) {
    const questionMap = new Map();

    const sourceRows = await client.query(
        `
            select id, linh_vuc_id, nhom_id, cau_hoi, caua, caub, cauc, caud, dapan, diem
            from thi.trac_nghiem
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetRows = await client.query(
        `
            select id, linh_vuc_id, nhom_id, cau_hoi, caua, caub, cauc, caud, dapan, diem
            from thi.trac_nghiem
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetByKey = new Map();

    for (const row of targetRows.rows) {
        targetByKey.set(
            keyOf(
                row.linh_vuc_id || "",
                row.nhom_id || "",
                normalizeText(row.cau_hoi),
                normalizeText(row.caua),
                normalizeText(row.caub),
                normalizeText(row.cauc),
                normalizeText(row.caud),
                row.dapan ?? "",
                row.diem ?? ""
            ),
            row
        );
    }

    for (const row of sourceRows.rows) {
        const targetLinhVucId = row.linh_vuc_id ? maps.linhVucMap.get(Number(row.linh_vuc_id)) : null;
        const targetNhomId = row.nhom_id ? maps.nhomMap.get(Number(row.nhom_id)) : null;
        const lookupKey = keyOf(
            targetLinhVucId || "",
            targetNhomId || "",
            normalizeText(row.cau_hoi),
            normalizeText(row.caua),
            normalizeText(row.caub),
            normalizeText(row.cauc),
            normalizeText(row.caud),
            row.dapan ?? "",
            row.diem ?? ""
        );

        let targetRow = targetByKey.get(lookupKey);

        if (!targetRow) {
            const inserted = await client.query(
                `
                    insert into thi.trac_nghiem (
                        workspace_id, linh_vuc_id, nhom_id, cau_hoi, caua, caub, cauc, caud, dapan, diem
                    )
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    returning id, linh_vuc_id, nhom_id, cau_hoi, caua, caub, cauc, caud, dapan, diem
                `,
                [
                    targetWorkspaceId,
                    targetLinhVucId,
                    targetNhomId,
                    row.cau_hoi,
                    row.caua,
                    row.caub,
                    row.cauc,
                    row.caud,
                    row.dapan,
                    row.diem,
                ]
            );

            targetRow = inserted.rows[0];
            targetByKey.set(lookupKey, targetRow);
        }

        questionMap.set(Number(row.id), Number(targetRow.id));
    }

    return { questionMap };
}

async function cloneCuocThiAndDotThi(client, sourceWorkspaceId, targetWorkspaceId, maps) {
    const contestMap = new Map();
    const dotThiMap = new Map();

    const sourceContests = await client.query(
        `
            select id, ten, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai,
                   cho_phep_xem_lich_su, cho_phep_xem_lai_dap_an, co_tu_luan
            from thi.cuoc_thi
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetContests = await client.query(
        `
            select id, ten, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai,
                   cho_phep_xem_lich_su, cho_phep_xem_lai_dap_an, co_tu_luan
            from thi.cuoc_thi
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetContestByKey = new Map(
        targetContests.rows.map((row) => [
            keyOf(
                normalizeText(row.ten).toLowerCase(),
                row.thoi_gian_bat_dau?.toISOString?.() || "",
                row.thoi_gian_ket_thuc?.toISOString?.() || ""
            ),
            row,
        ])
    );

    for (const row of sourceContests.rows) {
        const lookupKey = keyOf(
            normalizeText(row.ten).toLowerCase(),
            row.thoi_gian_bat_dau?.toISOString?.() || "",
            row.thoi_gian_ket_thuc?.toISOString?.() || ""
        );

        let targetRow = targetContestByKey.get(lookupKey);

        if (!targetRow) {
            const inserted = await client.query(
                `
                    insert into thi.cuoc_thi (
                        workspace_id, ten, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai,
                        cho_phep_xem_lich_su, cho_phep_xem_lai_dap_an, co_tu_luan
                    )
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    returning id, ten, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai,
                              cho_phep_xem_lich_su, cho_phep_xem_lai_dap_an, co_tu_luan
                `,
                [
                    targetWorkspaceId,
                    row.ten,
                    row.mo_ta,
                    row.thoi_gian_bat_dau,
                    row.thoi_gian_ket_thuc,
                    row.trang_thai,
                    row.cho_phep_xem_lich_su,
                    row.cho_phep_xem_lai_dap_an,
                    row.co_tu_luan,
                ]
            );

            targetRow = inserted.rows[0];
            targetContestByKey.set(lookupKey, targetRow);
        }

        contestMap.set(Number(row.id), Number(targetRow.id));
    }

    const sourceDots = await client.query(
        `
            select id, cuoc_thi_id, ten, mo_ta, so_lan_tham_gia_toi_da, thoi_gian_thi,
                   ty_le_danh_gia_dat, thoi_gian_bat_dau, thoi_gian_ket_thuc, co_tron_cau_hoi,
                   cho_phep_luu_bai, du_doan, trang_thai
            from thi.dot_thi
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetDots = await client.query(
        `
            select id, cuoc_thi_id, ten, mo_ta, so_lan_tham_gia_toi_da, thoi_gian_thi,
                   ty_le_danh_gia_dat, thoi_gian_bat_dau, thoi_gian_ket_thuc, co_tron_cau_hoi,
                   cho_phep_luu_bai, du_doan, trang_thai
            from thi.dot_thi
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetDotByKey = new Map(
        targetDots.rows.map((row) => [
            keyOf(
                row.cuoc_thi_id,
                normalizeText(row.ten).toLowerCase(),
                row.thoi_gian_bat_dau?.toISOString?.() || "",
                row.thoi_gian_ket_thuc?.toISOString?.() || ""
            ),
            row,
        ])
    );

    for (const row of sourceDots.rows) {
        const targetContestId = contestMap.get(Number(row.cuoc_thi_id));
        const lookupKey = keyOf(
            targetContestId,
            normalizeText(row.ten).toLowerCase(),
            row.thoi_gian_bat_dau?.toISOString?.() || "",
            row.thoi_gian_ket_thuc?.toISOString?.() || ""
        );

        let targetRow = targetDotByKey.get(lookupKey);

        if (!targetRow) {
            const inserted = await client.query(
                `
                    insert into thi.dot_thi (
                        workspace_id, cuoc_thi_id, ten, mo_ta, so_lan_tham_gia_toi_da, thoi_gian_thi,
                        ty_le_danh_gia_dat, thoi_gian_bat_dau, thoi_gian_ket_thuc, co_tron_cau_hoi,
                        cho_phep_luu_bai, du_doan, trang_thai
                    )
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    returning id, cuoc_thi_id, ten, thoi_gian_bat_dau, thoi_gian_ket_thuc
                `,
                [
                    targetWorkspaceId,
                    targetContestId,
                    row.ten,
                    row.mo_ta,
                    row.so_lan_tham_gia_toi_da,
                    row.thoi_gian_thi,
                    row.ty_le_danh_gia_dat,
                    row.thoi_gian_bat_dau,
                    row.thoi_gian_ket_thuc,
                    row.co_tron_cau_hoi,
                    row.cho_phep_luu_bai,
                    row.du_doan,
                    row.trang_thai,
                ]
            );

            targetRow = inserted.rows[0];
            targetDotByKey.set(lookupKey, targetRow);
        }

        dotThiMap.set(Number(row.id), Number(targetRow.id));
    }

    const sourceDotQuestionConfigs = await client.query(
        `
            select id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
            from thi.trac_nghiem_dot_thi
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetDotQuestionConfigs = await client.query(
        `
            select id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
            from thi.trac_nghiem_dot_thi
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetConfigByKey = new Map(
        targetDotQuestionConfigs.rows.map((row) => [
            keyOf(row.dot_thi_id, row.linh_vuc_id || "", row.nhom_id || "", row.so_luong || ""),
            row,
        ])
    );

    for (const row of sourceDotQuestionConfigs.rows) {
        const targetDotId = dotThiMap.get(Number(row.dot_thi_id));
        const targetLinhVucId = row.linh_vuc_id ? maps.linhVucMap.get(Number(row.linh_vuc_id)) : null;
        const targetNhomId = row.nhom_id ? maps.nhomMap.get(Number(row.nhom_id)) : null;
        const lookupKey = keyOf(
            targetDotId,
            targetLinhVucId || "",
            targetNhomId || "",
            row.so_luong || ""
        );

        if (targetConfigByKey.has(lookupKey)) {
            continue;
        }

        const inserted = await client.query(
            `
                insert into thi.trac_nghiem_dot_thi (
                    workspace_id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
                )
                values ($1, $2, $3, $4, $5)
                returning id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
            `,
            [targetWorkspaceId, targetDotId, targetLinhVucId, targetNhomId, row.so_luong]
        );

        targetConfigByKey.set(lookupKey, inserted.rows[0]);
    }

    const sourceTuLuan = await client.query(
        `
            select id, dot_thi_id, cau_hoi, goi_y
            from thi.tu_luan_dot_thi
            where workspace_id = $1
            order by id asc
        `,
        [sourceWorkspaceId]
    );

    const targetTuLuan = await client.query(
        `
            select id, dot_thi_id, cau_hoi, goi_y
            from thi.tu_luan_dot_thi
            where workspace_id = $1
        `,
        [targetWorkspaceId]
    );

    const targetTuLuanByKey = new Map(
        targetTuLuan.rows.map((row) => [
            keyOf(row.dot_thi_id, normalizeText(row.cau_hoi), normalizeText(row.goi_y)),
            row,
        ])
    );

    for (const row of sourceTuLuan.rows) {
        const targetDotId = dotThiMap.get(Number(row.dot_thi_id));
        const lookupKey = keyOf(
            targetDotId,
            normalizeText(row.cau_hoi),
            normalizeText(row.goi_y)
        );

        if (targetTuLuanByKey.has(lookupKey)) {
            continue;
        }

        const inserted = await client.query(
            `
                insert into thi.tu_luan_dot_thi (
                    workspace_id, dot_thi_id, cau_hoi, goi_y
                )
                values ($1, $2, $3, $4)
                returning id, dot_thi_id, cau_hoi, goi_y
            `,
            [targetWorkspaceId, targetDotId, row.cau_hoi, row.goi_y]
        );

        targetTuLuanByKey.set(lookupKey, inserted.rows[0]);
    }

    return { contestMap, dotThiMap };
}

async function main() {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const sourceWorkspace = await getWorkspaceByCode(client, "demo");
        const targetWorkspace = await getWorkspaceByCode(client, "dev");

        if (!sourceWorkspace) {
            throw new Error("Không tìm thấy workspace demo.");
        }

        if (!targetWorkspace) {
            throw new Error("Không tìm thấy workspace dev.");
        }

        const danhMucMaps = await cloneDanhMuc(
            client,
            Number(sourceWorkspace.id),
            Number(targetWorkspace.id)
        );

        const tracNghiemMaps = await cloneTracNghiem(
            client,
            Number(sourceWorkspace.id),
            Number(targetWorkspace.id),
            danhMucMaps
        );

        const contestMaps = await cloneCuocThiAndDotThi(
            client,
            Number(sourceWorkspace.id),
            Number(targetWorkspace.id),
            {
                ...danhMucMaps,
                ...tracNghiemMaps,
            }
        );

        await client.query("commit");

        console.log("Clone bổ sung từ demo sang dev thành công.");
        console.log(JSON.stringify({
            sourceWorkspace,
            targetWorkspace,
            linhVucMapped: danhMucMaps.linhVucMap.size,
            nhomMapped: danhMucMaps.nhomMap.size,
            tracNghiemMapped: tracNghiemMaps.questionMap.size,
            cuocThiMapped: contestMaps.contestMap.size,
            dotThiMapped: contestMaps.dotThiMap.size,
        }, null, 2));
    } catch (error) {
        await client.query("rollback");
        console.error(error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

void main();
