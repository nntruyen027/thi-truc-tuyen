const { pgTable, text, varchar } = require("drizzle-orm/pg-core");

const cauHinh = pgTable("cau_hinh", {
    khoa: varchar("khoa", { length: 200 }).primaryKey(),
    giaTri: text("gia_tri"),
});

module.exports = {
    cauHinh,
};
