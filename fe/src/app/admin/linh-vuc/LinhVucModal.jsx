'use client';

import {App, Col, Form, Input, Modal, Row} from "antd";
import {useEffect} from "react";

import {suaLinhVuc, themLinhVuc} from "~/services/dm_chung/linh_vuc";


export default function LinhVucModal({
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

                await suaLinhVuc(
                    data.id,
                    values
                );

                message.success(
                    "Cập nhật lĩnh vực thành công"
                );

            } else {

                await themLinhVuc(
                    values
                );

                message.success(
                    "Thêm lĩnh vực thành công"
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
                    ? "Sửa lĩnh vực"
                    : "Thêm lĩnh vực"
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
                            label="Tên lĩnh vực"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập tên lĩnh vực"
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
