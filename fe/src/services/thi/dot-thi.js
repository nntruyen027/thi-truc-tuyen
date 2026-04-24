import api from "~/services/api";


const BASE_PATH = (cuocThiId) => "/cuoc-thi/" + cuocThiId + "/dot-thi";

// Lay ds don vi
export async function layDotThi(cuocThiId, { size = 10,
                                   page = 1,
                                   search = "",
                                   sortField = "id",
                                   sortType = "asc"}){
    try {
        const res = await api.get(BASE_PATH(cuocThiId), {
            params: {
                size,
                page,
                search,
                sortField,
                sortType
            }
        });
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function layDotThiHienTai(){
    try {
        const res = await api.get(BASE_PATH(0) + "/hien-tai", {

        });
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themDotThi(cuocThiId, value) {
    try {
        const res = await api.post(BASE_PATH(cuocThiId), value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaDotThi(id,cuocThiId, value) {
    try {
        const res = await api.put(BASE_PATH(cuocThiId) + '/' + id, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaDotThi(id, cuocThiId) {
    try {
        await api.delete(BASE_PATH(cuocThiId) + '/' + id);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function layTracNghiemDotThi(dotThiId, cuocThiId){
    try {
        const res = await api.get(BASE_PATH(cuocThiId) + "/" +dotThiId  + "/trac-nghiem");
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themTracNghiemDotThi(dotThiId, cuocThiId, values){
    try {
        const res = await api.post(BASE_PATH(cuocThiId) + "/" +dotThiId + "/trac-nghiem", values );
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaTracNghiemDotThi(id, dotThiId,cuocThiId, values, ){
    try {
        const res = await api.put(BASE_PATH(cuocThiId) + "/" +dotThiId + "/trac-nghiem/" + id, values );
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaTracNghiemDotThi(id, dotThiId,cuocThiId ){
    try {
        const res = await api.delete(BASE_PATH(cuocThiId) + "/" +dotThiId + "/trac-nghiem/" + id );
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function layTuLuanDotThi(dotThiId, cuocThiId){
    try {
        const res = await api.get(BASE_PATH(cuocThiId) + "/" +dotThiId  + "/tu-luan");
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themTuLuanDotThi(dotThiId, cuocThiId, values){
    try {
        const res = await api.post(BASE_PATH(cuocThiId) + "/" +dotThiId + "/tu-luan", values );
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaTuLuanDotThi(id, dotThiId,cuocThiId, values, ){
    try {
        const res = await api.put(BASE_PATH(cuocThiId) + "/" +dotThiId + "/tu-luan/" + id, values );
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaTuLuanDotThi(id, dotThiId,cuocThiId ){
    try {
        const res = await api.delete(BASE_PATH(cuocThiId) + "/" +dotThiId + "/tu-luan/" + id );
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}
