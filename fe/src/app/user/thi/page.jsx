"use client"

import {useEffect, useRef, useState} from "react"

import {Button, Card, Input, Layout, Modal, Radio, Spin, theme, Typography} from "antd"

import {useRouter} from "next/navigation"

import CountDown from "../CountDown"

import {nopBai, nopKetQuaDuDoan, pauseThi, startThi, traLoi, traLoiTuLuan} from "~/services/thi/thi"

import {layDotThiHienTai} from "~/services/thi/dot-thi"

const {Header, Sider, Content, Footer} = Layout
const {Title} = Typography


export default function Thi() {

    const router = useRouter()

    const {token} = theme.useToken()

    const [loading, setLoading] = useState(true)

    const [dotThi, setDotThi] = useState(null)

    const [baiThiId, setBaiThiId] = useState(null)

    const [cauHoi, setCauHoi] = useState([])

    const [index, setIndex] = useState(0)

    const [isMobile, setIsMobile] = useState(false)

    const [timeLeft, setTimeLeft] = useState(null)

    const savingRef = useRef(false)

    const startedRef = useRef(false)

    const [ketQuaDuDoan, setKetQuaDuDoan] = useState()
    const debounceRef = useRef(null)

    // mobile detect

    useEffect(() => {

        function check() {
            setIsMobile(
                window.innerWidth < 992
            )
        }

        check()

        window.addEventListener("resize", check)

        return () =>
            window.removeEventListener(
                "resize",
                check
            )

    }, [])


    // init

    useEffect(() => {

        if (startedRef.current)
            return

        startedRef.current = true

        async function init() {

            const dot =
                await layDotThiHienTai()

            const dotData = dot.data

            setDotThi(dotData)

            const data =
                await startThi(dotData.id)

            setBaiThiId(
                data.baiThiId
            )

            setTimeLeft(
                data.timeLeft
            )

            const tracNghiem =
                (data.cauHoi || []).map(x => ({
                    ...x,
                    loai: 1
                }))

            const tuLuan =
                (data.tuLuan || []).map(x => ({
                    ...x,
                    loai: 2
                }))

            setCauHoi([
                ...tracNghiem,
                ...tuLuan
            ])

            setLoading(false)

        }

        init()

    }, [])


    // pause khi thoát

    useEffect(() => {

        const f = () => {
            if (baiThiId)
                pauseThi(baiThiId)
        }

        window.addEventListener(
            "beforeunload",
            f
        )

        return () =>
            window.removeEventListener(
                "beforeunload",
                f
            )

    }, [baiThiId])


    // chọn trắc nghiệm

    async function chon(id, dapAn) {

        if (savingRef.current) return

        savingRef.current = true

        try {

            await traLoi(
                baiThiId,
                id,
                dapAn
            )

            setCauHoi(old =>
                old.map(x =>
                    x.id === id
                        ? {
                            ...x,
                            dap_an_chon: dapAn
                        }
                        : x
                )
            )

        } finally {

            savingRef.current = false

        }

    }


    // điền tự luận

    async function dien(id, val) {

        // update UI ngay
        setCauHoi(old =>
            old.map(x =>
                x.id === id
                    ? {
                        ...x,
                        dap_an: val
                    }
                    : x
            )
        )

        // huỷ lần debounce trước
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // debounce gọi API
        debounceRef.current = setTimeout(async () => {

            try {

                await traLoiTuLuan(
                    baiThiId,
                    id,
                    val
                )

            } catch (e) {
                console.log(e)
            }

        }, 500) // delay 500ms

    }


    function nop() {

        Modal.confirm({

            title: "Nộp bài ?",

            async onOk() {

                await pauseThi(baiThiId)

                if (dotThi?.du_doan)
                    await nopKetQuaDuDoan(
                        baiThiId,
                        ketQuaDuDoan
                    )

                await nopBai(baiThiId)

                router.replace("/user")

            }

        })

    }


    function luuThoat() {

        Modal.confirm({

            title: "Lưu bài và thoát ?",

            async onOk() {

                await pauseThi(baiThiId)

                router.push("/user")

            }

        })

    }


    async function hetGio() {

        Modal.info({
            title: "Hết giờ",
            okButtonProps: {
                style: {
                    display: "none"
                }
            }
        })

        try {

            await pauseThi(baiThiId)

            if (dotThi?.du_doan)
                await nopKetQuaDuDoan(
                    baiThiId,
                    ketQuaDuDoan
                )

            await nopBai(baiThiId)

        } catch (e) {}

        setTimeout(() => { Modal.destroyAll(); router.replace("/user") }, 100)

    }


    if (loading)
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Spin size="large"/>
            </div>
        )


    const isDuDoan =
        dotThi?.du_doan &&
        index === cauHoi.length

    const q =
        !isDuDoan
            ? cauHoi[index]
            : null


    return (

        <Layout style={{minHeight: "100vh"}}>

            <Header
                style={{
                    background: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: '3rem' }} >
                <Title level={4}> Làm bài thi </Title>
                <div style={{ display: "flex", gap: 10 }} >
                    <CountDown seconds={timeLeft} onEnd={hetGio} />
                </div>
            </Header>


            <Layout>


                {/* SIDEBAR */}

                {!isMobile && (

                    <Sider
                        width={260}
                        style={{
                            background: "#fff",
                            padding: 10
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 5
                            }}
                        >

                            {cauHoi.map((c, i) => (

                                <Button
                                    key={c.id}
                                    type={
                                        i === index
                                            ? "primary"
                                            : (c.dap_an_chon || c.dap_an)
                                                ? "default"
                                                : "dashed"
                                    }
                                    style={{
                                        backgroundColor:
                                            (c.dap_an_chon || c.dap_an)
                                                ? "green"
                                                : "",
                                        color:
                                            (c.dap_an_chon || c.dap_an)
                                                ? "white"
                                                : ""
                                    }}
                                    onClick={() =>
                                        setIndex(i)
                                    }
                                >
                                    {i + 1}
                                </Button>

                            ))}

                            {dotThi?.du_doan && (

                                <Button
                                    type={
                                        index ===
                                        cauHoi.length
                                            ? "primary"
                                            : ketQuaDuDoan
                                                ? "default"
                                                : "dashed"
                                    }
                                    style={{
                                        backgroundColor:
                                            (ketQuaDuDoan)
                                                ? "green"
                                                : "",
                                        color:
                                            (ketQuaDuDoan)
                                                ? "white"
                                                : ""
                                    }}
                                    onClick={() =>
                                        setIndex(
                                            cauHoi.length
                                        )
                                    }
                                >
                                    ?
                                </Button>

                            )}

                        </div>


                        <Button
                            block
                            style={{marginTop: 10}}
                            onClick={luuThoat}
                        >
                            Lưu & thoát
                        </Button>

                        <Button
                            danger
                            block
                            style={{marginTop: 10}}
                            onClick={nop}
                        >
                            Nộp bài
                        </Button>

                    </Sider>

                )}


                {/* MAIN */}

                <Content style={{padding: 10}}>

                    <Card>

                        <Title level={4}>
                            {isDuDoan
                                ? "Dự đoán"
                                : `Câu ${
                                    index + 1
                                }`}
                        </Title>


                        <div
                            style={{
                                marginBottom: 20
                            }}
                        >
                            {isDuDoan
                                ? "Dự đoán số người đúng 100%"
                                : q?.cau_hoi}
                        </div>


                        {/* DỰ ĐOÁN */}

                        {isDuDoan && (

                            <Input
                                value={ketQuaDuDoan}
                                onChange={e =>
                                    setKetQuaDuDoan(
                                        e.target.value
                                    )
                                }
                            />

                        )}


                        {/* TRẮC NGHIỆM */}

                        {!isDuDoan &&
                            q?.loai === 1 && (

                                <Radio.Group
                                    value={
                                        q.dap_an_chon
                                    }
                                    onChange={e =>
                                        chon(
                                            q.id,
                                            e.target.value
                                        )
                                    }
                                >

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            gap: 8
                                        }}
                                    >

                                        <Radio value={1}>
                                            A. {q.caua}
                                        </Radio>

                                        <Radio value={2}>
                                            B. {q.caub}
                                        </Radio>

                                        <Radio value={3}>
                                            C. {q.cauc}
                                        </Radio>

                                        <Radio value={4}>
                                            D. {q.caud}
                                        </Radio>

                                    </div>

                                </Radio.Group>

                            )}


                        {/* TỰ LUẬN */}

                        {!isDuDoan &&
                            q?.loai === 2 && (

                                <Input.TextArea
                                    rows={4}
                                    value={
                                        q.dap_an || ""
                                    }
                                    onChange={e =>
                                        dien(
                                            q.id,
                                            e.target.value
                                        )
                                    }
                                />

                            )}

                    </Card>

                </Content>

            </Layout>

        </Layout>

    )

}