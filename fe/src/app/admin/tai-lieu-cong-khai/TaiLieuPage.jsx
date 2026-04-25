'use client'

import {useCallback, useEffect, useState} from "react";
import {App, Button, Card, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";

import {usePageInfoStore} from "~/store/page-info";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {MAX_UPLOAD_SIZE_MB, ensureUploadableFile, getPublicFileUrl, uploadFile} from "~/services/file";


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
    const {message} =
        App.useApp();

    const load = useCallback(async () => {

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

    }, [khoa]);


    useEffect(() => {

        let active = true;

        setPageInfo({
            title
        });

        const timer =
            setTimeout(async () => {
                if (!active) return;
                await load();
            }, 0);

        return () => {
            active = false;
            clearTimeout(timer);
        };

    }, [load, setPageInfo, title]);


    const upload =
        async (file) => {
            try {
                const normalizedFile =
                    ensureUploadableFile(file);

                const fileName =
                    String(normalizedFile.name || "").toLowerCase();
                const mimeType =
                    String(normalizedFile.type || "").toLowerCase();

                if (!mimeType.includes("pdf") && !fileName.endsWith(".pdf")) {
                    message.error("Chỉ cho phép tải lên file PDF");
                    return Upload.LIST_IGNORE;
                }
            } catch (error) {
                message.error(error?.message || `File vượt quá giới hạn ${MAX_UPLOAD_SIZE_MB}MB`);
                return Upload.LIST_IGNORE;
            }

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
                    accept=".pdf,application/pdf"
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
