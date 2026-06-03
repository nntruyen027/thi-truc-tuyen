'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useState} from "react";
import {Button, Col, Row, Statistic, Tag, theme, Typography} from "antd";
import {
    ArrowRightOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    FireFilled,
    TrophyFilled,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {alphaColor, darkenColor, parseMediaConfig} from "~/utils/workspaceTheme";
import PublicPageBanner from "~/app/demo1/components/PublicPageBanner";
import GiaiThuongCuocThi from "~/app/demo1/GiaiThuongCuocThi";
import TaiLieuTongHop from "~/app/demo1/TaiLieuTongHop";
import KetQuaCongBo from "~/app/demo1/KetQuaCongBo";
import {
    DEMO_BANNER_CONFIG,
    DEMO_DOCUMENTS,
    DEMO_DOT_THI,
    DEMO_HONOR_BOARD,
    DEMO_PRIZES,
    DEMO_RANKINGS,
    DEMO_TIME_LEFT,
    DEMO_TIMELINE,
    DEMO_TOTAL_ATTEMPTS,
} from "~/app/demo1/demo-data";
import useDemoRouteAccess from "~/hooks/useDemoRouteAccess";

const {Title, Paragraph, Text} = Typography;

function formatDate(value) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function buildTimeCards(thoiGianConLai) {
    return [
        {label: "Ngày", value: thoiGianConLai?.ngay ?? 0},
        {label: "Giờ", value: thoiGianConLai?.gio ?? 0},
        {label: "Phút", value: thoiGianConLai?.phut ?? 0},
        {label: "Giây", value: thoiGianConLai?.giay ?? 0},
    ];
}

function buildInfoCards(contestMeta, dotThi) {
    return [
        {
            key: "doi-tuong",
            icon: <UsergroupAddOutlined />,
            label: "Đối tượng",
            value: contestMeta?.doi_tuong_tham_gia,
        },
        {
            key: "noi-dung",
            icon: <TrophyFilled />,
            label: "Nội dung",
            value: contestMeta?.noi_dung_cuoc_thi,
        },
        {
            key: "thoi-gian",
            icon: <CalendarOutlined />,
            label: "Thời gian",
            value: `Từ ${formatDate(dotThi?.cuoc_thi?.thoi_gian_bat_dau)} đến ${formatDate(dotThi?.cuoc_thi?.thoi_gian_ket_thuc)}`,
        },
        {
            key: "hinh-thuc",
            icon: <ClockCircleOutlined />,
            label: "Hình thức",
            value: contestMeta?.hinh_thuc_du_thi,
        },
    ];
}

export default function Demo2Page({skipDemoAccessCheck = false}) {
    const canRender = useDemoRouteAccess("demo2", skipDemoAccessCheck);
    const [image, setImage] = useState(DEMO_BANNER_CONFIG.image);
    const [zoom, setZoom] = useState(DEMO_BANNER_CONFIG.zoom);
    const [bannerPositionX, setBannerPositionX] = useState(DEMO_BANNER_CONFIG.positionX);
    const [bannerPositionY, setBannerPositionY] = useState(DEMO_BANNER_CONFIG.positionY);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const deepPrimary = darkenColor(colorPrimary, 0.1);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const dotThi = DEMO_DOT_THI;
    const contestMeta = useMemo(
        () => parseCuocThiMeta(dotThi?.cuoc_thi?.mo_ta),
        [dotThi?.cuoc_thi?.mo_ta]
    );
    const [countdown, setCountdown] = useState(DEMO_TIME_LEFT);
    const timeCards = useMemo(() => buildTimeCards(countdown), [countdown]);
    const infoCards = useMemo(() => buildInfoCards(contestMeta, dotThi), [contestMeta, dotThi]);
    const honorRows = useMemo(() => DEMO_HONOR_BOARD["dot-thi"].slice(0, 5), []);
    const timelineRows = useMemo(() => DEMO_TIMELINE, []);

    useEffect(() => {
        let active = true;

        const getKhoa = () => (window.innerWidth < 768 ? "banner_mobile" : "banner_desktop");

        const loadBanner = async () => {
            const mobile = window.innerWidth < 768;
            if (active) {
                setIsMobileViewport(mobile);
            }

            try {
                const res = await layCauHinh(getKhoa());
                const val = parseMediaConfig(res?.data?.gia_tri);

                if (!active) {
                    return;
                }

                setImage(val.duongDan || val.url || DEMO_BANNER_CONFIG.image);
                setZoom(val.zoom || DEMO_BANNER_CONFIG.zoom);
                setBannerPositionX(val.positionX || DEMO_BANNER_CONFIG.positionX);
                setBannerPositionY(val.positionY || DEMO_BANNER_CONFIG.positionY);
            } catch {
                if (!active) {
                    return;
                }

                setImage(DEMO_BANNER_CONFIG.image);
                setZoom(DEMO_BANNER_CONFIG.zoom);
                setBannerPositionX(DEMO_BANNER_CONFIG.positionX);
                setBannerPositionY(DEMO_BANNER_CONFIG.positionY);
            }
        };

        const handleResize = () => {
            void loadBanner();
        };

        void loadBanner();
        window.addEventListener("resize", handleResize);

        return () => {
            active = false;
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowFloatingCta(window.scrollY > (isMobileViewport ? 280 : 360));
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isMobileViewport]);

    useEffect(() => {
        if (!countdown?.dem_nguoc) {
            return undefined;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (!prev) {
                    return prev;
                }

                const {
                    dem_nguoc,
                    thang,
                    tuan,
                    ngay,
                    gio,
                    phut,
                    giay,
                } = prev;

                let nextThang = thang ?? 0;
                let nextTuan = tuan ?? 0;
                let nextNgay = ngay ?? 0;
                let nextGio = gio ?? 0;
                let nextPhut = phut ?? 0;
                let nextGiay = giay ?? 0;

                if (
                    nextThang === 0 &&
                    nextTuan === 0 &&
                    nextNgay === 0 &&
                    nextGio === 0 &&
                    nextPhut === 0 &&
                    nextGiay === 0
                ) {
                    return prev;
                }

                nextGiay--;

                if (nextGiay < 0) {
                    nextGiay = 59;
                    nextPhut--;
                }

                if (nextPhut < 0) {
                    nextPhut = 59;
                    nextGio--;
                }

                if (nextGio < 0) {
                    nextGio = 23;
                    nextNgay--;
                }

                if (nextNgay < 0) {
                    nextNgay = 6;
                    nextTuan--;
                }

                if (nextTuan < 0) {
                    nextTuan = 3;
                    nextThang--;
                }

                return {
                    ...prev,
                    dem_nguoc,
                    thang: nextThang,
                    tuan: nextTuan,
                    ngay: nextNgay,
                    gio: nextGio,
                    phut: nextPhut,
                    giay: nextGiay,
                };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown?.dem_nguoc]);

    const handleJoinExam = () => {
        let currentUser = user;

        if (!currentUser && typeof window !== "undefined") {
            try {
                currentUser = JSON.parse(localStorage.getItem("user") || "null");
            } catch {
                currentUser = null;
            }
        }

        if (!currentUser) {
            router.push("/login");
            return;
        }

        if (currentUser.role === "admin") {
            router.push("/admin/dashboard");
            return;
        }

        router.push("/user");
    };

    if (!canRender) {
        return null;
    }

    return (
        <div className="w-full overflow-x-hidden bg-[#fff7ed]">
            <PublicPageBanner
                image={image}
                zoom={zoom}
                positionX={bannerPositionX}
                positionY={bannerPositionY}
                isMobileViewport={isMobileViewport}
            />

            <div className="relative z-10 -mt-8 px-4 pb-12 sm:px-6 lg:px-10 xl:px-14">
                <div className="mx-auto max-w-[1480px]">
                    <Reveal delay={60}>
                        <div
                            className="demo2-stage overflow-hidden rounded-[34px] border p-4 md:p-6 xl:p-7"
                            style={{borderColor: alphaColor(colorPrimary, 0.18)}}
                        >
                            <Row gutter={[20, 20]} align="stretch" className="relative z-[1]">
                                <Col xs={24} xl={7}>
                                    <Reveal delay={90}>
                                        <div className="demo2-panel h-full rounded-[28px] border p-4 md:p-5" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                            <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                                <TrophyFilled />
                                                Bảng vàng thi đua
                                            </div>
                                            <div className="space-y-3">
                                                {honorRows.map((item, index) => (
                                                    <div
                                                        key={item.donViId}
                                                        className="rounded-[22px] border bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1"
                                                        style={{borderColor: alphaColor(colorPrimary, 0.1)}}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black"
                                                                style={{
                                                                    background: index < 3
                                                                        ? `linear-gradient(135deg, ${alphaColor("#f59e0b", 0.22)}, ${alphaColor("#fb923c", 0.5)})`
                                                                        : alphaColor(colorPrimary, 0.1),
                                                                    color: index < 3 ? "#8a2d08" : colorPrimary,
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-lg font-bold text-slate-900">
                                                                    {item.tenDonVi}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                                                    Thí sinh
                                                                </div>
                                                                <div className="text-2xl font-black leading-none" style={{color: colorPrimary}}>
                                                                    {Intl.NumberFormat("vi-VN").format(item.soLuongThiSinh)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Reveal>
                                </Col>

                                <Col xs={24} xl={10}>
                                    <Reveal delay={110}>
                                        <div className="demo2-center-panel h-full rounded-[30px] border px-5 py-6 text-center md:px-7 md:py-8 xl:-translate-y-2" style={{borderColor: alphaColor(colorPrimary, 0.14)}}>
                                            <Title level={1} className="!mb-4 !text-3xl !font-black !leading-tight !text-white md:!text-5xl">
                                                VÀO THI NGAY
                                            </Title>

                                            <div className="mx-auto grid max-w-[520px] grid-cols-2 gap-3 md:grid-cols-4">
                                                {timeCards.map((item, index) => (
                                                    <Reveal key={item.label} delay={140 + (index * 40)}>
                                                        <div className="rounded-[22px] bg-white/92 px-3 py-4 shadow-[0_14px_30px_rgba(102,17,17,0.16)]">
                                                            <Statistic
                                                                value={item.value}
                                                                valueStyle={{color: deepPrimary, fontWeight: 900, fontSize: 34}}
                                                            />
                                                            <Text className="!text-[11px] !font-bold !uppercase !tracking-[0.18em] !text-slate-400">
                                                                {item.label}
                                                            </Text>
                                                        </div>
                                                    </Reveal>
                                                ))}
                                            </div>

                                            <div className="mt-6 flex flex-col items-center gap-4">
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    icon={<ArrowRightOutlined />}
                                                    onClick={handleJoinExam}
                                                    className="demo2-cta !h-15 !rounded-full !border-0 !px-10 !text-lg !font-black"
                                                    style={{background: "#fff4dc", color: "#b91c1c"}}
                                                >
                                                    THAM GIA THI
                                                </Button>
                                                <div className="rounded-full bg-white/92 px-5 py-3 shadow-[0_14px_30px_rgba(102,17,17,0.16)]">
                                                    <span className="text-base font-bold uppercase text-slate-500">Đã có</span>
                                                    <span className="mx-3 text-4xl font-black leading-none" style={{color: "#b91c1c"}}>
                                                        {Intl.NumberFormat("vi-VN").format(DEMO_TOTAL_ATTEMPTS)}
                                                    </span>
                                                    <span className="text-base font-bold uppercase text-slate-500">lượt thi</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Reveal>
                                </Col>

                                <Col xs={24} xl={7}>
                                    <Reveal delay={130}>
                                        <div className="demo2-panel h-full rounded-[28px] border p-4 md:p-5" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                            <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                                <CalendarOutlined />
                                                Thông tin cuộc thi
                                            </div>
                                            <div className="space-y-3">
                                                {infoCards.map((item) => (
                                                    <div
                                                        key={item.key}
                                                        className="rounded-[22px] border bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1"
                                                        style={{borderColor: alphaColor(colorPrimary, 0.1)}}
                                                    >
                                                        <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em]" style={{color: colorPrimary}}>
                                                            {item.icon}
                                                            {item.label}
                                                        </div>
                                                        <Paragraph className="!mb-0 !text-base !leading-7 !text-slate-700">
                                                            {item.value}
                                                        </Paragraph>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Reveal>
                                </Col>
                            </Row>
                        </div>
                    </Reveal>

                    <div className="mt-8 space-y-8">
                        <Reveal delay={150}>
                            <div className="rounded-[32px] border bg-white p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)] md:p-6" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                <div className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em]" style={{color: colorPrimary}}>
                                    Lịch các đợt thi
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {timelineRows.map((item, index) => (
                                        <Reveal key={item.id} delay={170 + (index * 40)}>
                                            <div
                                                className="rounded-[26px] border px-5 py-5 transition duration-300 hover:-translate-y-1"
                                                style={{
                                                    borderColor: alphaColor(colorPrimary, 0.12),
                                                    background: item.id === dotThi.id
                                                        ? `linear-gradient(180deg, ${alphaColor(colorPrimary, 0.12)}, rgba(255,255,255,0.96))`
                                                        : "#fffaf8",
                                                }}
                                            >
                                                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                                    Đợt {index + 1}
                                                </div>
                                                <div className="text-2xl font-black text-slate-900">
                                                    {item.ten}
                                                </div>
                                                <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]" style={{color: colorPrimary}}>
                                                    {formatDate(item.thoi_gian_bat_dau)} - {formatDate(item.thoi_gian_ket_thuc)}
                                                </div>
                                            </div>
                                        </Reveal>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={190}>
                            <section className="space-y-4">
                                <Title level={2} className="!mb-0 !text-3xl !font-black" style={{color: colorPrimary}}>
                                    Giải thưởng
                                </Title>
                                <GiaiThuongCuocThi demoData={DEMO_PRIZES} />
                            </section>
                        </Reveal>

                        <Reveal delay={210}>
                            <section className="space-y-4">
                                <Title level={2} className="!mb-0 !text-3xl !font-black" style={{color: colorPrimary}}>
                                    Tài liệu
                                </Title>
                                <TaiLieuTongHop demoData={DEMO_DOCUMENTS} />
                            </section>
                        </Reveal>

                        <Reveal delay={230}>
                            <section className="space-y-4">
                                <Title level={2} className="!mb-0 !text-3xl !font-black" style={{color: colorPrimary}}>
                                    Kết quả
                                </Title>
                                <KetQuaCongBo dotThi={dotThi} demoData={DEMO_RANKINGS} />
                            </section>
                        </Reveal>
                    </div>
                </div>
            </div>

            {showFloatingCta ? (
                <div className="fixed bottom-5 right-5 z-40 md:bottom-7 md:right-7">
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleJoinExam}
                        icon={<ArrowRightOutlined />}
                        className="demo2-float !h-13 !rounded-full !border-0 !px-6 !text-sm !font-bold md:!text-base"
                        style={{background: "#b91c1c"}}
                    >
                        Tham gia thi
                    </Button>
                </div>
            ) : null}

            <style>{`
                .demo2-stage {
                    position: relative;
                    background: linear-gradient(180deg, rgba(255, 248, 237, 0.99), rgba(255, 252, 246, 0.99));
                    box-shadow: 0 28px 70px rgba(102, 17, 17, 0.2);
                }

                .demo2-stage::before {
                    content: "";
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: 54%;
                    border-radius: 34px 34px 120px 120px;
                    background:
                        radial-gradient(circle at top center, rgba(255, 228, 154, 0.26), transparent 30%),
                        linear-gradient(180deg, rgba(171, 24, 24, 0.98), rgba(214, 50, 50, 0.95));
                    box-shadow: inset 0 -18px 36px rgba(127, 29, 29, 0.14);
                    pointer-events: none;
                }

                .demo2-panel {
                    background:
                        linear-gradient(180deg, rgba(255, 250, 236, 0.98), rgba(255, 255, 255, 0.96));
                    box-shadow: 0 22px 46px rgba(102, 38, 14, 0.13);
                }

                .demo2-center-panel {
                    background:
                        radial-gradient(circle at top, rgba(255, 233, 163, 0.32), transparent 34%),
                        linear-gradient(180deg, rgba(147, 18, 18, 0.92), rgba(185, 28, 28, 0.94));
                    box-shadow: 0 34px 70px rgba(102, 17, 17, 0.3);
                }

                .demo2-cta {
                    box-shadow:
                        0 18px 36px rgba(127, 29, 29, 0.28),
                        0 0 0 4px rgba(255, 244, 220, 0.18),
                        0 0 0 1px rgba(185, 28, 28, 0.08);
                    animation: demo2-pop 2.6s ease-in-out infinite;
                }

                .demo2-float {
                    box-shadow: 0 16px 34px rgba(127, 29, 29, 0.34);
                }

                @keyframes demo2-pop {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-3px) scale(1.025);
                    }
                }
            `}</style>
        </div>
    );
}
