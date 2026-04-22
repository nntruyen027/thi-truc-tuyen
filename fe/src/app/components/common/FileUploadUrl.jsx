'use client';

import {Button, Image, message, Popconfirm, Space, Typography, Upload} from "antd";
import {DeleteOutlined, EyeOutlined, FileOutlined, UploadOutlined} from "@ant-design/icons";
import {useState} from "react";
import {uploadFile} from "@/services/file";

const {Link, Text} = Typography;

export default function FileUploadUrl({
                                          value,
                                          onChange,
                                          accept,
                                          disabled,
                                          allowPreview = true,
                                          allowRemove = true // 👈 OPTION XOÁ
                                      }) {
    const [loading, setLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handleUpload = async ({file}) => {
        try {
            setLoading(true);
            const res = await uploadFile(file);
            const url = (res.url);
            onChange?.(url);
            message.success("Tải file thành công");
        } catch {
            message.error("Tải file thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onChange?.(null);
        message.success("Đã xoá file");
    };

    const isImage = value && /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
    const isPdf = value && /\.pdf$/i.test(value);

    return (
        <Space direction="vertical" size={8}>
            {/* ===== upload ===== */}
            <Upload
                showUploadList={false}
                customRequest={handleUpload}
                accept={accept}
                disabled={disabled || loading}
            >
                <Button
                    icon={<UploadOutlined/>}
                    loading={loading}
                    disabled={disabled}
                >
                    {value ? "Đổi file" : "Tải file"}
                </Button>
            </Upload>

            {/* ===== preview + actions ===== */}
            {value && (
                <Space size={12}>
                    {allowPreview && (
                        <>
                            {isImage ? (
                                <>
                                    <Image
                                        src={value}
                                        width={80}
                                        style={{borderRadius: 6}}
                                        preview={{
                                            visible: previewOpen,
                                            onVisibleChange: setPreviewOpen
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        icon={<EyeOutlined/>}
                                        onClick={() => setPreviewOpen(true)}
                                    />
                                </>
                            ) : (
                                <Link href={value} target="_blank">
                                    <Button
                                        size="small"
                                        icon={isPdf ? <EyeOutlined/> : <FileOutlined/>}
                                    />
                                </Link>
                            )}
                        </>
                    )}

                    {/* ===== delete ===== */}
                    {allowRemove && (
                        <Popconfirm
                            title="Xoá file này?"
                            onConfirm={handleRemove}
                            okText="Xoá"
                            cancelText="Huỷ"
                        >
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined/>}
                            />
                        </Popconfirm>
                    )}
                </Space>
            )}

            {/* ===== filename ===== */}
            {/*{value && (*/}
            {/*    <Text type="secondary" style={{fontSize: 12}}>*/}
            {/*        {value.split("/").pop()}*/}
            {/*    </Text>*/}
            {/*)}*/}
        </Space>
    );
}
