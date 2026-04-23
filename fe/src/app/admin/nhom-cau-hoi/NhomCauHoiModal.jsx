'use client';

import {App, Col, Form, Input, Modal, Row} from "antd";
import {useEffect} from "react";

import {suaNhomCauHoi, themNhomCauHoi} from "~/services/dm_chung/nhom_cau_hoi";


export default function NhomCauHoiModal({
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

    }, [data, form, open]);


    // save

    const handleOk = async () => {

        try {

            const values =
                await form.validateFields();

            if (data) {

                await suaNhomCauHoi(
                    data.id,
                    values
                );

                message.success(
                    "Cập nhật nhóm câu hỏi thành công"
                );

            } else {

                await themNhomCauHoi(
                    values
                );

                message.success(
                    "Thêm nhóm câu hỏi thành công"
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
            destroyOnClose
            title={
                data
                    ? "Sửa nhóm câu hỏi"
                    : "Thêm nhóm câu hỏi"
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
                            label="Tên nhóm câu hỏi"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập tên nhóm câu hỏi"
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
