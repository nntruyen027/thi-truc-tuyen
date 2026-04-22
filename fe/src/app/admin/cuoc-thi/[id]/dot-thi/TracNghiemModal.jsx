'use client';

import {Button, InputNumber, Modal, Popconfirm, Select, Table} from "antd";

import {useEffect, useState} from "react";

import {
    layTracNghiemDotThi,
    suaTracNghiemDotThi,
    themTracNghiemDotThi,
    xoaTracNghiemDotThi
} from "~/services/thi/dot-thi";

import {useLinhVucSelect} from "~/hook/useLinhVuc";
import {useNhomCauHoiSelect} from "~/hook/useNhomCauHoi";


export default function TracNghiemDotThiModal({
                                                  open,
                                                  onClose,
                                                  dotThiId,
                                                  cuocThiId
                                              }) {


    const [data, setData] = useState([]);

    const {
        dsLinhVuc
    } = useLinhVucSelect();

    const {
        dsNhomCauHoi
    } = useNhomCauHoiSelect();


    // load

    const fetchData = async () => {

        const res =
            await layTracNghiemDotThi(
                dotThiId,
                cuocThiId
            );

        setData(res.data);

    };


    useEffect(() => {

        if (open) {
            fetchData();
        }


    }, [open]);


    // add

    const handleAdd = async () => {

        await themTracNghiemDotThi(
            dotThiId,
            cuocThiId,
            {
                linh_vuc_id: null,
                nhom_id: null,
                so_luong: 1
            }
        );

        fetchData();

    };


    // update

    const updateRow = async (
        id,
        field,
        value
    ) => {

        const row =
            data.find(i => i?.id === id);

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

    };


    // delete

    const handleDelete = async (id) => {

        await xoaTracNghiemDotThi(
            id,
            dotThiId,
            cuocThiId
        );

        fetchData();

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
            title: "Số lượng",
            render: (r) => (

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
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
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
                rowKey="id"
                dataSource={data}
                columns={columns}
                pagination={false}
            />

        </Modal>

    );

}