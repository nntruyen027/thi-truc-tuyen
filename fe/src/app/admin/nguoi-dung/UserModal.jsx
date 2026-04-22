'use client'

import {App, Form, Input, Modal, Select} from "antd";
import {useEffect} from "react";

import {useDonViSelect} from "~/hook/useDonVi";
import {suaNguoiDung, themNguoiDung} from "~/services/dm_chung/nguoi_dung";

export default function UserModal({
    open,
    data,
    onClose,
    onSuccess,
}) {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const {dsDonVi, loading: donViLoading, setSearchDonVi, loadMore} = useDonViSelect();

    useEffect(() => {
        if (!open) {
            form.resetFields();
            return;
        }

        if (data) {
            form.setFieldsValue({
                username: data.username,
                hoTen: data.ho_ten,
                donViId: data?.don_vi?.id || data?.don_vi_id || null,
                role: data.role || "user",
                password: "",
            });
            return;
        }

        form.setFieldsValue({
            role: "user",
            password: "",
        });
    }, [data, form, open]);

    const handleOk = async () => {
        try {
            const values =
                await form.validateFields();

            const payload = {
                username: values.username?.trim(),
                hoTen: values.hoTen?.trim(),
                donViId: values.donViId || null,
                role: values.role || "user",
            };

            if (values.password) {
                payload.password = values.password;
            }

            if (data) {
                await suaNguoiDung(data.id, payload);
                message.success("Đã cập nhật tài khoản");
            } else {
                if (!payload.password) {
                    throw new Error("Vui lòng nhập mật khẩu cho tài khoản mới.");
                }

                await themNguoiDung(payload);
                message.success("Đã tạo tài khoản");
            }

            form.resetFields();
            onSuccess();
        } catch (e) {
            if (e?.message) {
                message.error(e.message);
            }
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText={data ? "Cập nhật" : "Thêm mới"}
            cancelText="Thoát"
            title={data ? "Chỉnh sửa tài khoản" : "Thêm tài khoản quản trị/người dùng"}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[{required: true, message: "Vui lòng nhập tên đăng nhập"}]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="hoTen"
                    label="Họ tên"
                    rules={[{required: true, message: "Vui lòng nhập họ tên"}]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="donViId"
                    label="Đơn vị"
                >
                    <Select
                        allowClear
                        showSearch
                        loading={donViLoading}
                        filterOption={false}
                        placeholder="Chọn đơn vị"
                        options={dsDonVi.map((item) => ({
                            label: item.ten,
                            value: item.id,
                        }))}
                        onSearch={setSearchDonVi}
                        onPopupScroll={(e) => {
                            const target = e.target;

                            if (
                                target.scrollTop + target.offsetHeight >=
                                target.scrollHeight - 10
                            ) {
                                loadMore();
                            }
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Quyền"
                    rules={[{required: true, message: "Vui lòng chọn quyền"}]}
                >
                    <Select
                        options={[
                            {label: "Người dùng", value: "user"},
                            {label: "Admin", value: "admin"},
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={data ? "Mật khẩu mới" : "Mật khẩu"}
                    extra={data ? "Bỏ trống nếu không đổi mật khẩu." : "Nhập mật khẩu ban đầu cho tài khoản."}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
}
