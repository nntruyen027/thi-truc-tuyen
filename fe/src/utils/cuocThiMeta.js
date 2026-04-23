export function parseCuocThiMeta(rawValue) {
    const fallback = {
        mo_ta_tom_tat: rawValue || "",
        doi_tuong_tham_gia: "",
        noi_dung_cuoc_thi: "",
        hinh_thuc_du_thi: "",
    };

    if (!rawValue || typeof rawValue !== "string") {
        return fallback;
    }

    try {
        const parsed = JSON.parse(rawValue);

        if (parsed && parsed.__type === "cuoc_thi_meta") {
            return {
                mo_ta_tom_tat: parsed.mo_ta_tom_tat || "",
                doi_tuong_tham_gia: parsed.doi_tuong_tham_gia || "",
                noi_dung_cuoc_thi: parsed.noi_dung_cuoc_thi || "",
                hinh_thuc_du_thi: parsed.hinh_thuc_du_thi || "",
            };
        }
    } catch {}

    return fallback;
}

export function stringifyCuocThiMeta(values = {}) {
    return JSON.stringify({
        __type: "cuoc_thi_meta",
        mo_ta_tom_tat: values.mo_ta_tom_tat || "",
        doi_tuong_tham_gia: values.doi_tuong_tham_gia || "",
        noi_dung_cuoc_thi: values.noi_dung_cuoc_thi || "",
        hinh_thuc_du_thi: values.hinh_thuc_du_thi || "",
    });
}
