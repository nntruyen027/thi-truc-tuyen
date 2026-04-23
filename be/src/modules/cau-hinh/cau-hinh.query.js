const { eq } = require("drizzle-orm");
const db = require("../../db/client");
const { cauHinh } = require("../../db/schema");

function mapConfig(row) {
    if (!row) {
        return null;
    }

    return {
        khoa: row.khoa,
        gia_tri: row.giaTri,
    };
}

exports.layCauHinh = async (khoa) => {
    const [row] = await db
        .select()
        .from(cauHinh)
        .where(eq(cauHinh.khoa, khoa))
        .limit(1);

    return mapConfig(row);
};

exports.suaCauHinh = async (khoa, giaTri) => {
    const existing = await exports.layCauHinh(khoa);

    if (!existing) {
        const [created] = await db
            .insert(cauHinh)
            .values({
                khoa,
                giaTri,
            })
            .returning();

        return mapConfig(created);
    }

    const [updated] = await db
        .update(cauHinh)
        .set({
            giaTri,
        })
        .where(eq(cauHinh.khoa, khoa))
        .returning();

    return mapConfig(updated);
};

