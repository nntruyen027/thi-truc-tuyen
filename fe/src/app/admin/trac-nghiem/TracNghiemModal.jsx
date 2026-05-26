'use client';

import {App, Card, Checkbox, Col, Form, Input, InputNumber, Modal, Row, Select} from "antd";
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
    const {
        dsLinhVuc,
        loading: linhVucLoading,
        setSearchLinhVuc,
        loadMore: loadMoreLinhVuc
    } = useLinhVucSelect();
    const {
        dsNhomCauHoi,
        loading: nhomLoading,
        setSearchNhomCauHoi,
        loadMore: loadMoreNhomCauHoi
    } = useNhomCauHoiSelect();
    const loaiCauHoi = Form.useWatch("loai_cau_hoi", form) || "chon_mot";



    // set data khi edit

    useEffect(() => {

        if (open) {

            if (data) {

                form.setFieldsValue({
                    ...data,
                    loai_cau_hoi: data?.loai_cau_hoi || "chon_mot",
                    cauA: data?.cauA ?? data?.caua,
                    cauB: data?.cauB ?? data?.caub,
                    cauC: data?.cauC ?? data?.cauc,
                    cauD: data?.cauD ?? data?.caud,
                    dapAn: data?.dapAn ?? data?.dapan,
                    dapAnNhieu: data?.dapAnNhieu || data?.dapan_nhieu || [],
                    dapAnText: data?.dapAnText || data?.dapan_text || "",
                });

            } else {

                form.setFieldsValue({
                    diem: 1,
                    loai_cau_hoi: "chon_mot",
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

            const payload = {
                ...values,
                cauA: values.loai_cau_hoi === "dien_tu" ? null : values.cauA,
                cauB: values.loai_cau_hoi === "dien_tu" ? null : values.cauB,
                cauC: values.loai_cau_hoi === "dien_tu" ? null : values.cauC,
                cauD: values.loai_cau_hoi === "dien_tu" ? null : values.cauD,
                dapAn: values.loai_cau_hoi === "chon_mot" ? values.dapAn : null,
                dapAnNhieu: values.loai_cau_hoi === "chon_nhieu" ? values.dapAnNhieu : [],
                dapAnText: values.loai_cau_hoi === "dien_tu" ? values.dapAnText : "",
            };

            if (data) {

                await suaTracNghiem(
                    data.id,
                    payload
                );

                message.success(
                    "Cập nhật câu hỏi thành công"
                );

            } else {

                await themTracNghiem(
                    payload
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
            maskClosable={false}
            keyboard={false}
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

                                loadMoreLinhVuc();

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

                                loadMoreNhomCauHoi();

                            }

                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Loại câu hỏi"
                    name="loai_cau_hoi"
                    rules={[
                        { required: true, message: "Vui lòng chọn loại câu hỏi" },
                    ]}
                >
                    <Select
                        options={[
                            { value: "chon_mot", label: "Trắc nghiệm chọn 1" },
                            { value: "chon_nhieu", label: "Trắc nghiệm chọn nhiều" },
                            { value: "dien_tu", label: "Điền từ" },
                        ]}
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
                    {loaiCauHoi !== "dien_tu" && (
                        <>
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
                        </>
                    )}

                    {loaiCauHoi === "chon_mot" && (
                        <Form.Item
                            name="dapAn"
                            label="Đáp án đúng"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng chọn đáp án đúng"
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
                    )}

                    {loaiCauHoi === "chon_nhieu" && (
                        <Form.Item
                            name="dapAnNhieu"
                            label="Các đáp án đúng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn ít nhất 1 đáp án đúng",
                                },
                            ]}
                        >
                            <Checkbox.Group
                                options={[
                                    { value: 1, label: "A" },
                                    { value: 2, label: "B" },
                                    { value: 3, label: "C" },
                                    { value: 4, label: "D" },
                                ]}
                            />
                        </Form.Item>
                    )}

                    {loaiCauHoi === "dien_tu" && (
                        <Form.Item
                            name="dapAnText"
                            label="Đáp án đúng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập đáp án đúng",
                                },
                            ]}
                            extra="Hệ thống chấm theo nội dung khớp hoàn toàn, không phân biệt hoa thường."
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    )}

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="diem"
                                label="Điểm mặc định"
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

