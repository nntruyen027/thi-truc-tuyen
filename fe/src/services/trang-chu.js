import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {chuanHoaCauHinhTrangChu, KHOA_CAU_HINH_TRANG_CHU} from "~/utils/trang-chu";

export async function layCauHinhTrangChu() {
    const res = await layCauHinh(KHOA_CAU_HINH_TRANG_CHU);

    return {
        ...res,
        data: chuanHoaCauHinhTrangChu(res?.data?.gia_tri),
    };
}

export async function luuCauHinhTrangChu(giaTri) {
    const payload = chuanHoaCauHinhTrangChu(giaTri);

    return suaCauHinh(
        KHOA_CAU_HINH_TRANG_CHU,
        JSON.stringify(payload)
    );
}
