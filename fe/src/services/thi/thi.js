import api from "~/services/api";
import {API_BASE_URL} from "~/config/env";
import {useAuthStore} from "~/store/auth";

const BASE_PATH = "/thi";

function getAccessToken() {
    return useAuthStore.getState().access
        || (typeof window !== "undefined"
            ? localStorage.getItem("access")
            : null);
}


/**
 * còn được thi không
 */
export async function conDuocThi(dotThiId) {

    try {

        const res =
            await api.get(
                BASE_PATH + "/con-duoc-thi",
                {
                    params: { dotThiId }
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * lấy bài đang làm
 */
export async function layBaiDangLam(
    dotThiId
) {

    try {

        const res =
            await api.get(
                BASE_PATH + "/bai-dang-lam",
                {
                    params: { dotThiId }
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * tạo đề thi
 */
export async function taoDeThi(
    dotThiId
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/tao-de",
                {
                    dotThiId
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * bắt đầu thi
 */
export async function batDauThi(
    deThiId
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/bat-dau",
                {
                    deThiId
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * lấy câu hỏi đề thi
 */
export async function layCauHoi(
    deThiId,
    baiThiId
) {

    try {

        const res =
            await api.get(
                BASE_PATH + "/cau-hoi",
                {
                    params: {
                        deThiId,
                        baiThiId
                    }
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * lưu câu trả lời
 */
export async function traLoi(
    baiThiId,
    cauHoiId,
    dapAn
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/tra-loi",
                {
                    baiThiId,
                    cauHoiId,
                    dapAn
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}

export async function traLoiTuLuan(
    baiThiId,
    cauHoiId,
    dapAn
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/tra-loi-tu-luan",
                {
                    baiThiId,
                    cauHoiId,
                    dapAn
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * nộp bài
 */
export async function nopBai(
    baiThiId
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/nop-bai",
                {
                    baiThiId
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}


/**
 * lịch sử thi
 */
export async function lichSuThi(
    dotThiId
) {

    try {
        const access = getAccessToken();

        const res =
            await api.get(
                BASE_PATH + "/lich-su",
                {
                    params: { dotThiId },
                    headers: access
                        ? {Authorization: `Bearer ${access}`}
                        : undefined,
                }
            )

        return res.data.data

    }
    catch (e) {
        const error = new Error(
            e?.response?.data?.message || "Không thể tải lịch sử thi"
        );
        error.status = e?.response?.status;
        throw error;

    }

}


/**
 * START THI (ALL IN ONE)
 * fn_start_thi trả về:
 * {
 *   deThiId,
 *   baiThiId,
 *   cauHoi: []
 * }
 */
export async function startThi(
    dotThiId
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/start",
                {
                    dotThiId
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }

}

export async function pauseThi(
    baiThiId,
    options = {}
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/pause/" + baiThiId,
                options
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }
}

export async function autoSubmitBaiThi(
    baiThiId,
    payload = {}
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/auto-submit/" + baiThiId,
                payload
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }
}

export function pauseThiKeepAlive(
    baiThiId,
    options = {}
) {

    if (!baiThiId) {
        return false;
    }

    const access =
        useAuthStore.getState().access
        || (typeof window !== "undefined"
            ? localStorage.getItem("access")
            : null);

    if (!access || typeof window === "undefined" || typeof fetch !== "function") {
        return false;
    }

    try {
        const body = JSON.stringify(options);

        void fetch(
            API_BASE_URL + BASE_PATH + "/pause/" + baiThiId,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access}`,
                    "Content-Type": "application/json",
                },
                body,
                keepalive: true,
            }
        );

        return true;

    }
    catch {

        return false;

    }
}

export function autoSubmitKeepAlive(
    baiThiId,
    payload = {}
) {

    if (!baiThiId) {
        return false;
    }

    const access =
        useAuthStore.getState().access
        || (typeof window !== "undefined"
            ? localStorage.getItem("access")
            : null);

    if (!access || typeof window === "undefined" || typeof fetch !== "function") {
        return false;
    }

    try {
        const body = JSON.stringify(payload);

        void fetch(
            API_BASE_URL + BASE_PATH + "/auto-submit/" + baiThiId,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access}`,
                    "Content-Type": "application/json",
                },
                body,
                keepalive: true,
            }
        );

        return true;

    }
    catch {

        return false;

    }
}

export async function nopKetQuaDuDoan(
    baiThiId,
    soDuDoan
) {

    try {

        let val = Number(soDuDoan)

        if (isNaN(val)) {
            val = null
        }

        const res =
            await api.post(
                BASE_PATH + "/du-doan/" + baiThiId,
                {
                    soDuDoan: val
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }
}

export async function xepHangTracNghiemTheoDotThi(
    dotThiId,
    top
) {

    try {

        let val = Number(top)

        if (isNaN(val)) {
            val = 10
        }

        const res =
            await api.get(
                BASE_PATH + "/ket-qua-trac-nghiem/dot-thi/" + dotThiId + "/" + val,
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }
}

export async function xepHangTracNghiemTheoCuocThi(
    cuocThiId,
    top
) {

    try {

        let val = Number(top)

        if (isNaN(val)) {
            val = 10
        }

        const res =
            await api.get(
                BASE_PATH + "/ket-qua-trac-nghiem/cuoc-thi/" + cuocThiId + "/" + val,
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }
}

export async function xuatKetQuaTracNghiemExcel({
    cuocThiId,
    dotThiId,
    top,
}) {

    try {

        const res =
            await api.get(
                BASE_PATH + "/ket-qua-trac-nghiem/export",
                {
                    params: {
                        cuocThiId,
                        dotThiId,
                        top,
                    },
                    responseType: "blob",
                }
            )

        return res.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message || "Không thể xuất file Excel"
        )

    }
}

export async function xepHangDonViTheoDotThi(
    dotThiId,
    top
) {

    try {
        const res =
            await api.get(
                top == null
                    ? BASE_PATH + "/bang-vang-don-vi/dot-thi/" + dotThiId
                    : BASE_PATH + "/bang-vang-don-vi/dot-thi/" + dotThiId + "/" + Number(top),
            )

        return res.data.data

    }
    catch (e) {
        const error = new Error(
            e?.response?.data?.message || "Không thể tải lịch sử thi"
        );
        error.status = e?.response?.status;
        throw error;

    }
}

export async function xepHangDonViTheoCuocThi(
    cuocThiId,
    top
) {

    try {
        const res =
            await api.get(
                top == null
                    ? BASE_PATH + "/bang-vang-don-vi/cuoc-thi/" + cuocThiId
                    : BASE_PATH + "/bang-vang-don-vi/cuoc-thi/" + cuocThiId + "/" + Number(top),
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

    }
}

export async function layBangXepHangCongKhai({
    dotThiId,
    cuocThiId,
    rankingTop = 10,
    honorTop = 5,
}) {

    try {
        const res =
            await api.get(
                BASE_PATH + "/public-rankings",
                {
                    params: {
                        dotThiId,
                        cuocThiId,
                        rankingTop,
                        honorTop,
                    },
                }
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message || "Không thể tải bảng xếp hạng công khai"
        )

    }
}
