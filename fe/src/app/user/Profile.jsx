'use client'
import {Button, Card, Col, Input, Row, Select, theme} from "antd";
import {useAuthStore} from "~/store/auth";
import {CloseOutlined, SaveOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import useApp from "antd/es/app/useApp";
import {thayDoiThongTinCaNhan} from "~/services/auth";
import {useDonViSelect} from "~/hook/useDonVi";

export default function Profile() {
    const {user, setUser} = useAuthStore()
    const {token} = theme.useToken()
    const [isEditName, setIsEditName] = useState(false)
    const [isEditDonVi, setIsEditDonVi] = useState(false)
    const [hoTen, setHoTen] = useState(user?.ho_ten || '')
    const [donViId, setDonViId] = useState(user?.don_vi?.id)
    const {message} = useApp()

    const { dsDonVi, loading: donViLoading, setSearchDonVi, loadMore } = useDonViSelect();


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHoTen(user?.ho_ten)
        setDonViId(user?.don_vi?.id)
    }, [user])

    const handleLuuTen = async () => {
        try {
            const normalizedHoTen = String(hoTen || "").trim()

            if (!normalizedHoTen) {
                message.error("Họ tên không được để trống")
                return
            }

            const data = await thayDoiThongTinCaNhan({hoTen: normalizedHoTen, donViId: user?.don_vi?.id})
            setUser(data)
            setIsEditName(false)
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật họ tên")
        }
    }

    const handleLuuDonVi = async () => {
        try {
            if (!donViId) {
                message.error("Vui lòng chọn đơn vị")
                return
            }

            const data = await thayDoiThongTinCaNhan({hoTen: user?.ho_ten, donViId: donViId})
            setUser(data)
            setIsEditDonVi(false)
        } catch (error) {
            message.error(error?.message || "Không thể cập nhật đơn vị")
        }
    }

    return <Card className="rounded-3xl border border-slate-200 shadow-sm" styles={{body: {padding: 24}}}>
        <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color: token.colorPrimary}}>Thông tin tài khoản</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">Hồ sơ thí sinh</div>
            <div className="mt-2 text-sm text-slate-500">Bạn có thể chỉnh sửa nhanh họ tên và đơn vị ngay trên trang này.</div>
        </div>
        <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <span className={'text-base font-bold text-slate-700 sm:text-lg'}>Họ tên thí sinh:</span>
                    </Col>
                    {isEditName ? <Col xs={24} sm={16}>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input value={hoTen} onChange={e => setHoTen(e.target.value)} size={'small'} placeholder="Nhập họ tên" maxLength={120} />
                            <Button type={'default'} onClick={handleLuuTen}><SaveOutlined /></Button>
                            <Button onClick={() => {
                                setIsEditName(false)
                                setHoTen(user?.ho_ten || '')
                            }} danger><CloseOutlined/></Button>
                        </div>

                    </Col> : <Col xs={24} sm={16}>
                        <button type="button" onClick={() => setIsEditName(true)} className={'text-left text-base font-semibold text-slate-900 transition sm:text-lg'} style={{textDecorationColor: token.colorPrimary}}>{user?.ho_ten || "Chưa cập nhật"}</button>
                    </Col>}
                </Row>



            </Col>
            <Col xs={24} xl={12}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <span className={'text-base font-bold text-slate-700 sm:text-lg'}>Đơn vị:</span>
                    </Col>
                    {
                        isEditDonVi ? <Col xs={24} sm={16}>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Select
                                    value={donViId}
                                    onChange={e => setDonViId(e)}
                                    style={{ width: '100%' }}
                                    showSearch
                                    allowClear
                                    placeholder="Chọn đơn vị"
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
                                <Button type={'default'} onClick={handleLuuDonVi}><SaveOutlined /></Button>
                                <Button onClick={() => {
                                    setIsEditDonVi(false)
                                    setDonViId(user?.don_vi?.id)
                                }} danger><CloseOutlined/></Button>
                            </div>

                        </Col> : <Col xs={24} sm={16}>
                            <button type="button" onClick={() => setIsEditDonVi(true)} className={'text-left text-base font-semibold text-slate-900 transition sm:text-lg'} style={{textDecorationColor: token.colorPrimary}}>{user?.don_vi?.ten || "Chưa cập nhật"}</button>
                        </Col>
                    }
                </Row>



            </Col>
        </Row>
    </Card>
}
