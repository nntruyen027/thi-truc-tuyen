'use client';

import {App, Button, Card, Form, Select, Switch, Typography} from "antd";
import {useEffect} from "react";

import {layCauHinhTrangChu, luuCauHinhTrangChu} from "~/services/trang-chu";
import {TUY_CHON_TRANG_CHU} from "~/utils/trang-chu";

const {Text} = Typography;

export default function HomePageDisplayEditor() {
    const [form] = Form.useForm();
    const {message} = App.useApp();

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res = await layCauHinhTrangChu();

                if (!active) {
                    return;
                }

                form.setFieldsValue(res.data);
            } catch (error) {
                if (active) {
                    message.error(error?.message || "Không thể tải cấu hình trang chủ.");
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [form, message]);

    const save = async () => {
        try {
            const values = await form.validateFields();

            await luuCauHinhTrangChu(values);
            message.success("Đã cập nhật cấu hình hiển thị trang chủ");
        } catch (error) {
            if (error?.message) {
                message.error(error.message);
            }
        }
    };

    return (
        <Card title="Hiển thị trang chủ" className="rounded-[28px] border border-slate-200 shadow-sm">
            <Form form={form} layout="vertical" initialValues={{showAllDemos: true, selectedDemo: "demo0"}}>
                <Form.Item
                    name="selectedDemo"
                    label="Trang chủ đang sử dụng"
                    rules={[{
                        required: true,
                        message: "Vui lòng chọn trang chủ hiển thị.",
                    }]}
                >
                    <Select
                        placeholder="Chọn trang chủ"
                        options={TUY_CHON_TRANG_CHU.map((item) => ({
                            value: item.key,
                            label: item.label,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="showAllDemos"
                    label="Hiển thị tất cả demo"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>

                <div className="mb-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <Text className="!block !text-sm !leading-6 !text-slate-600">
                        Khi tắt tùy chọn này, các đường dẫn `/demo1`, `/demo2`, `/demo3`, `/demo4` sẽ tự chuyển về trang chủ đang được chọn.
                    </Text>
                </div>

                <div className="flex justify-end">
                    <Button type="primary" onClick={save}>
                        Cập nhật cấu hình
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
