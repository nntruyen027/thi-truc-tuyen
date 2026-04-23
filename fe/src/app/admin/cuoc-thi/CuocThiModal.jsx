'use client';

import {App, Col, DatePicker, Form, Input, Modal, Row, Switch} from "antd";
import {useEffect} from "react";
import dayjs from "dayjs";

import {suaCuocThi, themCuocThi} from "~/services/thi/cuoc-thi";


const DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";


export default function CuocThiModal({
                                         open,
                                         data,
                                         onClose,
                                         onSuccess
                                     }) {

    const { message } = App.useApp();
    const [form] = Form.useForm();


    // set data khi edit

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

        } else {

            form.resetFields();

        }

    }, [data, form, open]);


    // save

    const handleOk = async () => {

        try {

            const values =
                await form.validateFields();


            const payload = {

                ...values,

                thoi_gian_bat_dau:
                    values.thoi_gian_bat_dau
                        ,

                thoi_gian_ket_thuc:
                    values.thoi_gian_ket_thuc
                        ,

            };


            if (data) {

                await suaCuocThi(
                    data.id,
                    payload
                );

                message.success(
                    "Cập nhật cuộc thi thành công"
                );

            } else {

                await themCuocThi(
                    payload
                );

                message.success(
                    "Thêm cuộc thi thành công"
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


    return (

        <Modal
            open={open}
            forceRender
            destroyOnHidden
            title={
                data
                    ? "Sửa cuộc thi"
                    : "Thêm cuộc thi"
            }
            onCancel={handleCancel}
            onOk={handleOk}
            okText={
                data
                    ? "Cập nhật"
                    : "Thêm"
            }
            cancelText="Thoát"
            width={600}
        >

            <Form
                layout="vertical"
                form={form}
            >

                <Row gutter={16}>

                    <Col span={24}>
                        <Form.Item
                            name="ten"
                            label="Tên cuộc thi"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập tên cuộc thi"
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                </Row>


                <Row gutter={16}>

                    <Col span={24}>
                        <Form.Item
                            name="mo_ta"
                            label="Mô tả"
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>

                </Row>


                <Row gutter={16}>

                    <Col md={24} lg={12}>
                        <Form.Item
                            name="thoi_gian_bat_dau"
                            label="Thời gian bắt đầu"
                            rules={ [
                                {
                                    required: true,
                                    message: "Vui lòng nhập thời gian bắt đầu"
                                }
                            ]}
                        >
                            <DatePicker
                                showTime
                                format={DATE_FORMAT}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col md={24} lg={12}>
                        <Form.Item
                            name="thoi_gian_ket_thuc"
                            label="Thời gian kết thúc"
                            rules={ [
                                {
                                    required: true,
                                    message: "Vui lòng nhập thời gian kết thúc"
                                }
                            ]}
                        >
                            <DatePicker
                                showTime
                                format={DATE_FORMAT}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>


                {/*    trang_thai              boolean,
    cho_phep_xem_lich_su    boolean,
    cho_phep_xem_lai_dap_an boolean,
    co_tu_luan              boolean,*/}


                </Row>
                <Row gutter={16}>
                    <Col md={12} lg={6}>
                        <Form.Item
                            name="cho_phep_xem_lich_su"
                            label="Công bố kết quả"
                            tooltip="Bật để hiển thị bảng xếp hạng và kết quả ở giao diện người dùng."
                            valuePropName="checked"
                        >
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col md={12} lg={6}>
                        <Form.Item
                            name="cho_phep_xem_lai_dap_an"
                            label="Cho xem đáp án"
                            tooltip="Bật để thí sinh có thể xem lại đáp án sau cuộc thi."
                            valuePropName="checked"
                        >
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col md={12} lg={6}>
                        <Form.Item
                            name="co_tu_luan"
                            label="Tự luận"
                            valuePropName="checked"
                        >
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col md={12} lg={6}>
                        <Form.Item
                            name="trang_thai"
                            label="Kích hoạt"
                            valuePropName="checked"
                        >
                            <Switch/>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>

        </Modal>

    );

}
