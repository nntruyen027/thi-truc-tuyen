'use client'

import {
    App,
    Form,
    Input,
    Select,
    Button,
    Divider, Row, Col,
} from "antd";

import { useEffect, useMemo, useState } from "react";
import { useDonViSelect } from "~/hook/useDonVi";
import { dangKy } from "~/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "~/app/components/common/AuthShell";
import {layCauHinh} from "~/services/cau-hinh";
import {
    DEFAULT_USER_PROFILE_FIELDS,
    DOI_TUONG_OPTIONS,
    NGHE_NGHIEP_OPTIONS,
    parseUserProfileFieldConfig,
    TINH_THANH_OPTIONS,
    USER_PROFILE_FIELD_KEYS,
} from "~/constants/userProfileFields";

export default function DangKy() {

    const router = useRouter();
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [enabledFields, setEnabledFields] = useState(DEFAULT_USER_PROFILE_FIELDS);

    const { dsDonVi, loading: donViLoading, setSearchDonVi, loadMore } = useDonViSelect();

    useEffect(() => {
        let active = true;

        const loadConfig = async () => {
            try {
                setConfigLoading(true);
                const res = await layCauHinh("user_profile_fields");

                if (!active) {
                    return;
                }

                setEnabledFields(parseUserProfileFieldConfig(res?.data?.gia_tri));
            } catch {
                if (active) {
                    setEnabledFields(DEFAULT_USER_PROFILE_FIELDS);
                }
            } finally {
                if (active) {
                    setConfigLoading(false);
                }
            }
        };

        void loadConfig();

        return () => {
            active = false;
        };
    }, []);

    const showField = useMemo(
        () => (key) => enabledFields.includes(key),
        [enabledFields]
    );

    const onDangKy = async (values) => {

        setLoading(true);

        try {

            await dangKy(values);

            message.success("Đăng ký thành công");

            router.push("/login");

        } catch (error) {

            message.error(error.message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthShell
            title="Đăng ký tài khoản"
        >

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onDangKy}
                    size="large"
                    initialValues={{tinhThanh: "Cần Thơ"}}
                >
                    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="mb-2 grid gap-x-4 gap-y-1 md:grid-cols-2">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Thông tin đăng nhập
                            </div>
                            {(showField(USER_PROFILE_FIELD_KEYS.hoTen)
                                || showField(USER_PROFILE_FIELD_KEYS.diaChiDong1)
                                || showField(USER_PROFILE_FIELD_KEYS.xaPhuong)
                                || showField(USER_PROFILE_FIELD_KEYS.tinhThanh)
                                || showField(USER_PROFILE_FIELD_KEYS.ngheNghiep)
                                || showField(USER_PROFILE_FIELD_KEYS.doiTuong)
                                || showField(USER_PROFILE_FIELD_KEYS.donViId)) ? (
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    Thông tin cá nhân
                                </div>
                            ) : null}
                        </div>

                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="username"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số điện thoại" },
                                        {
                                            pattern: /^0[0-9]{9}$/,
                                            message: "Số điện thoại không hợp lệ",
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
                            </Col>

                            {showField(USER_PROFILE_FIELD_KEYS.hoTen) ? (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Họ và tên"
                                        name="hoTen"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập họ và tên" },
                                            {
                                                validator: (_, value) => {
                                                    if (!value || String(value).trim()) {
                                                        return Promise.resolve();
                                                    }

                                                    return Promise.reject(new Error("Họ và tên không được để trống"));
                                                },
                                            },
                                        ]}
                                        className="!mb-4"
                                    >
                                        <Input maxLength={120} />
                                    </Form.Item>
                                </Col>
                            ) : null}

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[
                                        { required: true, message: "Nhập mật khẩu" },
                                        { min: 6, message: "Ít nhất 6 ký tự" },
                                        {
                                            validator: (_, value) => {
                                                if (!value || String(value).trim()) {
                                                    return Promise.resolve();
                                                }

                                                return Promise.reject(new Error("Mật khẩu không hợp lệ"));
                                            },
                                        },
                                    ]}
                                    className="!mb-4"
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Nhập lại mật khẩu"
                                    name="repeatPassword"
                                    dependencies={["password"]}
                                    rules={[
                                        { required: true, message: "Nhập lại mật khẩu" },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue("password") === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    new Error("Mật khẩu không khớp")
                                                );
                                            },
                                        }),
                                    ]}
                                    className="!mb-4"
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Col>

                            {showField(USER_PROFILE_FIELD_KEYS.ngheNghiep) ? (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Nghề nghiệp"
                                        name="ngheNghiep"
                                        rules={[{ required: true, message: "Vui lòng chọn nghề nghiệp" }]}
                                        className="!mb-4"
                                    >
                                        <Select options={NGHE_NGHIEP_OPTIONS} />
                                    </Form.Item>
                                </Col>
                            ) : null}

                            {showField(USER_PROFILE_FIELD_KEYS.doiTuong) ? (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Đối tượng"
                                        name="doiTuong"
                                        rules={[{ required: true, message: "Vui lòng chọn đối tượng" }]}
                                        className="!mb-4"
                                    >
                                        <Select options={DOI_TUONG_OPTIONS} />
                                    </Form.Item>
                                </Col>
                            ) : null}

                            {showField(USER_PROFILE_FIELD_KEYS.xaPhuong) ? (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Xã/Phường"
                                        name="xaPhuong"
                                        rules={[{ required: true, message: "Vui lòng nhập xã/phường" }]}
                                        className="!mb-4"
                                    >
                                        <Input maxLength={255} />
                                    </Form.Item>
                                </Col>
                            ) : null}

                            {showField(USER_PROFILE_FIELD_KEYS.tinhThanh) ? (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Tỉnh/Thành phố"
                                        name="tinhThanh"
                                        rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                                        className="!mb-4"
                                    >
                                        <Select options={TINH_THANH_OPTIONS} />
                                    </Form.Item>
                                </Col>
                            ) : null}

                            {showField(USER_PROFILE_FIELD_KEYS.diaChiDong1) ? (
                                <Col xs={24}>
                                    <Form.Item
                                        label="Địa chỉ"
                                        name="diaChiDong1"
                                        rules={[{ required: true, message: "Vui lòng nhập số nhà, đường, ấp/khu vực" }]}
                                        className="!mb-4"
                                    >
                                        <Input maxLength={500} />
                                    </Form.Item>
                                </Col>
                            ) : null}

                            {showField(USER_PROFILE_FIELD_KEYS.donViId) ? (
                                <Col xs={24}>
                                    <Form.Item
                                        label="Đăng ký dự thi cho địa phương, đơn vị"
                                        name="donViId"
                                        rules={[
                                            { required: true, message: "Vui lòng chọn địa phương, đơn vị" },
                                        ]}
                                        className="!mb-2"
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Chọn địa phương, đơn vị"
                                            loading={donViLoading}
                                            filterOption={false}
                                            options={dsDonVi.map((item) => ({
                                                label: item.ten,
                                                value: item.id,
                                            }))}
                                            onSearch={setSearchDonVi}
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
                                </Col>
                            ) : null}
                        </Row>
                    </div>

                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading || configLoading}
                        block
                        className="!mt-4"
                    >
                        Đăng ký
                    </Button>

                </Form>

                <div className="mt-2 text-center text-sm text-red-600">
                    (*) Mỗi thí sinh chỉ đăng ký 1 tài khoản
                </div>

                <Divider className="!my-4" />

                <div className="text-center text-sm text-slate-600">
                    <Link href="/login">
                        Đã có tài khoản? Đăng nhập
                    </Link>
                </div>
        </AuthShell>

    );

}
