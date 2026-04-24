'use client';

import Image from "next/image";
import {App, Button, Card, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";

import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl, uploadFile} from "~/services/file";
import {parseMediaConfig} from "~/utils/workspaceTheme";

export default function FaviconEditor({workspaceId = null}) {
    const {message} = App.useApp();
    const [image, setImage] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            const res =
                await layCauHinh("favicon", {workspaceId});

            if (!active || !res.data?.gia_tri) {
                return;
            }

            const parsed = parseMediaConfig(res.data.gia_tri);
            setImage(parsed.duongDan || parsed.url || "");
        };

        void load();

        return () => {
            active = false;
        };
    }, [workspaceId]);

    const save = async (duongDan) => {
        await suaCauHinh(
            "favicon",
            JSON.stringify({duongDan}),
            {workspaceId}
        );
    };

    const handleUpload = async (file) => {
        const res =
            await uploadFile(file);

        const duongDan =
            res?.duongDan || res?.duong_dan || res?.url;

        setImage(duongDan);
        await save(duongDan);

        message.success("Đã cập nhật favicon");

        return false;
    };

    return (
        <Card title="Favicon hiển thị">
            <Upload
                showUploadList={false}
                beforeUpload={handleUpload}
                accept=".png,.jpg,.jpeg,.ico,.svg,.webp"
            >
                <Button icon={<UploadOutlined />}>
                    Tải favicon
                </Button>
            </Upload>

            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {image ? (
                        <Image
                            src={getPublicFileUrl(image)}
                            alt="Favicon preview"
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain"
                        />
                    ) : (
                        <span className="text-xs text-slate-400">Chưa có</span>
                    )}
                </div>

                <div className="text-sm leading-6 text-slate-500">
                    Khuyến nghị dùng ảnh vuông 32x32, 64x64 hoặc 128x128 để hiển thị rõ trên tab trình duyệt.
                </div>
            </div>
        </Card>
    );
}
