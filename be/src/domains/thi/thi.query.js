const { and, asc, eq, inArray, sql } = require("drizzle-orm");
const db = require("../../db/client");
const {
    baiThi,
    baiThiChiTiet,
    baiThiChiTietTuLuan,
    deThi,
    deThiCauHoi,
    dotThi,
    tracNghiemDotThi,
    tracNghiem,
    tuLuanDotThi,
    users,
} = require("../../db/schema");

function withLegacyKeys(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return data;
    }

    return {
        ...data,
        ...(data.deThiId !== undefined ? {de_thi_id: data.deThiId} : {}),
        ...(data.baiThiId !== undefined ? {bai_thi_id: data.baiThiId} : {}),
        ...(data.timeLeft !== undefined ? {time_left: data.timeLeft} : {}),
        ...(data.cauHoi !== undefined ? {cau_hoi: data.cauHoi} : {}),
        ...(data.tuLuan !== undefined ? {tu_luan: data.tuLuan} : {}),
        ...(data.thiSinhId !== undefined ? {thi_sinh_id: data.thiSinhId} : {}),
        ...(data.lanThi !== undefined ? {lan_thi: data.lanThi} : {}),
        ...(data.thoiGianBatDau !== undefined ? {thoi_gian_bat_dau: data.thoiGianBatDau} : {}),
        ...(data.thoiGianNop !== undefined ? {thoi_gian_nop: data.thoiGianNop} : {}),
        ...(data.trangThai !== undefined ? {trang_thai: data.trangThai} : {}),
        ...(data.tongThoiGianDaLam !== undefined ? {tong_thoi_gian_da_lam: data.tongThoiGianDaLam} : {}),
        ...(data.lanBatDau !== undefined ? {lan_bat_dau: data.lanBatDau} : {}),
        ...(data.dangLam !== undefined ? {dang_lam: data.dangLam} : {}),
        ...(data.soDuDoan !== undefined ? {so_du_doan: data.soDuDoan} : {}),
        ...(data.dapAnChon !== undefined ? {dap_an_chon: data.dapAnChon} : {}),
        ...(data.cauHoiId !== undefined ? {cau_hoi_id: data.cauHoiId} : {}),
        ...(data.dotThiId !== undefined ? {dot_thi_id: data.dotThiId} : {}),
        ...(data.cauHoiText !== undefined ? {cau_hoi: data.cauHoiText} : {}),
        ...(data.goiY !== undefined ? {goi_y: data.goiY} : {}),
    };
}

function mapBaiThi(row) {
    if (!row) {
        return {};
    }

    return withLegacyKeys({
        id: row.id,
        deThiId: row.deThiId,
        thiSinhId: row.thiSinhId,
        lanThi: row.lanThi,
        thoiGianBatDau: row.thoiGianBatDau,
        thoiGianNop: row.thoiGianNop,
        trangThai: row.trangThai,
        diem: row.diem,
        tongThoiGianDaLam: row.tongThoiGianDaLam,
        lanBatDau: row.lanBatDau,
        dangLam: row.dangLam,
        soDuDoan: row.soDuDoan,
    });
}

function mapDotThiInfo(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        cuocThiId: row.cuocThiId,
        ten: row.ten,
        moTa: row.moTa,
        soLanThamGiaToiDa: row.soLanThamGiaToiDa,
        thoiGianThi: row.thoiGianThi,
        tyLeDanhGiaDat: row.tyLeDanhGiaDat,
        thoiGianBatDau: row.thoiGianBatDau,
        thoiGianKetThuc: row.thoiGianKetThuc,
        coTronCauHoi: row.coTronCauHoi,
        choPhepLuuBai: row.choPhepLuuBai,
        duDoan: row.duDoan,
        trangThai: row.trangThai,
        createdAt: row.createdAt,
    };
}

function mapThiSinh(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        username: row.username,
        hoTen: row.hoTen,
        donViId: row.donViId,
        avatar: null,
        createdAt: row.createdAt,
        ho_ten: row.hoTen,
        don_vi_id: row.donViId,
        created_at: row.createdAt,
    };
}

function mapTracNghiemQuestion(row) {
    return withLegacyKeys({
        id: row.id,
        cauHoiText: row.cauHoi,
        caua: row.cauA,
        caub: row.cauB,
        cauc: row.cauC,
        caud: row.cauD,
        diem: row.diem,
        thuTu: row.thuTu,
        dapAnChon: row.dapAnChon,
    });
}

function mapTuLuanQuestion(row) {
    return withLegacyKeys({
        id: row.id,
        cauHoiText: row.cauHoi,
        dotThiId: row.dotThiId,
        goiY: row.goiY,
        dapAn: row.dapAn,
        diem: row.diem,
    });
}

function compareNullableDesc(left, right) {
    if (left == null && right == null) {
        return 0;
    }

    if (left == null) {
        return 1;
    }

    if (right == null) {
        return -1;
    }

    return Number(right) - Number(left);
}

function compareNullableAsc(left, right) {
    if (left == null && right == null) {
        return 0;
    }

    if (left == null) {
        return 1;
    }

    if (right == null) {
        return -1;
    }

    return Number(left) - Number(right);
}

function compareRankingRow(left, right) {
    const byDiem = compareNullableDesc(left.diem, right.diem);

    if (byDiem !== 0) {
        return byDiem;
    }

    const byThoiGian = compareNullableAsc(left.thoiGian, right.thoiGian);

    if (byThoiGian !== 0) {
        return byThoiGian;
    }

    const bySaiSo = compareNullableAsc(left.saiSo, right.saiSo);

    if (bySaiSo !== 0) {
        return bySaiSo;
    }

    return Number(left.baiThiId) - Number(right.baiThiId);
}

function mapRankingRow(row) {
    return {
        baiThiId: row.baiThiId,
        bai_thi_id: row.baiThiId,
        thiSinh: row.thiSinh,
        thi_sinh: row.thiSinh,
        diem: row.diem,
        thoiGian: row.thoiGian,
        thoi_gian: row.thoiGian,
        soDuDoan: row.soDuDoan,
        so_du_doan: row.soDuDoan,
        soNguoi100: row.soNguoi100,
        so_nguoi_100: row.soNguoi100,
        saiSo: row.saiSo,
        sai_so: row.saiSo,
    };
}

async function ensureScopedEntityExists(tx, table, workspaceId, id, message) {
    const [row] = await tx
        .select({ id: table.id })
        .from(table)
        .where(and(
            eq(table.workspaceId, Number(workspaceId)),
            eq(table.id, Number(id))
        ))
        .limit(1);

    if (!row) {
        throw message;
    }
}

async function layThoiGianThiTheoDeThi(tx, workspaceId, deThiId) {
    const [row] = await tx
        .select({
            thoiGianThi: dotThi.thoiGianThi,
        })
        .from(deThi)
        .innerJoin(dotThi, and(
            eq(dotThi.id, deThi.dotThiId),
            eq(dotThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(deThi.workspaceId, Number(workspaceId)),
            eq(deThi.id, Number(deThiId))
        ))
        .limit(1);

    return row?.thoiGianThi || 0;
}

async function layCauHoiDeThiInternal(tx, workspaceId, deThiId, baiThiId) {
    const rows = await tx
        .select({
            id: tracNghiem.id,
            cauHoi: tracNghiem.cauHoi,
            cauA: tracNghiem.cauA,
            cauB: tracNghiem.cauB,
            cauC: tracNghiem.cauC,
            cauD: tracNghiem.cauD,
            diem: tracNghiem.diem,
            thuTu: deThiCauHoi.thuTu,
            dapAnChon: baiThiChiTiet.dapAnChon,
        })
        .from(deThiCauHoi)
        .innerJoin(deThi, and(
            eq(deThi.id, deThiCauHoi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(tracNghiem, and(
            eq(tracNghiem.id, deThiCauHoi.cauHoiId),
            eq(tracNghiem.workspaceId, Number(workspaceId))
        ))
        .leftJoin(
            baiThiChiTiet,
            and(
                eq(baiThiChiTiet.cauHoiId, tracNghiem.id),
                eq(baiThiChiTiet.baiThiId, Number(baiThiId))
            )
        )
        .where(eq(deThiCauHoi.deThiId, Number(deThiId)))
        .orderBy(asc(deThiCauHoi.thuTu));

    return rows.map(mapTracNghiemQuestion);
}

async function layCauHoiTuLuanInternal(tx, workspaceId, baiThiId) {
    const [info] = await tx
        .select({
            dotThiId: deThi.dotThiId,
        })
        .from(baiThi)
        .innerJoin(deThi, and(
            eq(deThi.id, baiThi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.id, Number(baiThiId))
        ))
        .limit(1);

    if (!info?.dotThiId) {
        return [];
    }

    const rows = await tx
        .select({
            id: tuLuanDotThi.id,
            cauHoi: tuLuanDotThi.cauHoi,
            dotThiId: tuLuanDotThi.dotThiId,
            goiY: tuLuanDotThi.goiY,
            dapAn: baiThiChiTietTuLuan.dapAn,
            diem: baiThiChiTietTuLuan.diem,
        })
        .from(tuLuanDotThi)
        .leftJoin(
            baiThiChiTietTuLuan,
            and(
                eq(baiThiChiTietTuLuan.cauHoiId, tuLuanDotThi.id),
                eq(baiThiChiTietTuLuan.baiThiId, Number(baiThiId))
            )
        )
        .where(and(
            eq(tuLuanDotThi.workspaceId, Number(workspaceId)),
            eq(tuLuanDotThi.dotThiId, Number(info.dotThiId))
        ))
        .orderBy(asc(tuLuanDotThi.id));

    return rows.map(mapTuLuanQuestion);
}

exports.conDuocThi = async (workspaceId, dotThiId, thiSinhId) => {
    const [dotThiInfo, completedRows] = await Promise.all([
        db
            .select({
                soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            })
            .from(dotThi)
            .where(and(
                eq(dotThi.workspaceId, Number(workspaceId)),
                eq(dotThi.id, Number(dotThiId))
            ))
            .limit(1),
        db
            .select({
                total: sql`count(*)::int`,
            })
            .from(baiThi)
            .innerJoin(deThi, and(
                eq(deThi.id, baiThi.deThiId),
                eq(deThi.workspaceId, Number(workspaceId))
            ))
            .where(and(
                eq(baiThi.workspaceId, Number(workspaceId)),
                eq(baiThi.thiSinhId, Number(thiSinhId)),
                eq(deThi.dotThiId, Number(dotThiId)),
                eq(baiThi.trangThai, 1)
            )),
    ]);

    const max = dotThiInfo[0]?.soLanThamGiaToiDa ?? 0;
    const daThi = Number(completedRows[0]?.total || 0);

    return daThi < max;
};

exports.layDeDangLam = async (workspaceId, dotThiId, thiSinhId) => {
    const [row] = await db
        .select({
            id: deThi.id,
        })
        .from(deThi)
        .innerJoin(baiThi, and(
            eq(baiThi.deThiId, deThi.id),
            eq(baiThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(deThi.workspaceId, Number(workspaceId)),
            eq(deThi.dotThiId, Number(dotThiId)),
            eq(baiThi.thiSinhId, Number(thiSinhId)),
            eq(baiThi.trangThai, 0)
        ))
        .limit(1);

    return row?.id || null;
};

exports.taoDeThi = async (workspaceId, dotThiId, thiSinhId) => {
    return db.transaction(async (tx) => {
        const [lanThiRow] = await tx
            .select({
                lanThi: sql`coalesce(max(${deThi.lanThi}), 0) + 1`,
            })
            .from(deThi)
            .where(and(
                eq(deThi.workspaceId, Number(workspaceId)),
                eq(deThi.dotThiId, Number(dotThiId)),
                eq(deThi.thiSinhId, Number(thiSinhId))
            ));

        const [createdDeThi] = await tx
            .insert(deThi)
            .values({
                workspaceId: Number(workspaceId),
                dotThiId: Number(dotThiId),
                thiSinhId: Number(thiSinhId),
                lanThi: Number(lanThiRow?.lanThi || 1),
            })
            .returning({id: deThi.id});

        const cauHinhRows = await tx
            .select()
            .from(tracNghiemDotThi)
            .where(and(
                eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
                eq(tracNghiemDotThi.dotThiId, Number(dotThiId))
            ));

        let thuTu = 0;

        for (const config of cauHinhRows) {
            const randomRows = await tx
                .select({id: tracNghiem.id})
                .from(tracNghiem)
                .where(and(
                    eq(tracNghiem.workspaceId, Number(workspaceId)),
                    eq(tracNghiem.linhVucId, config.linhVucId),
                    eq(tracNghiem.nhomId, config.nhomId)
                ))
                .orderBy(sql`random()`)
                .limit(config.soLuong);

            for (const question of randomRows) {
                thuTu += 1;

                await tx
                    .insert(deThiCauHoi)
                    .values({
                        deThiId: createdDeThi.id,
                        cauHoiId: question.id,
                        thuTu,
                    });
            }
        }

        return createdDeThi.id;
    });
};

exports.batDauThi = async (workspaceId, deThiId, thiSinhId) => {
    const [deRow] = await db
        .select({
            lanThi: deThi.lanThi,
        })
        .from(deThi)
        .where(and(
            eq(deThi.workspaceId, Number(workspaceId)),
            eq(deThi.id, Number(deThiId))
        ))
        .limit(1);

    const [created] = await db
        .insert(baiThi)
        .values({
            workspaceId: Number(workspaceId),
            deThiId: Number(deThiId),
            thiSinhId: Number(thiSinhId),
            lanThi: deRow?.lanThi || 1,
        })
        .returning({id: baiThi.id});

    return created?.id || null;
};

exports.luuCauTraLoi = async (workspaceId, baiThiId, cauHoiId, dapAn) => {
    await Promise.all([
        ensureScopedEntityExists(db, baiThi, workspaceId, baiThiId, "Bài thi không tồn tại trong workspace hiện tại."),
        ensureScopedEntityExists(db, tracNghiem, workspaceId, cauHoiId, "Câu hỏi không tồn tại trong workspace hiện tại."),
    ]);

    await db
        .insert(baiThiChiTiet)
        .values({
            baiThiId: Number(baiThiId),
            cauHoiId: Number(cauHoiId),
            dapAnChon: dapAn,
        })
        .onConflictDoUpdate({
            target: [baiThiChiTiet.baiThiId, baiThiChiTiet.cauHoiId],
            set: {
                dapAnChon: dapAn,
            },
        });

    return null;
};

exports.luuCauTraLoiTuLuan = async (workspaceId, baiThiId, cauHoiId, dapAn) => {
    await Promise.all([
        ensureScopedEntityExists(db, baiThi, workspaceId, baiThiId, "Bài thi không tồn tại trong workspace hiện tại."),
        ensureScopedEntityExists(db, tuLuanDotThi, workspaceId, cauHoiId, "Câu hỏi tự luận không tồn tại trong workspace hiện tại."),
    ]);

    await db
        .insert(baiThiChiTietTuLuan)
        .values({
            baiThiId: Number(baiThiId),
            cauHoiId: Number(cauHoiId),
            dapAn,
        })
        .onConflictDoUpdate({
            target: [baiThiChiTietTuLuan.baiThiId, baiThiChiTietTuLuan.cauHoiId],
            set: {
                dapAn,
            },
        });

    return null;
};

exports.nopBai = async (workspaceId, baiThiIdValue) => {
    return db.transaction(async (tx) => {
        await ensureScopedEntityExists(tx, baiThi, workspaceId, baiThiIdValue, "Bài thi không tồn tại trong workspace hiện tại.");

        const chiTietRows = await tx
            .select({
                id: baiThiChiTiet.id,
                dapAnChon: baiThiChiTiet.dapAnChon,
                dapAn: tracNghiem.dapAn,
                diemCauHoi: tracNghiem.diem,
            })
            .from(baiThiChiTiet)
            .innerJoin(tracNghiem, and(
                eq(tracNghiem.id, baiThiChiTiet.cauHoiId),
                eq(tracNghiem.workspaceId, Number(workspaceId))
            ))
            .where(eq(baiThiChiTiet.baiThiId, Number(baiThiIdValue)));

        let tongDiem = 0;

        await Promise.all(chiTietRows.map(async (item) => {
            const dung = item.dapAnChon === item.dapAn;
            const diem = dung ? Number(item.diemCauHoi || 0) : 0;
            tongDiem += diem;

            await tx
                .update(baiThiChiTiet)
                .set({
                    dung,
                    diem,
                })
                .where(eq(baiThiChiTiet.id, item.id));
        }));

        await tx
            .update(baiThi)
            .set({
                trangThai: 1,
                thoiGianNop: new Date(),
                diem: tongDiem,
            })
            .where(and(
                eq(baiThi.workspaceId, Number(workspaceId)),
                eq(baiThi.id, Number(baiThiIdValue))
            ));

        return tongDiem;
    });
};

exports.lichSuThi = async (workspaceId, thiSinhId, dotThiId) => {
    const rows = await db
        .select({
            id: baiThi.id,
            deThiId: baiThi.deThiId,
            thiSinhId: baiThi.thiSinhId,
            lanThi: baiThi.lanThi,
            thoiGianBatDau: baiThi.thoiGianBatDau,
            thoiGianNop: baiThi.thoiGianNop,
            trangThai: baiThi.trangThai,
            diem: baiThi.diem,
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
            lanBatDau: baiThi.lanBatDau,
            dangLam: baiThi.dangLam,
            soDuDoan: baiThi.soDuDoan,
            dotThiId: dotThi.id,
            ten: dotThi.ten,
            moTa: dotThi.moTa,
            soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            thoiGianThi: dotThi.thoiGianThi,
            tyLeDanhGiaDat: dotThi.tyLeDanhGiaDat,
            thoiGianBatDauDot: dotThi.thoiGianBatDau,
            thoiGianKetThucDot: dotThi.thoiGianKetThuc,
            coTronCauHoi: dotThi.coTronCauHoi,
            choPhepLuuBai: dotThi.choPhepLuuBai,
            duDoan: dotThi.duDoan,
            trangThaiDot: dotThi.trangThai,
            createdAtDot: dotThi.createdAt,
        })
        .from(baiThi)
        .innerJoin(deThi, and(
            eq(deThi.id, baiThi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(dotThi, and(
            eq(dotThi.id, deThi.dotThiId),
            eq(dotThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.thiSinhId, Number(thiSinhId)),
            eq(deThi.dotThiId, Number(dotThiId))
        ))
        .orderBy(asc(baiThi.lanThi));

    return rows.map((row) => ({
        ...mapBaiThi(row),
        dot_thi: withLegacyKeys(mapDotThiInfo({
            id: row.dotThiId,
            cuocThiId: null,
            ten: row.ten,
            moTa: row.moTa,
            soLanThamGiaToiDa: row.soLanThamGiaToiDa,
            thoiGianThi: row.thoiGianThi,
            tyLeDanhGiaDat: row.tyLeDanhGiaDat,
            thoiGianBatDau: row.thoiGianBatDauDot,
            thoiGianKetThuc: row.thoiGianKetThucDot,
            coTronCauHoi: row.coTronCauHoi,
            choPhepLuuBai: row.choPhepLuuBai,
            duDoan: row.duDoan,
            trangThai: row.trangThaiDot,
            createdAt: row.createdAtDot,
        })),
    }));
};

exports.layCauHoiDeThi = async (workspaceId, deThiId, baiThiId) => {
    return layCauHoiDeThiInternal(db, workspaceId, deThiId, baiThiId);
};

exports.layBaiDangLam = async (workspaceId, thiSinhId, dotThiId) => {
    const [row] = await db
        .select({
            id: baiThi.id,
            deThiId: baiThi.deThiId,
            thiSinhId: baiThi.thiSinhId,
            lanThi: baiThi.lanThi,
            thoiGianBatDau: baiThi.thoiGianBatDau,
            thoiGianNop: baiThi.thoiGianNop,
            trangThai: baiThi.trangThai,
            diem: baiThi.diem,
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
            lanBatDau: baiThi.lanBatDau,
            dangLam: baiThi.dangLam,
            soDuDoan: baiThi.soDuDoan,
        })
        .from(baiThi)
        .innerJoin(deThi, and(
            eq(deThi.id, baiThi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.thiSinhId, Number(thiSinhId)),
            eq(deThi.dotThiId, Number(dotThiId)),
            eq(baiThi.trangThai, 0)
        ))
        .limit(1);

    return row ? mapBaiThi(row) : {};
};

exports.startThi = async (workspaceId, dotThiId, thiSinhId) => {
    return db.transaction(async (tx) => {
        const conDuoc = await exports.conDuocThi(workspaceId, dotThiId, thiSinhId);

        if (!conDuoc) {
            return {error: "het_lan_thi"};
        }

        const [existing] = await tx
            .select({
                baiThiId: baiThi.id,
                deThiId: baiThi.deThiId,
                thoiGianThi: dotThi.thoiGianThi,
                tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
                lanBatDau: baiThi.lanBatDau,
                dangLam: baiThi.dangLam,
            })
            .from(baiThi)
            .innerJoin(deThi, and(
                eq(deThi.id, baiThi.deThiId),
                eq(deThi.workspaceId, Number(workspaceId))
            ))
            .innerJoin(dotThi, and(
                eq(dotThi.id, deThi.dotThiId),
                eq(dotThi.workspaceId, Number(workspaceId))
            ))
            .where(and(
                eq(baiThi.workspaceId, Number(workspaceId)),
                eq(baiThi.thiSinhId, Number(thiSinhId)),
                eq(deThi.dotThiId, Number(dotThiId)),
                eq(baiThi.trangThai, 0)
            ))
            .limit(1);

        let baiThiIdValue = existing?.baiThiId || null;
        let deThiIdValue = existing?.deThiId || null;
        let thoiGianThi = existing?.thoiGianThi || 0;
        let tongDaLam = Number(existing?.tongThoiGianDaLam || 0);
        let lanBatDau = existing?.lanBatDau || null;

        if (!baiThiIdValue) {
            deThiIdValue = await exports.taoDeThi(workspaceId, dotThiId, thiSinhId);
            baiThiIdValue = await exports.batDauThi(workspaceId, deThiIdValue, thiSinhId);
            thoiGianThi = await layThoiGianThiTheoDeThi(tx, workspaceId, deThiIdValue);
            tongDaLam = 0;
            lanBatDau = null;
        }

        if (!lanBatDau) {
            const now = new Date();

            await tx
                .update(baiThi)
                .set({
                    lanBatDau: now,
                    dangLam: true,
                })
                .where(and(
                    eq(baiThi.workspaceId, Number(workspaceId)),
                    eq(baiThi.id, Number(baiThiIdValue))
                ));

            lanBatDau = now;
        }

        const diff = Math.floor((Date.now() - new Date(lanBatDau).getTime()) / 1000);
        let timeLeft = (Number(thoiGianThi || 0) * 60) - (tongDaLam + diff);

        if (timeLeft < 0) {
            timeLeft = 0;
        }

        const [cauHoi, tuLuan] = await Promise.all([
            layCauHoiDeThiInternal(tx, workspaceId, deThiIdValue, baiThiIdValue),
            layCauHoiTuLuanInternal(tx, workspaceId, baiThiIdValue),
        ]);

        return {
            deThiId: deThiIdValue,
            baiThiId: baiThiIdValue,
            timeLeft,
            cauHoi,
            tuLuan,
            de_thi_id: deThiIdValue,
            bai_thi_id: baiThiIdValue,
            time_left: timeLeft,
        };
    });
};

exports.pauseThi = async (workspaceId, baiThiIdValue) => {
    const [row] = await db
        .select({
            lanBatDau: baiThi.lanBatDau,
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
        })
        .from(baiThi)
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.id, Number(baiThiIdValue))
        ))
        .limit(1);

    if (!row?.lanBatDau) {
        return false;
    }

    const diff = Math.floor((Date.now() - new Date(row.lanBatDau).getTime()) / 1000);

    await db
        .update(baiThi)
        .set({
            tongThoiGianDaLam: Number(row.tongThoiGianDaLam || 0) + diff,
            dangLam: false,
            lanBatDau: null,
        })
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.id, Number(baiThiIdValue))
        ));

    return true;
};

exports.nopDuDoanKetQuan = async (workspaceId, baiThiIdValue, soDuDoan) => {
    const updated = await db
        .update(baiThi)
        .set({
            soDuDoan,
        })
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.id, Number(baiThiIdValue))
        ))
        .returning({id: baiThi.id});

    if (!updated.length) {
        throw "Bài thi không tồn tại";
    }

    return true;
};

async function layDanhSachBaiThiXepHang(workspaceId, whereClause) {
    const examRows = await db
        .select({
            baiThiId: baiThi.id,
            thiSinhId: baiThi.thiSinhId,
            diem: baiThi.diem,
            thoiGian: baiThi.tongThoiGianDaLam,
            soDuDoan: baiThi.soDuDoan,
            dotThiId: dotThi.id,
            tyLeDanhGiaDat: dotThi.tyLeDanhGiaDat,
            userId: users.id,
            username: users.username,
            hoTen: users.hoTen,
            donViId: users.donViId,
            createdAt: users.createdAt,
        })
        .from(baiThi)
        .innerJoin(deThi, and(
            eq(deThi.id, baiThi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(dotThi, and(
            eq(dotThi.id, deThi.dotThiId),
            eq(dotThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(users, and(
            eq(users.id, baiThi.thiSinhId),
            eq(users.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            whereClause
        ));

    if (!examRows.length) {
        return [];
    }

    const eligibleRows = examRows.filter((row) => {
        const diem = Number(row.diem ?? 0);
        const tyLeDat = Number(row.tyLeDanhGiaDat ?? 0);

        return diem >= tyLeDat;
    });

    if (!eligibleRows.length) {
        return [];
    }

    const examIds = eligibleRows.map((row) => row.baiThiId);
    const detailRows = await db
        .select({
            baiThiId: baiThiChiTiet.baiThiId,
            tong: sql`count(*)::int`,
            dung: sql`coalesce(sum(case when ${baiThiChiTiet.dung} then 1 else 0 end), 0)::int`,
        })
        .from(baiThiChiTiet)
        .where(inArray(baiThiChiTiet.baiThiId, examIds))
        .groupBy(baiThiChiTiet.baiThiId);

    const detailStats = new Map(
        detailRows.map((row) => [
            Number(row.baiThiId),
            {
                tong: Number(row.tong || 0),
                dung: Number(row.dung || 0),
            },
        ])
    );

    const soNguoi100 = eligibleRows.reduce((total, row) => {
        const stats = detailStats.get(Number(row.baiThiId)) || { tong: 0, dung: 0 };
        return stats.dung === stats.tong ? total + 1 : total;
    }, 0);

    const bestByThiSinh = new Map();

    for (const row of eligibleRows) {
        const current = {
            baiThiId: row.baiThiId,
            thiSinhId: row.thiSinhId,
            diem: row.diem,
            thoiGian: row.thoiGian,
            soDuDoan: row.soDuDoan,
            thiSinh: mapThiSinh({
                id: row.userId,
                username: row.username,
                hoTen: row.hoTen,
                donViId: row.donViId,
                createdAt: row.createdAt,
            }),
        };

        const previous = bestByThiSinh.get(Number(row.thiSinhId));

        if (!previous || compareRankingRow(current, previous) < 0) {
            bestByThiSinh.set(Number(row.thiSinhId), current);
        }
    }

    return Array.from(bestByThiSinh.values())
        .map((row) => ({
            ...row,
            soNguoi100,
            saiSo: Math.abs(Number(row.soDuDoan || 0) - soNguoi100),
        }))
        .sort(compareRankingRow);
}

exports.xepHangTracNghiemTheoDotThi = async (workspaceId, dotThiId, topGiai) => {
    const rows = await layDanhSachBaiThiXepHang(
        workspaceId,
        and(
            eq(deThi.workspaceId, Number(workspaceId)),
            eq(deThi.dotThiId, Number(dotThiId))
        )
    );

    return rows
        .slice(0, Number(topGiai) || 10)
        .map(mapRankingRow);
};

exports.xepHangTracNghiemTheoCuocThi = async (workspaceId, cuocThiId, topGiai) => {
    const rows = await db
        .select({ id: dotThi.id })
        .from(dotThi)
        .where(and(
            eq(dotThi.workspaceId, Number(workspaceId)),
            eq(dotThi.cuocThiId, Number(cuocThiId))
        ));

    const dotThiIds = rows.map((row) => row.id);

    if (!dotThiIds.length) {
        return [];
    }

    const data = await layDanhSachBaiThiXepHang(
        workspaceId,
        and(
            eq(deThi.workspaceId, Number(workspaceId)),
            inArray(deThi.dotThiId, dotThiIds)
        )
    );

    return data
        .slice(0, Number(topGiai) || 10)
        .map(mapRankingRow);
};

