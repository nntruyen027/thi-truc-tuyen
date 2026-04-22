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
            const data = await thayDoiThongTinCaNhan({hoTen, donViId: user?.don_vi?.id})
            setUser(data)
            setIsEditName(false)
        } catch (error) {
            message.error(error)
        }
    }

    const handleLuuDonVi = async () => {
        try {
            const data = await thayDoiThongTinCaNhan({hoTen: user?.ho_ten, donViId: donViId})
            setUser(data)
            setIsEditDonVi(false)
        } catch (error) {
            message.error(error)
        }
    }

    return <Card className="rounded-3xl shadow-sm">
        <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <span className={'text-lg font-bold'}>Họ tên thí sinh: </span>
                    </Col>
                    {isEditName ? <Col xs={24} sm={16}>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input value={hoTen} onChange={e => setHoTen(e.target.value)} size={'small'} placeholder="Nhập họ tên" />
                            <Button type={'default'} onClick={handleLuuTen}><SaveOutlined /></Button>
                            <Button onClick={() => {
                                setIsEditName(false)
                                setHoTen(user?.ho_ten || '')
                            }} danger><CloseOutlined/></Button>
                        </div>

                    </Col> : <Col xs={24} sm={16}>
                        <span onClick={() => setIsEditName(true)} className={'text-lg font-semibold'}>{user?.ho_ten}</span>
                    </Col>}
                </Row>



            </Col>
            <Col xs={24} xl={12}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <span className={'text-lg font-bold'}>Đơn vị: </span>
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
                            <span onClick={() => setIsEditDonVi(true)} className={'text-lg font-semibold'}>{user?.don_vi?.ten}</span>
                        </Col>
                    }
                </Row>



            </Col>
        </Row>
    </Card>
}
