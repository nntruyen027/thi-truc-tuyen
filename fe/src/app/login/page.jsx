'use client'

import {App, Button, Divider, Form, Input, theme} from "antd";

import {useState} from "react";

import {login} from "~/services/auth";
import {useRouter} from "next/navigation";
import Link from "next/link";
import AuthShell from "~/app/components/common/AuthShell";

export default function DangKy() {

    const router = useRouter();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const {token} = theme.useToken();


    const onDangNhap = async (values) => {

        setLoading(true);

        try {

            const {user} = await login(values.username, values.password);

            message.success("Đăng nhập thành công");

            if(user.role === 'super_admin')
                router.replace('/super-admin');
            else if(user.role === 'admin')
                router.replace('/admin/dashboard');
            else
                router.replace('/user');

        } catch (error) {

            message.error(error.message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthShell
            title="Đăng nhập"
            subtitle="Đăng nhập để tham gia thi hoặc truy cập khu vực quản trị."
        >

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onDangNhap}
                    size="large"
                >


                    <Form.Item
                        label="Số điện thoại"
                        name="username"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại hoặc tên đăng nhập" },
                            {
                                validator: (_, value) => {
                                    if (!value || String(value).trim()) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(new Error("Tên đăng nhập không hợp lệ"));
                                },
                            },
                        ]}
                    >
                        <Input
                            maxLength={10}
                            inputMode="numeric"
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
                                    {
                                        validator: (_, value) => {
                                            if (!value || String(value).trim()) {
                                                return Promise.resolve();
                                            }

                                            return Promise.reject(new Error("Mật khẩu không hợp lệ"));
                                        },
                                    },
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

                <div className="text-center text-sm text-slate-600">
                    <Link href="/dang-ky" style={{color: token.colorPrimary, fontWeight: 600}}>
                        Chưa có tài khoản? Đăng ký
                    </Link>
                </div>
        </AuthShell>

    );

}
