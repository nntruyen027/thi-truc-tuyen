import {App, Button, Card, Flex, Slider, Typography, Upload} from "antd";
import {useEffect, useState} from "react";
import {UploadOutlined} from "@ant-design/icons";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl, uploadFile} from "~/services/file";
import {parseMediaConfig} from "~/utils/workspaceTheme";

export default function BannerEditor({
    title,
    khoa,
    aspectRatio = "16/9",
    disabled = false,
}) {
    const {message} = App.useApp();
    const [image, setImage] = useState("");
    const [zoom, setZoom] = useState(1);
    const [positionX, setPositionX] = useState(50);
    const [positionY, setPositionY] = useState(50);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res = await layCauHinh(khoa);

                if (!active) {
                    return;
                }

                if (!res?.data?.gia_tri) {
                    setImage("");
                    setZoom(1);
                    setPositionX(50);
                    setPositionY(50);
                    return;
                }

                const value = parseMediaConfig(res.data.gia_tri);

                setImage(value.duongDan || value.url || "");
                setZoom(value.zoom || 1);
                setPositionX(value.positionX || 50);
                setPositionY(value.positionY || 50);
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
    }, [khoa, message]);

    const save = async (
        duongDan,
        nextZoom,
        nextPositionX = positionX,
        nextPositionY = positionY,
    ) => {
        await suaCauHinh(
            khoa,
            JSON.stringify({
                duongDan,
                zoom: nextZoom,
                positionX: nextPositionX,
                positionY: nextPositionY,
            })
        );
    };

    const handleUpload = async (file) => {
        try {
            const res = await uploadFile(file);
            const duongDan = res?.duongDan || res?.duong_dan || res?.url || "";

            setImage(duongDan);
            await save(duongDan, zoom, positionX, positionY);
            message.success("Đã cập nhật banner");
        } catch (error) {
            message.error(error?.message || "Không thể tải banner.");
        }

        return false;
    };

    const changeZoom = (nextZoom) => {
        setZoom(nextZoom);
    };

    const saveZoom = async (nextZoom) => {
        if (!image) {
            return;
        }

        try {
            await save(image, nextZoom, positionX, positionY);
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật zoom banner.");
        }
    };

    const changePosition = (axis, nextValue) => {
        if (axis === "x") {
            setPositionX(nextValue);
        } else {
            setPositionY(nextValue);
        }
    };

    const savePosition = async (axis, nextValue) => {
        if (!image) {
            return;
        }

        const nextPositionX = axis === "x" ? nextValue : positionX;
        const nextPositionY = axis === "y" ? nextValue : positionY;

        try {
            await save(image, zoom, nextPositionX, nextPositionY);
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật vị trí banner.");
        }
    };

    const applyPreset = async (nextPositionX, nextPositionY) => {
        setPositionX(nextPositionX);
        setPositionY(nextPositionY);

        if (!image) {
            return;
        }

        try {
            await save(image, zoom, nextPositionX, nextPositionY);
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật vị trí banner.");
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
                    disabled={disabled}
                >
                    <Button icon={<UploadOutlined/>} disabled={disabled}>
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
                            objectPosition: `${positionX}% ${positionY}%`,
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
                    onChangeComplete={saveZoom}
                    disabled={disabled || !image}
                />
            </div>

            <div className="mt-4">
                Vị trí ngang
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={positionX}
                    onChange={(value) => changePosition("x", value)}
                    onChangeComplete={(value) => savePosition("x", value)}
                    disabled={disabled || !image}
                />
            </div>

            <div className="mt-2">
                Vị trí dọc
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={positionY}
                    onChange={(value) => changePosition("y", value)}
                    onChangeComplete={(value) => savePosition("y", value)}
                    disabled={disabled || !image}
                />
            </div>

            <div className="mt-4">
                <Typography.Text type="secondary">
                    Căn nhanh vùng hiển thị
                </Typography.Text>
                <Flex gap={8} wrap className="mt-2">
                    <Button size="small" disabled={disabled || !image} onClick={() => applyPreset(50, 50)}>
                        Căn giữa
                    </Button>
                    <Button size="small" disabled={disabled || !image} onClick={() => applyPreset(50, 30)}>
                        Ưu tiên phía trên
                    </Button>
                    <Button size="small" disabled={disabled || !image} onClick={() => applyPreset(50, 70)}>
                        Ưu tiên phía dưới
                    </Button>
                    <Button size="small" disabled={disabled || !image} onClick={() => applyPreset(35, 50)}>
                        Lệch trái nhẹ
                    </Button>
                    <Button size="small" disabled={disabled || !image} onClick={() => applyPreset(65, 50)}>
                        Lệch phải nhẹ
                    </Button>
                </Flex>
            </div>
        </Card>
    );
}
