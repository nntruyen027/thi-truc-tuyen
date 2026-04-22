import api from "~/services/api";

const BASE_PATH = "/thi";


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

        const res =
            await api.get(
                BASE_PATH + "/lich-su",
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
    baiThiId
) {

    try {

        const res =
            await api.post(
                BASE_PATH + "/pause/" + baiThiId ,
            )

        return res.data.data

    }
    catch (e) {

        throw new Error(
            e?.response?.data?.message
        )

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
