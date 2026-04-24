'use client';

import {Button, Card, Form, Input} from "antd";
import {useEffect} from "react";
import useApp from "antd/es/app/useApp";

import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";

export default function FooterMetaEditor({workspaceId = null}) {
    const [form] = Form.useForm();
    const {message} = useApp();

    useEffect(() => {
        let active = true;

        const load = async () => {
            const res =
                await layCauHinh("footer_meta", {workspaceId});

            if (!active || !res.data?.gia_tri) {
                return;
            }

            try {
                const value =
                    JSON.parse(res.data.gia_tri);

                form.setFieldsValue(value);
            } catch {
                form.setFieldsValue({});
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [form, workspaceId]);

    const save = async () => {
        try {
            const values =
                await form.validateFields();

            await suaCauHinh(
                "footer_meta",
                JSON.stringify(values),
                {workspaceId}
            );

            message.success("Đã cập nhật thông tin footer");
        } catch (e) {
            if (e?.message) {
                message.error(e.message);
            }
        }
    };

    return (
        <Card title="Thông tin thương hiệu footer">
            <Form form={form} layout="vertical">
                <Form.Item name="tenDonVi" label="Tên đơn vị / thương hiệu">
                    <Input placeholder="Ví dụ: Hệ thống thi trực tuyến VNPT" />
                </Form.Item>

                <Form.Item name="moTaNgan" label="Mô tả ngắn">
                    <Input.TextArea
                        rows={3}
                        placeholder="Mô tả ngắn gọn hiển thị ở đầu footer"
                    />
                </Form.Item>

                <Form.Item name="diaChi" label="Địa chỉ">
                    <Input />
                </Form.Item>

                <Form.Item name="hotline" label="Hotline">
                    <Input />
                </Form.Item>

                <Form.Item name="email" label="Email liên hệ">
                    <Input />
                </Form.Item>

                <Form.Item name="website" label="Website">
                    <Input />
                </Form.Item>

                <div className="flex justify-end">
                    <Button type="primary" onClick={save}>
                        Lưu lại
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
