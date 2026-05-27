'use client';

import {App, Button, Grid, InputNumber, Modal, Popconfirm, Select, Table} from "antd";

import {useCallback, useEffect, useState} from "react";

import {
    layTracNghiemDotThi,
    suaTracNghiemDotThi,
    themTracNghiemDotThi,
    xoaTracNghiemDotThi
} from "~/services/thi/dot-thi";

import {useLinhVucSelect} from "~/hook/useLinhVuc";
import {useNhomCauHoiSelect} from "~/hook/useNhomCauHoi";

const LOAI_CAU_HOI_OPTIONS = [
    { value: "chon_mot", label: "Trắc nghiệm chọn 1" },
    { value: "chon_nhieu", label: "Trắc nghiệm chọn nhiều" },
    { value: "dien_tu", label: "Điền từ" },
];

export default function TracNghiemDotThiModal({
                                                  open,
                                                  onClose,
                                                  dotThiId,
                                                  cuocThiId
                                              }) {

    const {message} = App.useApp();
    const screens = Grid.useBreakpoint();

    const [data, setData] = useState([]);

    const {
        dsLinhVuc
    } = useLinhVucSelect();

    const {
        dsNhomCauHoi
    } = useNhomCauHoiSelect();


    // load

    const fetchData = useCallback(async () => {
        try {
            const res =
                await layTracNghiemDotThi(
                    dotThiId,
                    cuocThiId
                );

            setData(res.data);
        } catch (e) {
            message.error(e.message);
        }

    }, [cuocThiId, dotThiId, message]);


    useEffect(() => {

        if (open) {
            const timer =
                setTimeout(() => {
                    void fetchData();
                }, 0);

            return () => clearTimeout(timer);
        }


    }, [fetchData, open]);


    // add

    const handleAdd = async () => {
        if (!dsLinhVuc.length || !dsNhomCauHoi.length) {
            message.error("Cần có sẵn lĩnh vực và nhóm câu hỏi trước khi cấu hình.");
            return;
        }

        try {
            await themTracNghiemDotThi(
                dotThiId,
                cuocThiId,
                {
                    linh_vuc_id: dsLinhVuc[0]?.id,
                    nhom_id: dsNhomCauHoi[0]?.id,
                    loai_cau_hoi: "chon_mot",
                    so_luong: 1
                }
            );

            fetchData();
        } catch (e) {
            message.error(e.message);
        }

    };


    // update

    const updateRow = async (
        id,
        field,
        value
    ) => {

        const row =
            data.find(i => i?.id === id);

        try {
            await suaTracNghiemDotThi(
                id,
                dotThiId,
                cuocThiId,
                {
                    ...row,
                    [field]: value
                }
            );

            fetchData();
        } catch (e) {
            message.error(e.message);
        }

    };


    // delete

    const handleDelete = async (id) => {

        try {
            await xoaTracNghiemDotThi(
                id,
                dotThiId,
                cuocThiId
            );

            fetchData();
        } catch (e) {
            message.error(e.message);
        }

    };


    const columns = [

        {
            title: "Lĩnh vực",
            render: (r) => (

                <Select
                    value={r.linh_vuc_id}
                    style={{ width: 150 }}
                    options={
                        dsLinhVuc.map(i => ({
                            label: i.ten,
                            value: i.id
                        }))
                    }
                    onChange={(v) =>
                        updateRow(
                            r.id,
                            "linh_vuc_id",
                            v
                        )
                    }
                />

            )
        },

        {
            title: "Nhóm",
            render: (r) => (

                <Select
                    value={r.nhom_id}
                    style={{ width: 150 }}
                    options={
                        dsNhomCauHoi.map(i => ({
                            label: i.ten,
                            value: i.id
                        }))
                    }
                    onChange={(v) =>
                        updateRow(
                            r.id,
                            "nhom_id",
                            v
                        )
                    }
                />

            )
        },

        {
            title: "Loại câu",
            render: (r) => (

                <Select
                    value={r.loai_cau_hoi || "chon_mot"}
                    style={{ width: 220 }}
                    options={LOAI_CAU_HOI_OPTIONS}
                    onChange={(v) =>
                        updateRow(
                            r.id,
                            "loai_cau_hoi",
                            v
                        )
                    }
                />

            )
        },

        {
            title: "Số lượng",
            render: (r) => (
                <div className="space-y-2">
                    <InputNumber
                        min={1}
                        value={r.so_luong}
                        onChange={(v) =>
                            updateRow(
                                r.id,
                                "so_luong",
                                v
                            )
                        }
                    />
                    <div className="text-xs text-slate-500">
                        Khả dụng: {Intl.NumberFormat("vi-VN").format(r.so_cau_kha_dung || 0)} câu
                    </div>
                </div>

            )
        },

        {
            title: "",
            render: (r) => (

                <Popconfirm
                    title="Xóa?"
                    onConfirm={() =>
                        handleDelete(r.id)
                    }
                >
                    <Button danger>
                        Xóa
                    </Button>
                </Popconfirm>

            )
        }

    ];


    return (

        <Modal
            mask={{ closable: false }}
            keyboard={false}
            open={open}
            onCancel={onClose}
            footer={null}
            width={screens.md ? 800 : "calc(100vw - 24px)"}
            title="Quản lý câu trắc nghiệm"
        >

            <Button
                type="primary"
                onClick={handleAdd}
                style={{ marginBottom: 10 }}
            >
                Thêm
            </Button>

            <Table
                className="admin-table"
                rowKey="id"
                dataSource={data}
                columns={columns}
                pagination={false}
                scroll={{x: 700}}
            />

        </Modal>

    );

}

