'use client'

import {App, Button, Divider, Form, Input} from "antd";

import {useState} from "react";

import {login} from "~/services/auth";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function DangKy() {

    const router = useRouter();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);


    const onDangNhap = async (values) => {

        setLoading(true);

        try {

            const {user} = await login(values.username, values.password);

            message.success("Đăng nhập thành công");

            if(user.role === 'admin')
                router.replace('admin/dashboard');
            else
                router.replace('user');

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
                    Đăng nhập
                </h2>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onDangNhap}
                >


                    <Form.Item
                        label="Số điện thoại"
                        name="username"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại hoặc tên đăng nhập" },
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
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: true, message: "Nhập mật khẩu" },
                                    { min: 5, message: "Ít nhất 5 ký tự" },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>




                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        Đăng nhập
                    </Button>

                </Form>


                <Divider />

                <div className="text-center">
                    <Link href="/dang-ky">
                        Chưa có tài khoản? Đăng ký
                    </Link>
                </div>

            </div>

        </div>

    );

}