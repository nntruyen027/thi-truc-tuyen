'use client'

import {useEffect, useState} from "react";
import {Button, Card, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";

import {usePageInfoStore} from "~/store/page-info";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl, uploadFile} from "~/services/file";


export default function TaiLieuPage({
                                        title,
                                        khoa
                                    }) {

    const setPageInfo =
        usePageInfoStore(
            s => s.setPageInfo
        );

    const [url, setUrl] =
        useState(null);


    useEffect(() => {

        setPageInfo({
            title
        });

        load();

    }, []);


    const load = async () => {

        const res =
            await layCauHinh(
                khoa
            );

        if (!res.data) return;

        const val =
            JSON.parse(
                res.data.gia_tri
            );

        setUrl(val.url);

    };


    const upload =
        async (file) => {

            const res =
                await uploadFile(
                    file
                );

            const u =
                res.duong_dan;

            setUrl(u);

            await suaCauHinh(
                khoa,
                JSON.stringify({
                    url: u
                })
            );

            return false;

        };


    return (

        <div
            style={{
                maxWidth: 1000,
                margin: "0 auto"
            }}
        >

            <Card
                title={title}
            >

                <Upload
                    showUploadList={false}
                    beforeUpload={upload}
                >

                    <Button
                        icon={
                            <UploadOutlined/>
                        }
                    >
                        Upload PDF
                    </Button>

                </Upload>


                {url && (

                    <iframe
                        src={
                            getPublicFileUrl(
                                url
                            )
                        }
                        width="100%"
                        height="800"
                        style={{
                            marginTop: 10
                        }}
                    />

                )}

            </Card>

        </div>

    );

}