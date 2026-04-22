'use client'

import {usePageInfoStore} from "~/store/page-info";
import {useEffect, useState} from "react";
import TaiLieuPage from "~/app/admin/tai-lieu-cong-khai/TaiLieuPage";

import {Button, Card, Collapse, Input, message, Upload} from "antd";

import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";

import {uploadFile} from "~/services/file";

import {UploadOutlined} from "@ant-design/icons";


const {Panel} = Collapse;


export default function Page() {

    const setPageInfo =
        usePageInfoStore(
            s => s.setPageInfo
        );

    const [docs, setDocs] =
        useState([]);

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {

        setPageInfo({
            title: "Tài liệu công khai"
        });

        load();

    }, []);


    const load = async () => {

        const res =
            await layCauHinh(
                "document"
            );

        if (!res.data) return;

        const val =
            JSON.parse(
                res.data.gia_tri
            );

        setDocs(val || []);

    };


    // chỉ update state
    const updateDoc = (list) => {
        setDocs(list);
    };


    // lưu param
    const save = async () => {

        setLoading(true);

        await suaCauHinh(
            "document",
            JSON.stringify(docs)
        );

        message.success("Đã lưu");

        setLoading(false);

    };


    const addDoc = () => {

        updateDoc([
            ...docs,
            {
                id: Date.now(),
                tieuDe: "",
                url: ""
            }
        ]);

    };


    const removeDoc = (id) => {

        updateDoc(
            docs.filter(
                x => x.id !== id
            )
        );

    };


    return (

        <Collapse
            defaultActiveKey={[
                "ke-hoach",
                "the-le",
                "document"
            ]}
        >

            {/* ================= */}
            {/* KẾ HOẠCH */}
            {/* ================= */}

            <Panel
                header="Kế hoạch"
                key="ke-hoach"
            >

                <TaiLieuPage
                    title="Kế hoạch"
                    khoa="ke_hoach"
                />

            </Panel>


            {/* ================= */}
            {/* THỂ LỆ */}
            {/* ================= */}

            <Panel
                header="Thể lệ"
                key="the-le"
            >

                <TaiLieuPage
                    title="Thể lệ"
                    khoa="the_le"
                />

            </Panel>


            {/* ================= */}
            {/* DOCUMENT */}
            {/* ================= */}

            <Panel
                header="Tài liệu khác"
                key="document"
            >

                <Card
                    extra={
                        <Button
                            onClick={addDoc}
                        >
                            Thêm tài liệu
                        </Button>
                    }
                >

                    {docs.map((d, i) => (

                        <Card
                            key={d.id}
                            style={{
                                marginBottom: 10
                            }}
                            extra={

                                <Button
                                    danger
                                    onClick={() =>
                                        removeDoc(
                                            d.id
                                        )
                                    }
                                >
                                    Xoá
                                </Button>

                            }
                        >

                            {/* tiêu đề */}

                            <Input
                                placeholder="Tiêu đề"
                                value={d.tieuDe}
                                style={{
                                    marginBottom: 10
                                }}
                                onChange={(e) => {

                                    const list =
                                        [...docs];

                                    list[i].tieuDe =
                                        e.target.value;

                                    updateDoc(list);

                                }}
                            />


                            {/* upload */}

                            <Upload
                                showUploadList={false}
                                beforeUpload={
                                    async (file) => {

                                        const res =
                                            await uploadFile(
                                                file
                                            );

                                        const list =
                                            [...docs];

                                        list[i].url =
                                            res.duong_dan;

                                        updateDoc(
                                            list
                                        );

                                        return false;
                                    }
                                }
                            >

                                <Button
                                    icon={
                                        <UploadOutlined/>
                                    }
                                >
                                    Tải lên PDF
                                </Button>

                            </Upload>


                            {d.url && (

                                <div
                                    style={{
                                        marginTop: 10,
                                        color: "green"
                                    }}
                                >
                                    {d.url}
                                </div>

                            )}

                        </Card>

                    ))}


                    <Button
                        type="primary"
                        loading={loading}
                        onClick={save}
                    >
                        Lưu tài liệu khác
                    </Button>

                </Card>

            </Panel>

        </Collapse>

    );

}