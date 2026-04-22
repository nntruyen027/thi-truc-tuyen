'use client';

import {App, Col, Form, Input, Modal, Row} from "antd";
import {useEffect} from "react";

import {suaDonVi, themDonVi} from "~/services/dm_chung/don_vi";


export default function DonViModal({
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
                form.setFieldsValue(data);
            } else {
                form.resetFields();
            }

        } else {

            form.resetFields();

        }

    }, [open, data]);


    // save

    const handleOk = async () => {

        try {

            const values =
                await form.validateFields();

            if (data) {

                await suaDonVi(
                    data.id,
                    values
                );

                message.success(
                    "Cập nhật đơn vị thành công"
                );

            } else {

                await themDonVi(
                    values
                );

                message.success(
                    "Thêm đơn vị thành công"
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
            destroyOnClose
            title={
                data
                    ? "Sửa đơn vị"
                    : "Thêm đơn vị"
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
                            label="Tên đơn vị"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập tên đơn vị"
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
                            <Input.TextArea
                                rows={3}
                            />
                        </Form.Item>
                    </Col>

                </Row>

            </Form>

        </Modal>

    );

}