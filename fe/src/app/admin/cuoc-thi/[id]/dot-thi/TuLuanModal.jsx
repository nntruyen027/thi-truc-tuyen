'use client';

import {App, Button, Grid, Input, Modal, Popconfirm, Table} from "antd";

import {useEffect, useState} from "react";

import {layTuLuanDotThi, suaTuLuanDotThi, themTuLuanDotThi, xoaTuLuanDotThi} from "~/services/thi/dot-thi";


export default function TuLuanDotThiModal({

                                              open,
                                              onClose,
                                              dotThiId,
                                              cuocThiId

}) {
    const {message} = App.useApp();
    const screens = Grid.useBreakpoint();

    const [data, setData] = useState([]);

    const updateLocal = (id, field, value) => {

        setData(prev =>
            prev.map(i =>
                i.id === id
                    ? { ...i, [field]: value }
                    : i
            )
        );

    };


    // load

    const fetchData = async () => {
        try {
            const res =
                await layTuLuanDotThi(
                    dotThiId,
                    cuocThiId
                );

            setData(
                res.data || []
            );
        } catch (e) {
            message.error(e.message);
        }

    };


    useEffect(() => {

        if (open) {
            const timer =
                setTimeout(() => {
                    void fetchData();
                }, 0);

            return () => clearTimeout(timer);
        }

    }, [open]);


    // add

    const handleAdd = async () => {
        try {
            await themTuLuanDotThi(
                dotThiId,
                cuocThiId,
                {
                    cau_hoi: "",
                    goi_y: ""
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
            data.find(
                i => i.id === id
            );

        try {
            await suaTuLuanDotThi(
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

    const handleDelete = async (
        id
    ) => {

        try {
            await xoaTuLuanDotThi(
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
            title: "Câu hỏi",

            render: (r) => (

                <Input.TextArea

                    value={r.cau_hoi}

                    autoSize

                    onChange={(e) =>
                        updateLocal(
                            r.id,
                            "cau_hoi",
                            e.target.value
                        )
                    }

                    onBlur={(e) =>
                        updateRow(
                            r.id,
                            "cau_hoi",
                            e.target.value
                        )
                    }

                />

            )

        },

        {
            title: "Gợi ý",

            render: (r) => (

                <Input.TextArea

                    value={r.goi_y}

                    autoSize

                    onChange={(e) =>
                        updateLocal(
                            r.id,
                            "goi_y",
                            e.target.value
                        )
                    }

                    onBlur={(e) =>
                        updateRow(
                            r.id,
                            "goi_y",
                            e.target.value
                        )
                    }

                />

            )

        },

        {
            title: "",

            width: 80,

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

            width={screens.md ? 900 : "calc(100vw - 24px)"}

            title="Quản lý câu tự luận"

        >

            <Button

                type="primary"

                onClick={handleAdd}

                style={{
                    marginBottom: 10
                }}

            >

                Thêm

            </Button>


            <Table
                className="admin-table"

                rowKey="id"

                dataSource={data}

                columns={columns}

                pagination={false}

                scroll={{x: 780}}

            />

        </Modal>

    );

}
