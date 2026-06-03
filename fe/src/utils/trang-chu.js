export const KHOA_CAU_HINH_TRANG_CHU = "homepage_settings";

export const TUY_CHON_TRANG_CHU = [
    {
        key: "demo0",
        label: "Trang chủ gốc (Demo 0)",
        path: "/",
    },
    {
        key: "demo1",
        label: "Demo 1",
        path: "/demo1",
    },
    {
        key: "demo2",
        label: "Demo 2",
        path: "/demo2",
    },
    {
        key: "demo3",
        label: "Demo 3",
        path: "/demo3",
    },
];

export function taoCauHinhTrangChuMacDinh() {
    return {
        selectedDemo: "demo0",
        showAllDemos: true,
    };
}

export function chuanHoaCauHinhTrangChu(value) {
    let parsed = value;

    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch {
            parsed = {};
        }
    }

    const defaults = taoCauHinhTrangChuMacDinh();
    const selectedDemo = TUY_CHON_TRANG_CHU.some((item) => item.key === parsed?.selectedDemo)
        ? parsed.selectedDemo
        : defaults.selectedDemo;

    return {
        selectedDemo,
        showAllDemos: typeof parsed?.showAllDemos === "boolean"
            ? parsed.showAllDemos
            : defaults.showAllDemos,
    };
}

export function layDuongDanTrangChu(selectedDemo) {
    return TUY_CHON_TRANG_CHU.find((item) => item.key === selectedDemo)?.path || "/";
}
