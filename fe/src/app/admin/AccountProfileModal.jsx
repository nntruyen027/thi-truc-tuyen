'use client';

import {App, Button, Form, Input, Modal, Select, Space, Typography} from "antd";
import {useEffect, useState} from "react";
import {useModal} from "~/store/modal";
import {useAuthStore} from "~/store/auth";
import {thayDoiThongTinCaNhan} from "~/services/auth";
import {useDonViSelect} from "~/hook/useDonVi";

const {Text} = Typography;

export default function AccountProfileModal() {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const {isEditOpen, setIsEditClose} = useModal();
    const {user, setUser} = useAuthStore();
    const [submitting, setSubmitting] = useState(false);

    const {
        dsDonVi,
        loading: donViLoading,
        setSearchDonVi,
        loadMore,
    } = useDonViSelect();

    useEffect(() => {
        if (!isEditOpen || !user) {
            return;
        }

        form.setFieldsValue({
            username: user.username,
            hoTen: user.ho_ten,
            donViId: user?.don_vi?.id,
        });
    }, [form, isEditOpen, user]);

    const handleClose = () => {
        form.resetFields();
        setIsEditClose();
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            const data = await thayDoiThongTinCaNhan({
                hoTen: values.hoTen,
                donViId: values.donViId,
            });

            setUser(data);
            message.success("Đã cập nhật thông tin tài khoản");
            handleClose();
        } catch (error) {
            message.error(error.message || "Không thể cập nhật thông tin");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={isEditOpen}
            onCancel={handleClose}
            title="Thông tin tài khoản"
            footer={null}
            width={560}
            destroyOnHidden
        >
            <Space direction="vertical" size={18} className="w-full">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <Text className="text-slate-500">
                        Cập nhật thông tin hiển thị của tài khoản quản trị. Tên đăng nhập được giữ cố định.
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        label="Họ tên"
                        name="hoTen"
                        rules={[
                            {required: true, message: "Vui lòng nhập họ tên"},
                        ]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>

                    <Form.Item
                        label="Đơn vị"
                        name="donViId"
                        rules={[
                            {required: true, message: "Vui lòng chọn đơn vị"},
                        ]}
                    >
                        <Select
                            showSearch
                            allowClear
                            placeholder="Chọn đơn vị"
                            loading={donViLoading}
                            filterOption={false}
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

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Button onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Space>
        </Modal>
    );
}
