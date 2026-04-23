"use client"

import {useEffect, useRef, useState} from "react"
import {App, Button, Card, Drawer, Input, Layout, Modal, Radio, Spin, Typography} from "antd"
import {LeftOutlined, MenuOutlined, RightOutlined} from "@ant-design/icons"
import {useRouter} from "next/navigation"

import CountDown from "../CountDown"
import {
    nopBai,
    nopKetQuaDuDoan,
    pauseThi,
    pauseThiKeepAlive,
    startThi,
    traLoi,
    traLoiTuLuan
} from "~/services/thi/thi"
import {layDotThiHienTai} from "~/services/thi/dot-thi"

const {Sider, Content} = Layout
const {Title, Paragraph, Text} = Typography

function normalizeQuestions(data, enableTuLuan = false) {
    const tracNghiem =
        (data?.cauHoi || []).map((item, index) => ({
            ...item,
            loai: 1,
            questionId: item.id,
            clientKey: `tn-${item.id}-${index}`,
            displayOrder: index + 1,
        }))

    const tuLuan =
        (enableTuLuan ? (data?.tuLuan || []) : []).map((item, index) => ({
            ...item,
            loai: 2,
            questionId: item.id,
            clientKey: `tl-${item.id}-${index}`,
            displayOrder: tracNghiem.length + index + 1,
        }))

    return [...tracNghiem, ...tuLuan]
}

export default function Thi() {
    const router = useRouter()
    const {message} = App.useApp()

    const [loading, setLoading] = useState(true)
    const [dotThi, setDotThi] = useState(null)
    const [baiThiId, setBaiThiId] = useState(null)
    const [cauHoi, setCauHoi] = useState([])
    const [index, setIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [timeLeft, setTimeLeft] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [ketQuaDuDoan, setKetQuaDuDoan] = useState("")

    const startedRef = useRef(false)
    const savingRef = useRef(false)
    const pausedRef = useRef(false)
    const finishingRef = useRef(false)
    const debounceRef = useRef(null)
    const pendingTuLuanRef = useRef(null)

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 992)
        }

        check()
        window.addEventListener("resize", check)

        return () => window.removeEventListener("resize", check)
    }, [])

    useEffect(() => {
        if (startedRef.current) {
            return
        }

        startedRef.current = true

        const init = async () => {
            try {
                const dot =
                    await layDotThiHienTai()

                const dotData = dot?.data

                if (!dotData?.id) {
                    throw new Error("Hiện không có đợt thi đang diễn ra.")
                }

                setDotThi(dotData)

                const data =
                    await startThi(dotData.id)

                if (!data || data.error === "het_lan_thi") {
                    throw new Error("Bạn đã hết số lần tham gia đợt thi này.")
                }

                const normalizedQuestions =
                    normalizeQuestions(
                        data,
                        !!dotData?.cuoc_thi?.co_tu_luan
                    )

                setBaiThiId(data.baiThiId)
                setTimeLeft(data.timeLeft || 0)
                setCauHoi(normalizedQuestions)
            } catch (error) {
                message.error(error.message || "Không thể bắt đầu bài thi.")
                router.replace("/user")
                return
            } finally {
                setLoading(false)
            }
        }

        void init()
    }, [message, router])

    useEffect(() => {
        const pauseWhenLeave = () => {
            if (
                dotThi?.cho_phep_luu_bai &&
                baiThiId &&
                !pausedRef.current &&
                !finishingRef.current
            ) {
                pauseThiKeepAlive(baiThiId)
            }
        }

        window.addEventListener("beforeunload", pauseWhenLeave)
        window.addEventListener("pagehide", pauseWhenLeave)

        return () => {
            window.removeEventListener("beforeunload", pauseWhenLeave)
            window.removeEventListener("pagehide", pauseWhenLeave)

            if (
                dotThi?.cho_phep_luu_bai &&
                baiThiId &&
                !pausedRef.current &&
                !finishingRef.current
            ) {
                pauseThiKeepAlive(baiThiId)
            }
        }
    }, [baiThiId, dotThi?.cho_phep_luu_bai])

    const isDuDoan =
        !!dotThi?.du_doan && index === cauHoi.length

    const currentQuestion =
        !isDuDoan
            ? cauHoi[index]
            : null

    const answeredCount =
        cauHoi.filter((item) => (
            item.loai === 1
                ? item.dap_an_chon != null
                : Boolean((item.dap_an || "").trim())
        )).length

    const totalSlots =
        cauHoi.length + (dotThi?.du_doan ? 1 : 0)

    const progressPercent =
        totalSlots ? Math.round((Math.min(index + 1, totalSlots) / totalSlots) * 100) : 0

    async function chon(clientKey, questionId, dapAn) {
        if (savingRef.current) return

        savingRef.current = true

        try {
            await traLoi(
                baiThiId,
                questionId,
                dapAn
            )

            setCauHoi((old) =>
                old.map((item) =>
                    item.clientKey === clientKey
                        ? {
                            ...item,
                            dap_an_chon: dapAn
                        }
                        : item
                )
            )
        } catch (error) {
            message.error(error.message || "Không thể lưu đáp án.")
        } finally {
            savingRef.current = false
        }
    }

    function dien(clientKey, questionId, val) {
        pendingTuLuanRef.current = {
            clientKey,
            questionId,
            val
        }

        setCauHoi((old) =>
            old.map((item) =>
                item.clientKey === clientKey
                    ? {
                        ...item,
                        dap_an: val
                    }
                    : item
            )
        )

        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(async () => {
            try {
                await traLoiTuLuan(
                    baiThiId,
                    questionId,
                    val
                )

                pendingTuLuanRef.current = null
            } catch (error) {
                message.error(error.message || "Không thể lưu câu trả lời tự luận.")
            }
        }, 500)
    }

    async function flushPendingTuLuan() {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
            debounceRef.current = null
        }

        if (!pendingTuLuanRef.current || !baiThiId) {
            return
        }

        const {
            questionId,
            val
        } = pendingTuLuanRef.current

        await traLoiTuLuan(
            baiThiId,
            questionId,
            val
        )

        pendingTuLuanRef.current = null
    }

    async function pauseCurrentAttempt(options = {}) {
        const {
            keepalive = false,
            reason = "save"
        } = options

        if (!baiThiId || pausedRef.current) {
            return false
        }

        if (keepalive) {
            pausedRef.current = true
            return pauseThiKeepAlive(baiThiId)
        }

        await pauseThi(
            baiThiId,
            {reason}
        )

        pausedRef.current = true
        return true
    }

    function gotoQuestion(nextIndex) {
        setIndex(nextIndex)
        setMenuOpen(false)
    }

    function goPrevious() {
        if (index > 0) {
            setIndex(index - 1)
        }
    }

    function goNext() {
        if (index < totalSlots - 1) {
            setIndex(index + 1)
        }
    }

    function nop() {
        Modal.confirm({
            title: "Nộp bài?",
            content: "Sau khi nộp, bạn sẽ không thể tiếp tục chỉnh sửa câu trả lời.",
            okText: "Nộp bài",
            cancelText: "Thoát",
            async onOk() {
                try {
                    finishingRef.current = true

                    await flushPendingTuLuan()
                    await pauseCurrentAttempt({
                        reason: "submit"
                    })

                    if (dotThi?.du_doan) {
                        await nopKetQuaDuDoan(
                            baiThiId,
                            ketQuaDuDoan
                        )
                    }

                    await nopBai(baiThiId)
                    router.replace("/user")
                } catch (error) {
                    finishingRef.current = false
                    pausedRef.current = false
                    message.error(error.message || "Không thể nộp bài.")
                }
            }
        })
    }

    function luuThoat() {
        Modal.confirm({
            title: "Lưu bài và thoát?",
            content: "Bài làm hiện tại sẽ được lưu để bạn tiếp tục sau.",
            okText: "Lưu và thoát",
            cancelText: "Ở lại",
            async onOk() {
                try {
                    await flushPendingTuLuan()
                    await pauseCurrentAttempt({
                        reason: "save"
                    })
                    router.push("/user")
                } catch (error) {
                    pausedRef.current = false
                    message.error(error.message || "Không thể lưu bài.")
                }
            }
        })
    }

    async function hetGio() {
        Modal.info({
            title: "Hết giờ làm bài",
            okButtonProps: {
                style: {display: "none"}
            }
        })

        try {
            finishingRef.current = true

            await flushPendingTuLuan()
            await pauseCurrentAttempt({
                reason: "submit"
            })

            if (dotThi?.du_doan) {
                await nopKetQuaDuDoan(
                    baiThiId,
                    ketQuaDuDoan
                )
            }

            await nopBai(baiThiId)
        } catch {}

        setTimeout(() => {
            Modal.destroyAll()
            router.replace("/user")
        }, 100)
    }

    const questionNavigator = (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.2em] !text-slate-400">
                    Điều hướng câu hỏi
                </Text>
                <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                        <div className="text-2xl font-bold text-slate-900">
                            {answeredCount}/{cauHoi.length}
                        </div>
                        <div className="text-sm text-slate-600">
                            câu đã hoàn thành
                        </div>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                            Tiến độ
                        </div>
                        <div className="text-lg font-semibold text-emerald-700">
                            {progressPercent}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {cauHoi.map((item, itemIndex) => {
                    const answered =
                        item.loai === 1
                            ? item.dap_an_chon != null
                            : Boolean((item.dap_an || "").trim())

                    return (
                        <Button
                            key={item.clientKey}
                            type={itemIndex === index ? "primary" : "default"}
                            className={
                                itemIndex === index
                                    ? "!h-12 !rounded-[18px] !border-0 !bg-[#1948be] !font-semibold !shadow-[0_14px_28px_rgba(25,72,190,0.28)]"
                                    : answered
                                        ? "!h-12 !rounded-[18px] !border-emerald-300 !bg-[linear-gradient(180deg,#ecfdf5_0%,#d1fae5_100%)] !font-semibold !text-emerald-800 !shadow-[0_10px_20px_rgba(16,185,129,0.12)]"
                                        : "!h-12 !rounded-[18px] !border-slate-200 !bg-white !text-slate-600"
                            }
                            onClick={() => gotoQuestion(itemIndex)}
                        >
                            {item.displayOrder}
                        </Button>
                    )
                })}

                {dotThi?.du_doan && (
                    <Button
                        type={isDuDoan ? "primary" : "default"}
                        className={
                            isDuDoan
                                ? "!h-12 !rounded-[18px] !border-0 !bg-[#1948be] !font-semibold !shadow-[0_14px_28px_rgba(25,72,190,0.28)]"
                                : ketQuaDuDoan
                                    ? "!h-12 !rounded-[18px] !border-emerald-300 !bg-[linear-gradient(180deg,#ecfdf5_0%,#d1fae5_100%)] !font-semibold !text-emerald-800"
                                    : "!h-12 !rounded-[18px] !border-slate-200 !bg-white !text-slate-600"
                        }
                        onClick={() => gotoQuestion(cauHoi.length)}
                    >
                        ?
                    </Button>
                )}
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spin size="large"/>
            </div>
        )
    }

    return (
        <Layout className="min-h-screen bg-[linear-gradient(180deg,#f6faff_0%,#fbfdff_28%,#ffffff_100%)]">
            <Layout className="mx-auto w-full max-w-7xl flex-1 gap-6 px-4 py-5 md:px-6 lg:flex-row lg:gap-7 lg:py-7">
                {!isMobile && (
                    <Sider
                        width={280}
                        className="!h-fit overflow-hidden rounded-[32px] border border-blue-100 !bg-[#fbfdff] shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
                    >
                        <div className="p-5">
                            {questionNavigator}
                        </div>
                    </Sider>
                )}

                <Content className="min-w-0">
                    <div className="space-y-6">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
                            <Card className="h-full overflow-hidden rounded-[32px] border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f6fbff_58%,_#e8f1ff)] shadow-[0_18px_44px_rgba(37,99,235,0.08)]">
                                <div className="flex h-full flex-col justify-between gap-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            size="large"
                                            className="!rounded-2xl !border-slate-200 !bg-white"
                                            onClick={() => router.push("/")}
                                        >
                                            Về trang chủ
                                        </Button>

                                        {isMobile && (
                                            <Button
                                                size="large"
                                                icon={<MenuOutlined />}
                                                className="!rounded-2xl !border-slate-200 !bg-white"
                                                onClick={() => setMenuOpen(true)}
                                            >
                                                Danh sách câu
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Text className="!text-xs !font-semibold !uppercase !tracking-[0.22em] !text-blue-700">
                                            {isDuDoan ? "Phần dự đoán" : currentQuestion?.loai === 2 ? "Câu tự luận" : "Câu trắc nghiệm"}
                                        </Text>
                                        <Title level={3} className="!mb-0 !text-slate-900 md:!text-[2rem]">
                                            {isDuDoan ? "Dự đoán kết quả" : `Câu ${index + 1}`}
                                        </Title>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                                            <span className="font-medium text-slate-700">{dotThi?.ten || "Đợt thi hiện tại"}</span>
                                            <span>Câu {Math.min(index + 1, totalSlots)}/{totalSlots}</span>
                                            <span>{answeredCount}/{cauHoi.length} câu đã làm</span>
                                        </div>
                                        <Paragraph className="!mb-0 !max-w-4xl !text-base !leading-8 !text-slate-700 md:!text-[1.08rem]">
                                            {isDuDoan
                                                ? "Nhập số lượng thí sinh bạn dự đoán sẽ đạt đúng 100% số câu."
                                                : currentQuestion?.cau_hoi}
                                        </Paragraph>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                            <span>Tiến độ bài làm</span>
                                            <span className="font-semibold text-slate-700">{progressPercent}%</span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                                            <div
                                                className="h-full rounded-full bg-[linear-gradient(90deg,#1948be_0%,#3b82f6_100%)] transition-all"
                                                style={{width: `${progressPercent}%`}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="h-full rounded-[32px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5faff_100%)] shadow-[0_18px_44px_rgba(37,99,235,0.08)]">
                                <div className="flex h-full flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <Text className="!text-xs !font-semibold !uppercase !tracking-[0.2em] !text-slate-400">
                                                Thời gian còn lại
                                            </Text>
                                            <div className="mt-2 text-sm leading-6 text-slate-600">
                                                Theo dõi thời gian và hoàn tất bài trước khi hết giờ.
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right">
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                                                Trạng thái
                                            </div>
                                            <div className="text-base font-semibold text-slate-900">
                                                Đang làm bài
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <CountDown seconds={timeLeft} onEnd={hetGio} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card className="rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                            {isDuDoan && (
                                <div className="space-y-4">
                                    <Text className="!text-sm !font-semibold !uppercase !tracking-[0.18em] !text-slate-500">
                                        Số dự đoán
                                    </Text>
                                    <Input
                                        size="large"
                                        value={ketQuaDuDoan}
                                        placeholder="Nhập số lượng dự đoán"
                                        className="!rounded-[20px]"
                                        onChange={(e) => setKetQuaDuDoan(e.target.value)}
                                    />
                                </div>
                            )}

                            {!isDuDoan && currentQuestion?.loai === 1 && (
                                <Radio.Group
                                    className="w-full"
                                    value={currentQuestion.dap_an_chon}
                                    onChange={(e) =>
                                        chon(
                                            currentQuestion.clientKey,
                                            currentQuestion.questionId,
                                            e.target.value
                                        )
                                    }
                                >
                                    <div className="grid gap-4">
                                        {[
                                            {value: 1, label: "A", text: currentQuestion.caua},
                                            {value: 2, label: "B", text: currentQuestion.caub},
                                            {value: 3, label: "C", text: currentQuestion.cauc},
                                            {value: 4, label: "D", text: currentQuestion.caud},
                                        ].map((option) => (
                                            <label
                                                key={`${currentQuestion.clientKey}-${option.value}`}
                                                className={`flex cursor-pointer items-start gap-4 rounded-[24px] border px-4 py-4 transition md:px-6 md:py-5 ${
                                                    currentQuestion.dap_an_chon === option.value
                                                        ? "border-blue-500 bg-[linear-gradient(135deg,#eff6ff,_#dbeafe)] shadow-[0_12px_24px_rgba(37,99,235,0.10)]"
                                                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                                                }`}
                                            >
                                                <Radio value={option.value} className="mt-1" />
                                                <div className="min-w-0">
                                                    <div className="text-base font-semibold text-slate-900 md:text-lg">
                                                        {option.label}.
                                                    </div>
                                                    <div className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-700 md:text-base md:leading-8">
                                                        {option.text}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </Radio.Group>
                            )}

                            {!isDuDoan && currentQuestion?.loai === 2 && (
                                <div className="space-y-5">
                                    {currentQuestion.goi_y && (
                                        <div className="rounded-[24px] border border-amber-200 bg-[linear-gradient(180deg,#fffaf0_0%,#fef3c7_100%)] px-5 py-4 text-sm leading-7 text-amber-900">
                                            <span className="font-semibold">Gợi ý:</span> {currentQuestion.goi_y}
                                        </div>
                                    )}

                                    <div>
                                        <Text className="!mb-2 !block !text-sm !font-semibold !uppercase !tracking-[0.18em] !text-slate-500">
                                            Câu trả lời của bạn
                                        </Text>
                                        <Input.TextArea
                                            rows={isMobile ? 10 : 14}
                                            value={currentQuestion.dap_an || ""}
                                            placeholder="Nhập nội dung trả lời tự luận..."
                                            className="!rounded-[24px] !bg-slate-50 !px-1 !text-base !leading-8"
                                            onChange={(e) =>
                                                dien(
                                                    currentQuestion.clientKey,
                                                    currentQuestion.questionId,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="large"
                                        icon={<LeftOutlined />}
                                        disabled={index === 0}
                                        className="!h-12 !rounded-2xl !px-5"
                                        onClick={goPrevious}
                                    >
                                        Câu trước
                                    </Button>

                                    {index < totalSlots - 1 && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<RightOutlined />}
                                            iconPosition="end"
                                            className="!h-12 !rounded-2xl !border-0 !bg-[#1948be] !px-5"
                                            onClick={goNext}
                                        >
                                            Câu tiếp theo
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Button
                                        size="large"
                                        onClick={luuThoat}
                                        className="!h-12 !rounded-2xl !border-slate-300 !px-6"
                                        disabled={!dotThi?.cho_phep_luu_bai}
                                    >
                                        Lưu và thoát
                                    </Button>

                                    <Button
                                        danger
                                        size="large"
                                        className="!h-12 !rounded-2xl !px-6"
                                        onClick={nop}
                                    >
                                        Nộp bài
                                    </Button>
                                </div>
                            </div>
                        </Card>

                    </div>
                </Content>
            </Layout>

            <Drawer
                title="Danh sách câu hỏi"
                placement="bottom"
                size="large"
                open={isMobile && menuOpen}
                onClose={() => setMenuOpen(false)}
                styles={{
                    body: {
                        paddingTop: 12,
                    }
                }}
            >
                {questionNavigator}
            </Drawer>
        </Layout>
    )
}
