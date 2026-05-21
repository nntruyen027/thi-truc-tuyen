'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useState} from "react";
import {Button, Col, Progress, Row, Statistic, theme, Typography} from "antd";
import {
    ArrowRightOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    FireFilled,
    TrophyFilled,
    UserOutlined,
} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {useAuthStore} from "~/store/auth";
import {getPublicFileUrl} from "~/services/file";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {alphaColor, darkenColor, parseMediaConfig} from "~/utils/workspaceTheme";
import Reveal from "~/app/components/common/Reveal";
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

const {Title, Paragraph, Text} = Typography;

function formatDate(value) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function buildInfoCards(meta, dotThi) {
    return [
        {
            key: "doi-tuong",
            label: "Đối tượng",
            icon: <UserOutlined />,
            value: meta?.doi_tuong_tham_gia,
        },
        {
            key: "noi-dung",
            label: "Nội dung",
            icon: <FileTextOutlined />,
            value: meta?.noi_dung_cuoc_thi,
        },
        {
            key: "thoi-gian",
            label: "Thời gian",
            icon: <CalendarOutlined />,
            value: `Từ ${formatDate(dotThi?.cuoc_thi?.thoi_gian_bat_dau)} đến ${formatDate(dotThi?.cuoc_thi?.thoi_gian_ket_thuc)}`,
        },
        {
            key: "hinh-thuc",
            label: "Hình thức",
            icon: <ClockCircleOutlined />,
            value: meta?.hinh_thuc_du_thi,
        },
    ];
}

export default function Demo3Page() {
    const [image, setImage] = useState(DEMO_BANNER_CONFIG.image);
    const [zoom, setZoom] = useState(DEMO_BANNER_CONFIG.zoom);
    const [bannerPositionX, setBannerPositionX] = useState(DEMO_BANNER_CONFIG.positionX);
    const [bannerPositionY, setBannerPositionY] = useState(DEMO_BANNER_CONFIG.positionY);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [countdown, setCountdown] = useState(DEMO_TIME_LEFT);

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const deepPrimary = darkenColor(colorPrimary, 0.18);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const dotThi = DEMO_DOT_THI;
    const contestMeta = useMemo(
        () => parseCuocThiMeta(dotThi?.cuoc_thi?.mo_ta),
        [dotThi?.cuoc_thi?.mo_ta]
    );
    const infoCards = useMemo(() => buildInfoCards(contestMeta, dotThi), [contestMeta, dotThi]);
    const honorRows = useMemo(() => DEMO_HONOR_BOARD["dot-thi"].slice(0, 5), []);
    const rankingRows = useMemo(() => DEMO_RANKINGS["dot-thi"].slice(0, 5), []);
    const timeCards = useMemo(() => {
        const tongNgay = ((countdown?.thang || 0) * 30) + ((countdown?.tuan || 0) * 7) + (countdown?.ngay || 0);
        return [
            {label: "Ngày", value: tongNgay},
            {label: "Giờ", value: countdown?.gio ?? 0},
            {label: "Phút", value: countdown?.phut ?? 0},
            {label: "Giây", value: countdown?.giay ?? 0},
        ];
    }, [countdown]);

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

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setShowFloatingCta(window.scrollY > (isMobileViewport ? 360 : 460));
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isMobileViewport]);

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

        if (currentUser.role === "super_admin") {
            router.push("/super-admin");
            return;
        }

        if (currentUser.role === "admin") {
            router.push("/admin/dashboard");
            return;
        }

        router.push("/user");
    };

    return (
        <div className="w-full overflow-x-hidden bg-[#fff6e7]">
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${getPublicFileUrl(image)})`,
                        backgroundPosition: `${bannerPositionX}% ${bannerPositionY}%`,
                        backgroundSize: zoom > 1 ? `${100 * zoom}%` : "cover",
                        backgroundRepeat: "no-repeat",
                        transform: `translateY(${Math.min(scrollY * 0.08, 16)}px)`,
                    }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(91,8,8,0.08),rgba(91,8,8,0.03),rgba(91,8,8,0.01))]" />
                <div className="absolute -bottom-16 left-0 right-0 h-32 rounded-t-[100%] bg-[#fff6e7]" />

                <div className="relative z-[1] px-4 pb-72 pt-18 sm:px-6 lg:px-10 xl:px-14 xl:pb-88 xl:pt-24" />
            </section>

            <div className="relative z-10 mt-0 px-4 pb-12 sm:px-6 lg:-mt-4 lg:px-10 xl:-mt-8 xl:px-14">
                <div className="mx-auto max-w-[1500px] space-y-10">
                    <Reveal delay={90}>
                        <div className="demo3-marble rounded-[36px] border p-4 shadow-[0_30px_80px_rgba(90,33,10,0.18)] md:p-6 xl:p-7" style={{borderColor: alphaColor(colorPrimary, 0.18)}}>
                            <Row gutter={[22, 22]} align="stretch">
                                <Col xs={24} xl={7}>
                                    <div className="demo3-paper h-full rounded-[28px] border p-4 md:p-5" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                            <TrophyFilled />
                                            Bảng vàng thi đua
                                        </div>
                                        <div className="space-y-3">
                                            {honorRows.map((item, index) => (
                                                <div
                                                    key={item.donViId}
                                                    className="rounded-[22px] border bg-white px-4 py-3 shadow-[0_14px_24px_rgba(15,23,42,0.05)]"
                                                    style={{borderColor: alphaColor(colorPrimary, 0.08)}}
                                                >
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe7c2] text-base font-black" style={{color: deepPrimary}}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-lg font-black text-slate-900">
                                                                {item.tenDonVi}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                                                Thí sinh
                                                            </div>
                                                            <div className="text-2xl font-black leading-none" style={{color: colorPrimary}}>
                                                                {Intl.NumberFormat("vi-VN").format(item.soLuongThiSinh)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Progress
                                                        percent={Math.round((item.soLuongThiSinh / honorRows[0].soLuongThiSinh) * 100)}
                                                        showInfo={false}
                                                        strokeColor={colorPrimary}
                                                        trailColor={alphaColor(colorPrimary, 0.08)}
                                                        size="small"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} xl={10}>
                                    <div className="demo3-center h-full rounded-[32px] border px-5 py-6 text-center md:px-7 md:py-8" style={{borderColor: alphaColor(colorPrimary, 0.14)}}>
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#ffe082]/70 bg-[#b71c1c] text-3xl text-[#ffe082] shadow-[0_14px_28px_rgba(127,29,29,0.25)]">
                                            ★
                                        </div>
                                        <Title level={2} className="!mb-5 !text-4xl !font-black !uppercase !tracking-[0.04em] !text-white md:!text-5xl">
                                            Vào thi ngay
                                        </Title>
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {timeCards.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="rounded-[22px] bg-white/95 px-3 py-4 shadow-[0_14px_28px_rgba(102,17,17,0.14)]"
                                                >
                                                    <Statistic
                                                        value={item.value}
                                                        valueStyle={{color: deepPrimary, fontWeight: 900, fontSize: 34}}
                                                    />
                                                    <Text className="!text-[11px] !font-bold !uppercase !tracking-[0.18em] !text-slate-400">
                                                        {item.label}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6">
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<ArrowRightOutlined />}
                                                onClick={handleJoinExam}
                                                className="demo3-cta !h-15 !rounded-full !border-0 !px-10 !text-lg !font-black"
                                                style={{background: "#ffe082", color: "#9a1111"}}
                                            >
                                                THAM GIA THI
                                            </Button>
                                        </div>
                                        <div className="mt-5 inline-flex flex-wrap items-end justify-center gap-x-3 gap-y-1 rounded-full bg-white/95 px-5 py-3 shadow-[0_14px_28px_rgba(102,17,17,0.14)]">
                                            <span className="text-sm font-black uppercase text-slate-500 md:text-base">Đã có</span>
                                            <span className="text-4xl font-black leading-none" style={{color: "#b91c1c"}}>
                                                {Intl.NumberFormat("vi-VN").format(DEMO_TOTAL_ATTEMPTS)}
                                            </span>
                                            <span className="text-sm font-black uppercase text-slate-500 md:text-base">lượt thi</span>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} xl={7}>
                                    <div className="demo3-paper h-full rounded-[28px] border p-4 md:p-5" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                            <CalendarOutlined />
                                            Thông tin cuộc thi
                                        </div>
                                        <div className="space-y-3">
                                            {infoCards.map((item) => (
                                                <div
                                                    key={item.key}
                                                    className="rounded-[22px] border bg-white px-4 py-3 shadow-[0_12px_22px_rgba(15,23,42,0.05)]"
                                                    style={{borderColor: alphaColor(colorPrimary, 0.08)}}
                                                >
                                                    <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]" style={{color: colorPrimary}}>
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
                                </Col>
                            </Row>
                        </div>
                    </Reveal>

                    <Reveal delay={110}>
                        <div className="demo3-marble rounded-[34px] border px-4 py-5 md:px-6" style={{borderColor: alphaColor(colorPrimary, 0.14)}}>
                            <div className="mb-5 text-center text-sm font-black uppercase tracking-[0.22em]" style={{color: colorPrimary}}>
                                Diễn tiến các đợt thi
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {DEMO_TIMELINE.map((item, index) => (
                                    <Reveal key={item.id} delay={130 + (index * 40)}>
                                        <div
                                            className="rounded-[26px] border bg-white px-5 py-5 shadow-[0_16px_28px_rgba(102,38,14,0.07)]"
                                            style={{
                                                borderColor: alphaColor(colorPrimary, item.id === dotThi.id ? 0.22 : 0.08),
                                                transform: `translateY(${Math.min(scrollY * 0.018 * (index + 1), 10)}px)`,
                                            }}
                                        >
                                            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                                Đợt {index + 1}
                                            </div>
                                            <div className="mt-2 text-2xl font-black text-slate-900">
                                                {item.ten}
                                            </div>
                                            <div className="mt-3 text-sm font-bold uppercase tracking-[0.14em]" style={{color: colorPrimary}}>
                                                {formatDate(item.thoi_gian_bat_dau)} - {formatDate(item.thoi_gian_ket_thuc)}
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    <Row gutter={[22, 22]} align="stretch">
                        <Col xs={24} xl={8}>
                            <Reveal delay={150}>
                                <div className="demo3-paper rounded-[30px] border p-5 md:p-6" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                    <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                        <TrophyFilled />
                                        Cơ cấu giải thưởng
                                    </div>
                                    <div className="space-y-3">
                                        {DEMO_PRIZES.giaiCaNhan.slice(0, 4).map((item) => (
                                            <div key={item.id} className="rounded-[22px] border bg-white px-4 py-4" style={{borderColor: alphaColor(colorPrimary, 0.08)}}>
                                                <div className="text-lg font-black text-slate-900">{item.tenGiai}</div>
                                                <div className="mt-1 text-sm font-semibold uppercase tracking-[0.12em]" style={{color: colorPrimary}}>
                                                    {item.soLuong} giải · {Intl.NumberFormat("vi-VN").format(item.triGia)}đ
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </Col>

                        <Col xs={24} xl={8}>
                            <Reveal delay={170}>
                                <div className="demo3-paper rounded-[30px] border p-5 md:p-6" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                    <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                        <FileTextOutlined />
                                        Tài liệu tuyên truyền
                                    </div>
                                    <div className="space-y-3">
                                        {DEMO_DOCUMENTS.map((item) => (
                                            <div key={item.id} className="rounded-[22px] border bg-white px-4 py-4" style={{borderColor: alphaColor(colorPrimary, 0.08)}}>
                                                <div className="text-lg font-black text-slate-900">{item.tieuDe}</div>
                                                <Paragraph className="!mb-0 !mt-1 !text-sm !leading-7 !text-slate-600">
                                                    {item.moTa}
                                                </Paragraph>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </Col>

                        <Col xs={24} xl={8}>
                            <Reveal delay={190}>
                                <div className="demo3-paper rounded-[30px] border p-5 md:p-6" style={{borderColor: alphaColor(colorPrimary, 0.12)}}>
                                    <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]" style={{color: colorPrimary}}>
                                        <FireFilled />
                                        Cá nhân nổi bật
                                    </div>
                                    <div className="space-y-3">
                                        {rankingRows.map((item, index) => (
                                            <div key={item.baiThiId} className="rounded-[22px] border bg-white px-4 py-4" style={{borderColor: alphaColor(colorPrimary, 0.08)}}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900">
                                                            {index + 1}. {item.thiSinh.hoTen}
                                                        </div>
                                                        <div className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                            {item.thiSinh.username}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Điểm</div>
                                                        <div className="text-3xl font-black leading-none" style={{color: colorPrimary}}>
                                                            {item.diem}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </Col>
                    </Row>
                </div>
            </div>

            {showFloatingCta ? (
                <div className="fixed bottom-5 right-5 z-40 md:bottom-7 md:right-7">
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleJoinExam}
                        icon={<ArrowRightOutlined />}
                        className="demo3-float !h-13 !rounded-full !border-0 !px-6 !text-sm !font-black md:!text-base"
                        style={{background: "#ffe082", color: "#9a1111"}}
                    >
                        Tham gia thi
                    </Button>
                </div>
            ) : null}

            <style>{`
                .demo3-marble {
                    background:
                        radial-gradient(circle at top center, rgba(255, 231, 173, 0.42), transparent 28%),
                        linear-gradient(180deg, rgba(255, 251, 240, 0.98), rgba(255, 246, 231, 0.98));
                }

                .demo3-paper {
                    background:
                        linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,251,243,0.98));
                    box-shadow: 0 20px 38px rgba(119, 44, 18, 0.1);
                }

                .demo3-center {
                    background:
                        radial-gradient(circle at top, rgba(255, 224, 130, 0.28), transparent 28%),
                        linear-gradient(180deg, rgba(140, 12, 12, 0.96), rgba(201, 31, 31, 0.95));
                    box-shadow: 0 28px 58px rgba(127, 29, 29, 0.28);
                }

                .demo3-cta {
                    box-shadow:
                        0 18px 34px rgba(127, 29, 29, 0.3),
                        0 0 0 4px rgba(255, 224, 130, 0.16);
                    animation: demo3-rise 2.5s ease-in-out infinite;
                }

                .demo3-float {
                    box-shadow:
                        0 18px 36px rgba(127, 29, 29, 0.26),
                        0 0 0 4px rgba(255, 224, 130, 0.14);
                }

                @keyframes demo3-rise {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-3px) scale(1.03);
                    }
                }
            `}</style>
        </div>
    );
}
