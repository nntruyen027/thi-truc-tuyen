'use client'

import {App, Button, Card, Col, Form, Input, Row, Select, theme} from "antd";
import {useEffect, useMemo, useState} from "react";
import {useAuthStore} from "~/store/auth";
import {thayDoiThongTinCaNhan} from "~/services/auth";
import {useDonViSelect} from "~/hook/useDonVi";
import {layCauHinh} from "~/services/cau-hinh";
import {
    DEFAULT_USER_PROFILE_FIELDS,
    DOI_TUONG_OPTIONS,
    NGHE_NGHIEP_OPTIONS,
    parseUserProfileFieldConfig,
    TINH_THANH_OPTIONS,
    USER_PROFILE_FIELD_KEYS,
} from "~/constants/userProfileFields";

export default function Profile() {
    const {user, setUser} = useAuthStore()
    const {token} = theme.useToken()
    const {message} = App.useApp()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [configLoading, setConfigLoading] = useState(true)
    const [enabledFields, setEnabledFields] = useState(DEFAULT_USER_PROFILE_FIELDS)
    const { dsDonVi, loading: donViLoading, setSearchDonVi, loadMore } = useDonViSelect();

    useEffect(() => {
        let active = true

        const loadConfig = async () => {
            try {
                setConfigLoading(true)
                const res = await layCauHinh("user_profile_fields")

                if (!active) {
                    return
                }

                setEnabledFields(parseUserProfileFieldConfig(res?.data?.gia_tri))
            } catch {
                if (active) {
                    setEnabledFields(DEFAULT_USER_PROFILE_FIELDS)
                }
            } finally {
                if (active) {
                    setConfigLoading(false)
                }
            }
        }

        void loadConfig()

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        form.setFieldsValue({
            username: user?.so_dien_thoai || user?.username || "",
            hoTen: user?.ho_ten || "",
            diaChiDong1: user?.dia_chi_dong_1 || "",
            xaPhuong: user?.xa_phuong || "",
            tinhThanh: user?.tinh_thanh || "Cần Thơ",
            ngheNghiep: user?.nghe_nghiep || undefined,
            doiTuong: user?.doi_tuong || undefined,
            donViId: user?.don_vi?.id || user?.don_vi_id || undefined,
        })
    }, [form, user])

    const showField = useMemo(
        () => (key) => enabledFields.includes(key),
        [enabledFields]
    )

    const handleSubmit = async (values) => {
        try {
            setLoading(true)
            const payload = {}

            if (showField(USER_PROFILE_FIELD_KEYS.hoTen)) {
                payload.hoTen = values.hoTen?.trim()
            }

            if (showField(USER_PROFILE_FIELD_KEYS.diaChiDong1)) {
                payload.diaChiDong1 = values.diaChiDong1?.trim()
            }

            if (showField(USER_PROFILE_FIELD_KEYS.tinhThanh)) {
                payload.tinhThanh = values.tinhThanh
            }

            if (showField(USER_PROFILE_FIELD_KEYS.ngheNghiep)) {
                payload.ngheNghiep = values.ngheNghiep
            }

            if (showField(USER_PROFILE_FIELD_KEYS.doiTuong)) {
                payload.doiTuong = values.doiTuong
            }

            if (showField(USER_PROFILE_FIELD_KEYS.donViId)) {
                payload.donViId = values.donViId || null
            }

            const data = await thayDoiThongTinCaNhan(payload)
            setUser(data)
            message.success("Đã cập nhật hồ sơ")
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật hồ sơ")
        } finally {
            setLoading(false)
        }
    }

    return <Card className="rounded-3xl border border-slate-200 shadow-sm" styles={{body: {padding: 24}}}>
        <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color: token.colorPrimary}}>Thông tin tài khoản</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">Hồ sơ thí sinh</div>
            <div className="mt-2 text-sm text-slate-500">Cập nhật các thông tin mà workspace hiện tại đang yêu cầu thu thập.</div>
        </div>

        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={configLoading}
        >
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <Form.Item label="Số điện thoại">
                        <Input value={user?.so_dien_thoai || user?.username || ""} disabled />
                    </Form.Item>
                </Col>

                {showField(USER_PROFILE_FIELD_KEYS.hoTen) ? (
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Họ và tên"
                            name="hoTen"
                            rules={[{required: true, message: "Vui lòng nhập họ và tên"}]}
                        >
                            <Input maxLength={120} />
                        </Form.Item>
                    </Col>
                ) : null}
            </Row>

            {showField(USER_PROFILE_FIELD_KEYS.diaChiDong1) ? (
                <Form.Item
                    label="Địa chỉ thường trú"
                    name="diaChiDong1"
                    rules={[{required: true, message: "Vui lòng nhập số nhà, đường, ấp/khu vực"}]}
                    extra="Dòng 1: Số nhà, đường, ấp/khu vực"
                >
                    <Input maxLength={500} />
                </Form.Item>
            ) : null}

            <Row gutter={[16, 0]}>
                {showField(USER_PROFILE_FIELD_KEYS.tinhThanh) ? (
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Tỉnh/Thành phố thường trú"
                            name="tinhThanh"
                            rules={[{required: true, message: "Vui lòng chọn tỉnh/thành phố thường trú"}]}
                        >
                            <Select options={TINH_THANH_OPTIONS} />
                        </Form.Item>
                    </Col>
                ) : null}
            </Row>

            <Row gutter={[16, 0]}>
                {showField(USER_PROFILE_FIELD_KEYS.ngheNghiep) ? (
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Nghề nghiệp"
                            name="ngheNghiep"
                            rules={[{required: true, message: "Vui lòng chọn nghề nghiệp"}]}
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
                            rules={[{required: true, message: "Vui lòng chọn đối tượng"}]}
                        >
                            <Select options={DOI_TUONG_OPTIONS} />
                        </Form.Item>
                    </Col>
                ) : null}
            </Row>

            {showField(USER_PROFILE_FIELD_KEYS.donViId) ? (
                <Form.Item
                    label="Đăng ký dự thi cho địa phương, đơn vị"
                    name="donViId"
                    rules={[{required: true, message: "Vui lòng chọn địa phương, đơn vị"}]}
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
                            const target = e.target

                            if (
                                target.scrollTop +
                                target.offsetHeight >=
                                target.scrollHeight - 10
                            ) {
                                loadMore()
                            }
                        }}
                    />
                </Form.Item>
            ) : null}

            <Button type="primary" htmlType="submit" loading={loading || configLoading}>
                Cập nhật hồ sơ
            </Button>
        </Form>
    </Card>
}
