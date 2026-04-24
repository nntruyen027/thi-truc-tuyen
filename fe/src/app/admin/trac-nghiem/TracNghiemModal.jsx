'use client';

import {App, Card, Col, Form, Input, InputNumber, Modal, Row, Select} from "antd";
import {useEffect} from "react";

import {suaTracNghiem, themTracNghiem} from "~/services/thi/trac_nghiem";
import {useLinhVucSelect} from "~/hook/useLinhVuc";
import {useNhomCauHoiSelect} from "~/hook/useNhomCauHoi";


export default function TracNghiemModal({
                                       open,
                                       data,
                                       onClose,
                                       onSuccess
                                   }) {

    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { dsLinhVuc, loading: linhVucLoading, setSearchLinhVuc } = useLinhVucSelect();
    const { dsNhomCauHoi, loading: nhomLoading, setSearchNhomCauHoi } = useNhomCauHoiSelect();



    // set data khi edit

    useEffect(() => {

        if (open) {

            if (data) {

                form.setFieldsValue({
                    ...data,
                    cauA: data?.caua,
                    cauB: data?.caub,
                    cauC: data?.cauc,
                    cauD: data?.caud,
                    dapAn: data?.dapan,
                });

            } else {

                form.setFieldsValue({
                    diem: 1
                });

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

                await suaTracNghiem(
                    data.id,
                    values
                );

                message.success(
                    "Cập nhật câu hỏi thành công"
                );

            } else {

                await themTracNghiem(
                    values
                );

                message.success(
                    "Thêm câu hỏi thành công"
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
                    ? "Sửa câu hỏi"
                    : "Thêm câu hỏi"
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
            {/*linh_vuc_id,
                          nhom_id,
                          cau_hoi,
                          cauA,
                          cauB,
                          cauC,
                          cauD,
                          dapAn,
                          diem*/}
            <Form
                layout="vertical"
                form={form}
            >
                <Form.Item
                    label="Lĩnh vực"
                    name="linh_vuc_id"
                    rules={[
                        { required: true, message: "Vui lòng chọn lĩnh vực" },
                    ]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="Chọn lĩnh vực"
                        loading={linhVucLoading}
                        filterOption={false}
                        options={dsLinhVuc.map((item) => ({
                            label: item.ten,
                            value: item.id,
                        }))}
                        onSearch={setSearchLinhVuc}
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
                <Form.Item
                    label="Nhóm câu hỏi"
                    name="nhom_id"
                    rules={[
                        { required: true, message: "Vui lòng chọn nhóm câu hỏi" },
                    ]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="Chọn nhóm câu hỏi"
                        loading={nhomLoading}
                        filterOption={false}
                        options={dsNhomCauHoi.map((item) => ({
                            label: item.ten,
                            value: item.id,
                        }))}
                        onSearch={setSearchNhomCauHoi}
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

                <Form.Item
                    name="cau_hoi"
                    label="Câu hỏi"
                    rules={[
                        {
                            required: true,
                            message:
                                "Vui lòng nhập câu hỏi"
                        }
                    ]}
                >
                    <Input.TextArea  />
                </Form.Item>

                <Card title={'Đáp án'}>
                    <Form.Item
                        name="cauA"
                        label="A"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập đáp án A"
                            }
                        ]}
                    >
                        <Input.TextArea  />
                    </Form.Item>
                    <Form.Item
                    name="cauB"
                    label="B"
                    rules={[
                        {
                            required: true,
                            message:
                                "Vui lòng nhập đáp án B"
                        }
                    ]}
                >
                    <Input.TextArea  />
                </Form.Item>
                    <Form.Item
                        name="cauC"
                        label="C"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập đáp án C"
                            }
                        ]}
                    >
                        <Input.TextArea  />
                    </Form.Item>
                    <Form.Item
                        name="cauD"
                        label="D"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập đáp án D"
                            }
                        ]}
                    >
                        <Input.TextArea  />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col md={24} lg={12}>
                            <Form.Item
                                name="dapAn"
                                label="Đáp án đúng"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập đáp án đúng"
                                    }
                                ]}
                            >
                                <Select options={[{
                                    value: 1, label: 'Đáp án A'
                                }, {
                                    value: 2, label: 'Đáp án B'
                                }, {
                                    value: 3, label: 'Đáp án C'
                                }, {
                                    value: 4, label: 'Đáp án D'
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col md={24} lg={12}>
                            <Form.Item
                                name="diem"
                                label="Điểm mặc đinh"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập điểm mặc định",
                                    },
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
                    </Row>

                </Card>
            </Form>

        </Modal>

    );

}
