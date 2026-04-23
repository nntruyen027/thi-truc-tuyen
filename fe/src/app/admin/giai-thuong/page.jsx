'use client'

import {useCallback, useEffect} from "react";
import {App, Button, Card, Col, Form, Input, Row, Space, Typography} from "antd";
import {DeleteOutlined, PlusOutlined, TrophyOutlined} from "@ant-design/icons";
import {usePageInfoStore} from "~/store/page-info";
import {layCauHinhGiaiThuong, luuCauHinhGiaiThuong} from "~/services/giai-thuong";

const {Paragraph, Text} = Typography;

function GiaiThuongSection({name, label, helper}) {
    return (
        <Card
            className="rounded-[28px] border border-slate-200 shadow-sm"
            styles={{body: {padding: 24}}}
            title={
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1948be]">
                        <TrophyOutlined/>
                    </div>
                    <div>
                        <div className="text-base font-bold text-slate-900">{label}</div>
                        <Text className="!text-sm !text-slate-500">{helper}</Text>
                    </div>
                </div>
            }
        >
            <Form.List name={name}>
                {(fields, {add, remove}) => (
                    <Space direction="vertical" size={16} className="!flex">
                        {fields.map((field, index) => (
                            <Card
                                key={field.key}
                                className="rounded-[24px] border border-slate-200 bg-slate-50"
                                styles={{body: {padding: 20}}}
                                size="small"
                                title={`Giải ${index + 1}`}
                                extra={
                                    <Button
                                        danger
                                        type="text"
                                        icon={<DeleteOutlined/>}
                                        onClick={() => remove(field.name)}
                                    >
                                        Xóa
                                    </Button>
                                }
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name={[field.name, "tenGiai"]}
                                            label="Tên giải"
                                            rules={[{required: true, message: "Vui lòng nhập tên giải"}]}
                                        >
                                            <Input placeholder="Ví dụ: Giải Nhất"/>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name={[field.name, "soLuong"]}
                                            label="Số lượng"
                                            rules={[{required: true, message: "Vui lòng nhập số lượng"}]}
                                        >
                                            <Input placeholder="Ví dụ: 01"/>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name={[field.name, "triGia"]}
                                            label="Trị giá"
                                            rules={[{required: true, message: "Vui lòng nhập trị giá"}]}
                                        >
                                            <Input placeholder="Ví dụ: 10.000.000đ"/>
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item
                                            name={[field.name, "ghiChu"]}
                                            label="Ghi chú"
                                        >
                                            <Input.TextArea
                                                rows={2}
                                                placeholder="Ví dụ: Kèm giấy chứng nhận và quà tặng"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        ))}

                        <Button
                            icon={<PlusOutlined/>}
                            onClick={() => add({tenGiai: "", soLuong: "", triGia: "", ghiChu: ""})}
                        >
                            Thêm giải
                        </Button>
                    </Space>
                )}
            </Form.List>
        </Card>
    );
}

export default function GiaiThuongPage() {
    const [form] = Form.useForm();
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);
    const {message} = App.useApp();

    const load = useCallback(async () => {
        try {
            const value = await layCauHinhGiaiThuong();
            form.setFieldsValue(value);
        } catch (e) {
            message.error(e.message);
        }
    }, [form, message]);

    useEffect(() => {
        setPageInfo({title: "Giải thưởng cuộc thi"});
        void load();
    }, [load, setPageInfo]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            await luuCauHinhGiaiThuong(values);
            message.success("Đã lưu cấu hình giải thưởng");
        } catch (e) {
            if (e?.errorFields) {
                return;
            }

            message.error(e.message);
        }
    };

    return (
        <div className="space-y-5">
            <Card
                className="rounded-[32px] border border-slate-200 shadow-sm"
                styles={{body: {padding: 24}}}
            >
                <div className="space-y-2">
                    <div className="text-lg font-bold text-slate-900">Cấu hình giải thưởng</div>
                    <Paragraph className="!mb-0 !text-sm !leading-7 !text-slate-500">
                        Quản lý danh sách giải thưởng hiển thị ở trang chủ. Có thể cấu hình riêng giải cá nhân và giải tập thể, bao gồm tên giải, số lượng và trị giá.
                    </Paragraph>
                </div>
            </Card>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    tieuDe: "Giải thưởng cuộc thi",
                    moTa: "Thông tin giải thưởng dành cho cá nhân và tập thể tham gia cuộc thi.",
                    giaiCaNhan: [],
                    giaiTapThe: [],
                }}
            >
                <Card
                    className="rounded-[28px] border border-slate-200 shadow-sm"
                    styles={{body: {padding: 24}}}
                >
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="tieuDe"
                                label="Tiêu đề"
                                rules={[{required: true, message: "Vui lòng nhập tiêu đề"}]}
                            >
                                <Input placeholder="Giải thưởng cuộc thi"/>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="moTa"
                                label="Mô tả ngắn"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Giới thiệu ngắn về cơ cấu giải thưởng của cuộc thi"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <GiaiThuongSection
                        name="giaiCaNhan"
                        label="Giải cá nhân"
                        helper="Danh sách giải dành cho cá nhân tham gia cuộc thi"
                    />

                    <GiaiThuongSection
                        name="giaiTapThe"
                        label="Giải tập thể"
                        helper="Danh sách giải dành cho tập thể, đơn vị hoặc đội thi"
                    />
                </div>

                <div className="mt-5 flex justify-end">
                    <Button type="primary" onClick={handleSave}>
                        Lưu cấu hình giải thưởng
                    </Button>
                </div>
            </Form>
        </div>
    );
}
