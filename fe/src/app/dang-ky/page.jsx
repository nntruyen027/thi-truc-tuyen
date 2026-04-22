'use client'

import {
    App,
    Form,
    Input,
    Select,
    Button,
    Divider, Row, Col,
} from "antd";

import { useState } from "react";
import { useDonViSelect } from "~/hook/useDonVi";
import { dangKy } from "~/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DangKy() {

    const router = useRouter();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);

    const { dsDonVi, loading: donViLoading, setSearchDonVi, loadMore } = useDonViSelect();

    const onDangKy = async (values) => {

        setLoading(true);

        try {

            await dangKy(values);

            message.success("Đăng ký thành công");

            router.push("/login");

        } catch (error) {

            message.error(error.message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: "url('/bg_auth.jpg')"
            }}
        >


            <div
                className="
                relative
                w-full
                max-w-md
                bg-white/95
                backdrop-blur
                p-6
                rounded-xl
                shadow-2xl
                "
            >

                <h2 className="text-xl font-bold text-center mb-4 text-[#1948be] uppercase">
                    Đăng ký tài khoản
                </h2>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onDangKy}
                >


                    <Form.Item
                        label="Số điện thoại"
                        name="username"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại" },
                            {
                                pattern: /^0[0-9]{9}$/,
                                message: "Số điện thoại không hợp lệ",
                            },
                        ]}
                    >
                        <Input
                            maxLength={10}
                            onChange={(e) => {
                                e.target.value =
                                    e.target.value.replace(/\D/g, "");
                            }}
                        />
                    </Form.Item>


                    <Form.Item
                        label="Họ tên"
                        name="hoTen"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Đơn vị"
                        name="donViId"
                        rules={[
                            { required: true, message: "Vui lòng chọn đơn vị" },
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
                                    target.scrollTop +
                                    target.offsetHeight >=
                                    target.scrollHeight - 10
                                ) {

                                    loadMore();

                                }

                            }}
                        />
                    </Form.Item>


                    <Row gutter={16}>

                        <Col xs={24} lg={12}>
                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: true, message: "Nhập mật khẩu" },
                                    { min: 6, message: "Ít nhất 6 ký tự" },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Form.Item
                                label="Nhập lại mật khẩu"
                                name="repeatPassword"
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: "Nhập lại mật khẩu" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error("Mật khẩu không khớp")
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>

                    </Row>


                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        Đăng ký
                    </Button>

                </Form>

                <div className="text-red-600 text-sm mt-3 text-center">
                    (*) Mỗi thí sinh chỉ đăng ký 1 tài khoản
                </div>

                <Divider />

                <div className="text-center">
                    <Link href="/login">
                        Đã có tài khoản? Đăng nhập
                    </Link>
                </div>

            </div>

        </div>

    );

}