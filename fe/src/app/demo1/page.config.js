import dayjs from "dayjs";

export const SO_LUOT_THI_TOI_THIEU = 132;

export const tabItems = [
    {
        key: "thong-tin",
        title: "Thông tin",
        subtitle: "Cuộc thi",
        image: "/documents.png",
    },
    {
        key: "giai-thuong",
        title: "Giải thưởng",
        subtitle: "Cơ cấu trao giải",
        image: "/medal.png",
    },
    {
        key: "document",
        title: "Tài liệu",
        subtitle: "Tham khảo cuộc thi",
        image: "/documentation.png",
    },
    {
        key: "ket-qua",
        title: "Kết quả",
        subtitle: "Công bố xếp hạng",
        image: "/laurel.png",
    },
];

export function buildTimelineStages(dsDotThi = [], currentDotThiId) {
    const now = dayjs();

    return [...dsDotThi]
        .sort((a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf())
        .map((item) => {
            const isCurrent = item.id === currentDotThiId;
            const isFinished = dayjs(item.thoi_gian_ket_thuc).isBefore(now);
            const isUpcoming = dayjs(item.thoi_gian_bat_dau).isAfter(now);

            let status = "Đang diễn ra";
            let tone = "active";

            if (isFinished) {
                status = "Đã kết thúc";
                tone = "done";
            } else if (isUpcoming) {
                status = "Sắp diễn ra";
                tone = "upcoming";
            } else if (isCurrent) {
                status = "Đang diễn ra";
                tone = "current";
            }

            return {
                id: item.id,
                ten: item.ten,
                status,
                tone,
                isCurrent,
                thoiGianBatDau: item.thoi_gian_bat_dau,
                thoiGianKetThuc: item.thoi_gian_ket_thuc,
            };
        });
}

export function formatLongVietnameseDate(value) {
    if (!value) {
        return "";
    }

    const date = dayjs(value);

    if (!date.isValid()) {
        return "";
    }

    return `ngày ${date.date()} tháng ${date.month() + 1} năm ${date.year()}`;
}
