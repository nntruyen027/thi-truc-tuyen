'use client';

import {App, Button, Form, Input, Modal, Space, Typography} from "antd";
import {useState} from "react";
import {useModal} from "~/store/modal";
import {thayDoiMatKhau} from "~/services/auth";

const {Text} = Typography;

export default function ChangePasswordModal() {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const {isUpdatePassOpen, SetIsUpdatePassClose} = useModal();
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        form.resetFields();
        SetIsUpdatePassClose();
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            await thayDoiMatKhau({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
                repeatPass: values.repeatPass,
            });

            message.success("Đã cập nhật mật khẩu");
            handleClose();
        } catch (error) {
            message.error(error.message || "Không thể đổi mật khẩu");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={isUpdatePassOpen}
            onCancel={handleClose}
            title="Đổi mật khẩu"
            footer={null}
            width={520}
            forceRender
            destroyOnHidden
        >
            <Space direction="vertical" size={18} className="w-full">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <Text className="text-slate-500">
                        Mật khẩu mới nên có ít nhất 6 ký tự và không trùng với mật khẩu cũ.
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="oldPassword"
                        rules={[
                            {required: true, message: "Vui lòng nhập mật khẩu hiện tại"},
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            {required: true, message: "Vui lòng nhập mật khẩu mới"},
                            {min: 6, message: "Ít nhất 6 ký tự"},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || String(value).trim()) {
                                        if (!value || getFieldValue("oldPassword") !== value) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject(new Error("Mật khẩu mới không được trùng mật khẩu hiện tại"));
                                    }

                                    return Promise.reject(new Error("Mật khẩu không hợp lệ"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="repeatPass"
                        dependencies={["newPassword"]}
                        rules={[
                            {required: true, message: "Vui lòng nhập lại mật khẩu mới"},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Button onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </div>
                </Form>
            </Space>
        </Modal>
    );
}
