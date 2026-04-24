import {App, Button, Card, Slider, Typography, Upload} from "antd";
import {useEffect, useState} from "react";
import {UploadOutlined} from "@ant-design/icons";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl, uploadFile} from "~/services/file";
import {parseMediaConfig} from "~/utils/workspaceTheme";

export default function BannerEditor({
    title,
    khoa,
    aspectRatio = "16/9",
    workspaceId = null,
}) {
    const {message} = App.useApp();
    const [image, setImage] = useState("");
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res = await layCauHinh(khoa, {workspaceId});

                if (!active || !res?.data?.gia_tri) {
                    return;
                }

                const value = parseMediaConfig(res.data.gia_tri);

                setImage(value.duongDan || value.url || "");
                setZoom(value.zoom || 1);
            } catch (error) {
                if (active) {
                    message.error(error?.message || "Không thể tải banner.");
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [khoa, message, workspaceId]);

    const save = async (duongDan, nextZoom) => {
        await suaCauHinh(
            khoa,
            JSON.stringify({
                duongDan,
                zoom: nextZoom,
            }),
            {workspaceId}
        );
    };

    const handleUpload = async (file) => {
        try {
            const res = await uploadFile(file);
            const duongDan = res?.duongDan || res?.duong_dan || res?.url || "";

            setImage(duongDan);
            await save(duongDan, zoom);
            message.success("Đã cập nhật banner");
        } catch (error) {
            message.error(error?.message || "Không thể tải banner.");
        }

        return false;
    };

    const changeZoom = async (nextZoom) => {
        setZoom(nextZoom);

        if (!image) {
            return;
        }

        try {
            await save(image, nextZoom);
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật zoom banner.");
        }
    };

    return (
        <Card title={title} className="rounded-[28px] border border-slate-200 shadow-sm">
            <Typography.Text type="secondary">
                Tỷ lệ khuyến nghị: {aspectRatio}
            </Typography.Text>

            <div className="mt-4 flex flex-wrap gap-3">
                <Upload
                    showUploadList={false}
                    beforeUpload={handleUpload}
                    accept=".png,.jpg,.jpeg,.webp"
                >
                    <Button icon={<UploadOutlined/>}>
                        Tải ảnh
                    </Button>
                </Upload>
            </div>

            <div
                style={{
                    marginTop: 12,
                    width: "100%",
                    aspectRatio,
                    border: "1px solid rgba(148,163,184,0.35)",
                    overflow: "hidden",
                    position: "relative",
                    borderRadius: 24,
                    background: "#f8fafc",
                }}
            >
                {image ? (
                    <img
                        src={getPublicFileUrl(image)}
                        alt=""
                        style={{
                            width: `${100 * zoom}%`,
                            height: `${100 * zoom}%`,
                            objectFit: "cover",
                            objectPosition: "center",
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        Chưa có banner
                    </div>
                )}
            </div>

            <div className="mt-4">
                Zoom
                <Slider
                    min={1}
                    max={2}
                    step={0.1}
                    value={zoom}
                    onChange={changeZoom}
                />
            </div>
        </Card>
    );
}
