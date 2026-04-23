const { asc, desc } = require("drizzle-orm");

exports.normalizePagination = ({
    page = 1,
    size = 10,
    defaultSize = 10,
}) => {
    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(size) > 0 ? Number(size) : defaultSize;

    return {
        page: currentPage,
        size: pageSize,
        offset: (currentPage - 1) * pageSize,
    };
};

exports.buildPagedResult = ({
    data = [],
    total = 0,
    page = 1,
    size = 10,
}) => ({
    data,
    total: Number(total) || 0,
    page,
    size,
});

exports.resolveSort = ({
    sortField,
    sortType,
    columnMap,
    defaultField,
}) => {
    const field = columnMap[sortField] ? sortField : defaultField;
    const direction = sortType === "desc" ? "desc" : "asc";

    return {
        field,
        direction,
        orderBy: direction === "desc"
            ? desc(columnMap[field])
            : asc(columnMap[field]),
    };
};

