'use client';

import {App, Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Row, Switch} from "antd";

import {useEffect} from "react";
import dayjs from "dayjs";

import {suaDotThi, themDotThi} from "~/services/thi/dot-thi";

const DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";


export default function DotThiModal({
                                        open,
                                        data,
                                        onClose,
                                        onSuccess,
                                        cuocThiId,
                                        cuocThi
                                    }) {

    const { message } = App.useApp();
    const [form] = Form.useForm();


    // ===== set data =====

    useEffect(() => {

        if (open) {

            if (data) {

                form.setFieldsValue({

                    ...data,

                    thoi_gian_bat_dau:
                        data.thoi_gian_bat_dau
                            ? dayjs(data.thoi_gian_bat_dau)
                            : null,

                    thoi_gian_ket_thuc:
                        data.thoi_gian_ket_thuc
                            ? dayjs(data.thoi_gian_ket_thuc)
                            : null,

                });

            } else {

                form.resetFields();

            }

        }

    }, [open, data, form]);


    // ===== save =====

    const handleOk = async () => {

        try {

            const values =
                await form.validateFields();

            const payload = {

                ...values,

            };

            if (data) {

                await suaDotThi(
                    data.id,
                    cuocThiId,
                    payload
                );

                message.success(
                    "Cập nhật đợt thi thành công"
                );

            } else {

                await themDotThi(
                    cuocThiId,
                    payload
                );

                message.success(
                    "Thêm đợt thi thành công"
                );

            }

            form.resetFields();

            onSuccess();

        } catch (e) {

            if (e?.message)
                message.error(e.message);

        }

    };


    const handleCancel = () => {

        form.resetFields();
        onClose();

    };

    const validateTime = (_, value) => {

        const start =
            form.getFieldValue(
                "thoi_gian_bat_dau"
            );

        const end =
            form.getFieldValue(
                "thoi_gian_ket_thuc"
            );

        if (!start || !end)
            return Promise.resolve();

        if (start.valueOf() >= end.valueOf())
            return Promise.reject(
                "Thời gian kết thúc phải sau bắt đầu"
            );

        return Promise.resolve();

    };

    const validateWindowInCuocThi = () => {
        const start =
            form.getFieldValue(
                "thoi_gian_bat_dau"
            );

        const end =
            form.getFieldValue(
                "thoi_gian_ket_thuc"
            );

        if (!start || !end || !cuocThi?.thoi_gian_bat_dau || !cuocThi?.thoi_gian_ket_thuc) {
            return Promise.resolve();
        }

        const cuocThiStart =
            dayjs(cuocThi.thoi_gian_bat_dau);

        const cuocThiEnd =
            dayjs(cuocThi.thoi_gian_ket_thuc);

        if (start.isBefore(cuocThiStart) || end.isAfter(cuocThiEnd)) {
            return Promise.reject(
                "Thời gian đợt thi phải nằm trong thời gian của cuộc thi"
            );
        }

        return Promise.resolve();
    };

    return (

        <Modal
            open={open}
            forceRender
            destroyOnClose
            title={
                data
                    ? "Sửa đợt thi"
                    : "Thêm đợt thi"
            }
            onCancel={handleCancel}
            onOk={handleOk}
            okText={
                data
                    ? "Cập nhật"
                    : "Thêm"
            }
            cancelText="Thoát"
            width={800}
        >

            <Form
                layout="vertical"
                form={form}
            >

                {/* tên */}

                <Form.Item
                    name="ten"
                    label="Tên đợt thi"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>


                {/* mô tả */}

                <Form.Item
                    name="mo_ta"
                    label="Mô tả"
                >
                    <Input.TextArea rows={2} />
                </Form.Item>


                {/* number */}

                <Row gutter={16}>

                    <Col span={8}>
                        <Form.Item
                            name="so_lan_tham_gia_toi_da"
                            label="Số lần thi tối đa"
                            rules={[
                                { required: true },
                                {
                                    type: "number",
                                    min: 1,
                                    message: ">= 1"
                                }
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="thoi_gian_thi"
                            label="Thời gian thi (phút)"
                            rules={[
                                { required: true },
                                {
                                    type: "number",
                                    min: 1,
                                    message: "Phải > 0"
                                }
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="ty_le_danh_gia_dat"
                            label="Tỷ lệ đạt (%)"
                            rules={[
                                { required: true },
                                {
                                    type: "number",
                                    min: 0,
                                    max: 100,
                                    message: "0 - 100"
                                }
                            ]}
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                </Row>


                {/* time */}

                <Row gutter={16}>

                    <Col span={12}>
                        <Form.Item
                            name="thoi_gian_bat_dau"
                            label="Bắt đầu"
                            rules={[
                                { required: true, message: "Chọn thời gian" },
                                { validator: validateTime },
                                { validator: validateWindowInCuocThi }
                            ]}
                        >
                            <DatePicker
                                showTime
                                format={DATE_FORMAT}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="thoi_gian_ket_thuc"
                            label="Kết thúc"
                            rules={[
                                { required: true, message: "Chọn thời gian" },
                                { validator: validateTime },
                                { validator: validateWindowInCuocThi }
                            ]}
                        >
                            <DatePicker
                                showTime
                                format={DATE_FORMAT}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                </Row>


                {/* boolean */}
                <Divider/>

                <Row gutter={16}>

                    <Col span={6}>
                        <Form.Item
                            name="co_tron_cau_hoi"
                            label="Trộn câu hỏi"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="cho_phep_luu_bai"
                            label="Cho phép lưu bài"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="du_doan"
                            label="Dự đoán"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="trang_thai"
                            label="Kích hoạt"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>


            </Form>

        </Modal>

    );

}
