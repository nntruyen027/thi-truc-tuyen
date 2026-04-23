'use client'

import {useEffect, useMemo, useState} from "react";
import {App, Button, DatePicker, Form, Image, Input, Modal} from "antd";
import dayjs from "dayjs";
import Editor from "~/app/components/common/Editor";
import {getPublicFileUrl, uploadFile} from "~/services/file";

export default function BaiVietModal({open, data, onClose, onSuccess}) {
    const [form] = Form.useForm();
    const {message} = App.useApp();
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const anhDaiDien = Form.useWatch("anhDaiDien", form);

    const initialValues = useMemo(() => ({
        tieuDe: data?.tieuDe || "",
        tomTat: data?.tomTat || "",
        anhDaiDien: data?.anhDaiDien || "",
        noiDung: data?.noiDung || "",
        ngayDang: data?.ngayDang ? dayjs(data.ngayDang) : dayjs(),
    }), [data]);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            return;
        }

        form.setFieldsValue(initialValues);
    }, [form, initialValues, open]);

    const handleUploadAnh = async (file) => {
        try {
            setUploading(true);
            const res = await uploadFile(file);
            const duongDan = res.duong_dan || res.url || "";
            form.setFieldValue("anhDaiDien", duongDan);
            message.success("Đã tải ảnh đại diện");
        } catch (e) {
            message.error(e.message);
        } finally {
            setUploading(false);
        }

        return false;
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            const values = await form.validateFields();

            await onSuccess({
                ...data,
                ...values,
                ngayDang: values.ngayDang.toISOString(),
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={data ? "Cập nhật bài viết" : "Thêm bài viết"}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={data ? "Cập nhật" : "Tạo bài viết"}
            cancelText="Thoát"
            width={960}
            confirmLoading={saving}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="tieuDe"
                    label="Tiêu đề"
                    rules={[{required: true, message: "Vui lòng nhập tiêu đề"}]}
                >
                    <Input placeholder="Nhập tiêu đề bài viết"/>
                </Form.Item>

                <Form.Item
                    name="tomTat"
                    label="Tóm tắt"
                    rules={[{required: true, message: "Vui lòng nhập tóm tắt"}]}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Mô tả ngắn hiển thị ở trang chủ"
                    />
                </Form.Item>

                <Form.Item
                    name="ngayDang"
                    label="Ngày đăng"
                    rules={[{required: true, message: "Vui lòng chọn ngày đăng"}]}
                >
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        className="w-full"
                    />
                </Form.Item>

                <Form.Item name="anhDaiDien" label="Ảnh đại diện">
                    <Input placeholder="Đường dẫn ảnh đại diện"/>
                </Form.Item>

                <div className="mb-4 flex flex-wrap items-start gap-4">
                    <Button loading={uploading}>
                        <label className="cursor-pointer">
                            Tải ảnh đại diện
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                        void handleUploadAnh(file);
                                    }
                                    event.target.value = "";
                                }}
                            />
                        </label>
                    </Button>

                    {anhDaiDien && (
                        <Image
                            width={180}
                            height={110}
                            className="rounded-xl object-cover"
                            src={getPublicFileUrl(anhDaiDien)}
                            alt="Ảnh đại diện"
                        />
                    )}
                </div>

                <Form.Item
                    name="noiDung"
                    label="Nội dung"
                    rules={[{required: true, message: "Vui lòng nhập nội dung bài viết"}]}
                >
                    <Editor/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

