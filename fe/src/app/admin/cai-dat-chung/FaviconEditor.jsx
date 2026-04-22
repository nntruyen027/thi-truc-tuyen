'use client';

import {App, Button, Card, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";

import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl, uploadFile} from "~/services/file";

export default function FaviconEditor() {
    const {message} = App.useApp();
    const [image, setImage] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            const res =
                await layCauHinh("favicon");

            if (!active || !res.data?.gia_tri) {
                return;
            }

            try {
                const parsed =
                    JSON.parse(res.data.gia_tri);

                setImage(
                    typeof parsed === "string"
                        ? parsed
                        : parsed?.url || ""
                );
            } catch {
                setImage(res.data.gia_tri);
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    const save = async (url) => {
        await suaCauHinh(
            "favicon",
            JSON.stringify({url})
        );
    };

    const handleUpload = async (file) => {
        const res =
            await uploadFile(file);

        const url =
            res?.url || res?.duong_dan;

        setImage(url);
        await save(url);

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
                        <img
                            src={getPublicFileUrl(image)}
                            alt="Favicon preview"
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
