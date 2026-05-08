'use client';

import Image from "next/image";
import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useRef, useState} from "react";
import {getPublicFileUrl} from "~/services/file";
import {layDotThiHienTai, layDotThi} from "~/services/thi/dot-thi";
import {Button, Card, Col, Flex, QRCode, Row, Typography, theme} from "antd";
import {CheckCircleFilled, ClockCircleFilled, LaptopOutlined, ProfileOutlined, TeamOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {layLuotThiHienTai, layThoiGianConLaiCuaCuocThi} from "~/services/thi/cuoc-thi";
import CountDown from "~/app/(public)/CountDown";
import {useRouter} from "next/navigation";
import KetQuaCongBo from "~/app/(public)/KetQuaCongBo";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {alphaColor, darkenColor, lightenColor, parseMediaConfig} from "~/utils/workspaceTheme";
import TaiLieuTongHop from "~/app/(public)/TaiLieuTongHop";
import GiaiThuongCuocThi from "~/app/(public)/GiaiThuongCuocThi";

const {Text, Paragraph} = Typography;
const SO_LUOT_THI_TOI_THIEU = 132;

const tabItems = [
    {
        key: "thong-tin",
        title: "Thông tin",
        subtitle: "Cuộc thi",
        image: "/schedule.png",
    },
    {
        key: "giai-thuong",
        title: "Giải thưởng",
        subtitle: "Cơ cấu trao giải",
        image: "/medal.png",
    },
    {
        key: "document",
        title: "Tài liệu",
        subtitle: "Tham khảo cuộc thi",
        image: "/documentation.png",
    },
    {
        key: "ket-qua",
        title: "Kết quả",
        subtitle: "Công bố xếp hạng",
        image: "/medal.png",
    },
];

function buildTimelineStages(dsDotThi = [], currentDotThiId) {
    const now = dayjs();

    return [...dsDotThi]
        .sort((a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf())
        .map((item) => {
            const isCurrent = item.id === currentDotThiId;
            const isFinished = dayjs(item.thoi_gian_ket_thuc).isBefore(now);
            const isUpcoming = dayjs(item.thoi_gian_bat_dau).isAfter(now);

            let status = "Đang diễn ra";
            let tone = "active";

            if (isFinished) {
                status = "Đã kết thúc";
                tone = "done";
            } else if (isUpcoming) {
                status = "Sắp diễn ra";
                tone = "upcoming";
            } else if (isCurrent) {
                status = "Đang diễn ra";
                tone = "current";
            }

            return {
                id: item.id,
                ten: item.ten,
                status,
                tone,
                isCurrent,
                thoiGianBatDau: item.thoi_gian_bat_dau,
                thoiGianKetThuc: item.thoi_gian_ket_thuc,
            };
        });
}

function formatLongVietnameseDate(value) {
    if (!value) {
        return "";
    }

    const date = dayjs(value);

    if (!date.isValid()) {
        return "";
    }

    return `ngày ${date.date()} tháng ${date.month() + 1} năm ${date.year()}`;
}

function ContestTimeline({items, colorPrimary}) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className="grid gap-4 md:gap-5"
            style={{
                gridTemplateColumns: items.length > 1 ? `repeat(${items.length}, minmax(0, 1fr))` : "minmax(0, 1fr)",
            }}
        >
            {items.map((item, index) => {
                const isDone = item.tone === "done";
                const isCurrent = item.tone === "current";
                const accentColor = isDone ? "#94a3b8" : colorPrimary;

                return (
                    <div key={item.id} className="relative min-w-0">
                        {index > 0 ? (
                            <div
                                className="pointer-events-none absolute left-0 right-1/2 top-6 hidden h-[2px] md:block"
                                style={{
                                    background: `linear-gradient(90deg, ${alphaColor(colorPrimary, 0.08)} 0%, ${alphaColor(accentColor, 0.24)} 100%)`,
                                }}
                            />
                        ) : null}

                        {index < items.length - 1 ? (
                            <div
                                className="pointer-events-none absolute left-1/2 right-0 top-6 hidden h-[2px] md:block"
                                style={{
                                    background: `linear-gradient(90deg, ${alphaColor(accentColor, 0.24)} 0%, ${alphaColor(colorPrimary, 0.08)} 100%)`,
                                }}
                            />
                        ) : null}

                        <div className="flex items-start gap-4 md:flex-col md:items-stretch md:gap-3">
                            <div className="relative z-[1] pt-1 md:flex md:w-full md:justify-center md:pt-0">
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 bg-white text-lg md:h-12 md:w-12"
                                    style={{
                                        borderColor: isDone ? "#cbd5e1" : isCurrent ? colorPrimary : alphaColor(colorPrimary, 0.22),
                                        color: isDone ? "#64748b" : colorPrimary,
                                        boxShadow: isCurrent ? `0 10px 24px ${alphaColor(colorPrimary, 0.16)}` : undefined,
                                    }}
                                >
                                    {isDone ? <CheckCircleFilled /> : <ClockCircleFilled />}
                                </div>
                            </div>

                            <div
                                className="relative min-h-[170px] min-w-0 flex-1 rounded-[24px] border bg-white px-4 py-4 transition-all duration-300 md:px-5"
                                style={{
                                    borderColor: isCurrent ? alphaColor(colorPrimary, 0.34) : alphaColor(accentColor, 0.14),
                                    boxShadow: isCurrent ? `0 16px 32px ${alphaColor(colorPrimary, 0.12)}` : undefined,
                                }}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div
                                        className="text-sm font-semibold uppercase tracking-[0.14em]"
                                        style={{color: isDone ? "#64748b" : colorPrimary}}
                                    >
                                        Đợt {index + 1}
                                    </div>
                                    <div
                                        className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                                        style={{
                                            background: isDone ? "rgba(148,163,184,0.12)" : alphaColor(colorPrimary, isCurrent ? 0.14 : 0.08),
                                            color: isDone ? "#64748b" : colorPrimary,
                                            border: `1px solid ${isDone ? "rgba(148,163,184,0.18)" : alphaColor(colorPrimary, isCurrent ? 0.2 : 0.12)}`,
                                        }}
                                    >
                                        {item.status}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div
                                        className="text-lg font-bold md:text-xl"
                                        style={{color: isDone ? "#334155" : isCurrent ? colorPrimary : "#0f172a"}}
                                    >
                                        {item.ten}
                                    </div>

                                    <div className="space-y-2 rounded-2xl border px-4 py-3 text-sm text-slate-600" style={{borderColor: alphaColor(accentColor, 0.12)}}>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium text-slate-500">Bắt đầu</span>
                                            <span className="font-semibold text-slate-900">
                                                {dayjs(item.thoiGianBatDau).format("DD/MM/YYYY")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium text-slate-500">Kết thúc</span>
                                            <span className="font-semibold text-slate-900">
                                                {dayjs(item.thoiGianKetThuc).format("DD/MM/YYYY")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SectionDivider({colorPrimary}) {
    return (
        <div className="flex items-center justify-center py-1 md:py-1.5" aria-hidden="true">
            <div className="flex w-full max-w-3xl items-center gap-4 md:gap-5">
                <div
                    className="h-px flex-1"
                    style={{
                        background: `linear-gradient(90deg, transparent 0%, ${alphaColor(colorPrimary, 0.24)} 100%)`,
                    }}
                />
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border"
                    style={{
                        borderColor: alphaColor(colorPrimary, 0.22),
                        background: `radial-gradient(circle, ${alphaColor(colorPrimary, 0.16)} 0%, ${alphaColor(colorPrimary, 0.06)} 55%, rgba(255,255,255,0.95) 100%)`,
                        boxShadow: `0 8px 20px ${alphaColor(colorPrimary, 0.1)}`,
                    }}
                >
                    <div
                        className="h-2.5 w-2.5 rotate-45 rounded-[4px]"
                        style={{
                            background: `linear-gradient(135deg, ${lightenColor(colorPrimary, 0.22)} 0%, ${colorPrimary} 100%)`,
                        }}
                    />
                </div>
                <div
                    className="h-px flex-1"
                    style={{
                        background: `linear-gradient(90deg, ${alphaColor(colorPrimary, 0.24)} 0%, transparent 100%)`,
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [dotThi, setDotThi] = useState(null);
    const [thoiGianConLai, setThoiGianConLai] = useState(null);
    const [tongLuotThi, setTongLuotThi] = useState(SO_LUOT_THI_TOI_THIEU);
    const [dsDotThi, setDsDotThi] = useState([]);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [activeSection, setActiveSection] = useState("thong-tin");
    const [compactTicker, setCompactTicker] = useState(false);
    const [qrValue, setQrValue] = useState("");
    const sectionRefs = useRef({
        "thong-tin": null,
        "giai-thuong": null,
        "document": null,
        "ket-qua": null,
    });

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const deepPrimary = darkenColor(colorPrimary, 0.18);
    const route = useRouter();
    const user = useAuthStore((state) => state.user);

    const contestMeta = useMemo(
        () => parseCuocThiMeta(dotThi?.cuoc_thi?.mo_ta),
        [dotThi?.cuoc_thi?.mo_ta]
    );
    const timelineItems = useMemo(
        () => buildTimelineStages(dsDotThi, dotThi?.id),
        [dotThi?.id, dsDotThi]
    );

    const infoCards = [
        {
            title: "Đối tượng tham gia",
            value: contestMeta.doi_tuong_tham_gia || "Thông tin sẽ được cập nhật trong cuộc thi.",
            icon: <TeamOutlined />,
        },
        {
            title: "Nội dung cuộc thi",
            value: contestMeta.noi_dung_cuoc_thi || "Thông tin sẽ được cập nhật trong cuộc thi.",
            icon: <ProfileOutlined />,
        },
        {
            title: "Hình thức dự thi",
            value: contestMeta.hinh_thuc_du_thi || "Thông tin sẽ được cập nhật trong cuộc thi.",
            icon: <LaptopOutlined />,
        },
    ];

    const getKhoa = () => {
        if (window.innerWidth < 768) {
            return "banner_mobile";
        }

        return "banner_desktop";
    };

    useEffect(() => {
        let active = true;

        const load = async () => {
            const applyIfActive = (callback) => {
                if (active) {
                    callback();
                }
            };

            const mobile = window.innerWidth < 768;
            const khoa = getKhoa();

            try {
            } catch (error) {
                console.error("Không thể tải dữ liệu trang chủ", error);
            }

            const [bannerResult, dotThiResult, conLaiResult, luotThiResult] = await Promise.allSettled([
                layCauHinh(khoa),
                layDotThiHienTai(),
                layThoiGianConLaiCuaCuocThi(),
                layLuotThiHienTai(),
            ]);

            applyIfActive(() => {
                setIsMobileViewport(mobile);
            });

            if (bannerResult.status === "fulfilled" && bannerResult.value?.data) {
                const val = parseMediaConfig(bannerResult.value.data.gia_tri);

                applyIfActive(() => {
                    setImage(val.duongDan || val.url || "");
                    setZoom(val.zoom || 1);
                });
            } else {
                applyIfActive(() => {
                    setImage(null);
                    setZoom(1);
                });
            }

            if (dotThiResult.status === "fulfilled" && dotThiResult.value?.data) {
                const currentDotThi = dotThiResult.value.data;

                applyIfActive(() => {
                    setDotThi(currentDotThi);
                });

                if (currentDotThi.cuoc_thi_id) {
                    try {
                        const dsDotThi = await layDotThi(currentDotThi.cuoc_thi_id, {
                            size: 50,
                            page: 1,
                        });

                        applyIfActive(() => {
                            setDsDotThi(dsDotThi?.data || []);
                        });
                    } catch (error) {
                        console.error("Không thể tải timeline đợt thi", error);
                    }
                }
            }

            if (conLaiResult.status === "fulfilled" && conLaiResult.value?.data) {
                applyIfActive(() => {
                    setThoiGianConLai(conLaiResult.value.data);
                });
            }

            if (luotThiResult.status === "fulfilled") {
                applyIfActive(() => {
                    setTongLuotThi(
                        Number(luotThiResult.value?.data || 0)
                    );
                });
            }
        };

        void load();

        const onResize = () => {
            void load();
        };

        window.addEventListener("resize", onResize);

        return () => {
            active = false;
            window.removeEventListener("resize", onResize);
        };
    }, []);

    useEffect(() => {
        const updateTickerState = () => {
            const stickyTrigger = isMobileViewport ? 220 : 260;
            setCompactTicker(window.scrollY > stickyTrigger);

            const offsets = tabItems.map((item) => {
                const node = sectionRefs.current[item.key];

                if (!node) {
                    return null;
                }

                return {
                    key: item.key,
                    top: node.getBoundingClientRect().top + window.scrollY,
                };
            }).filter(Boolean);

            const current =
                [...offsets]
                    .reverse()
                    .find((item) => window.scrollY + 140 >= item.top);

            if (current?.key) {
                setActiveSection(current.key);
            }
        };

        updateTickerState();
        window.addEventListener("scroll", updateTickerState, { passive: true });

        return () => {
            window.removeEventListener("scroll", updateTickerState);
        };
    }, [isMobileViewport]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        setQrValue(`${window.location.origin}/login`);
    }, []);

    const handleJoinExam = () => {
        let currentUser = user;

        if (!currentUser && typeof window !== "undefined") {
            try {
                currentUser =
                    JSON.parse(localStorage.getItem("user") || "null");
            } catch {
                currentUser = null;
            }
        }

        if (!currentUser) {
            route.push("/login");
            return;
        }

        if (currentUser.role === "super_admin") {
            route.push("/super-admin");
            return;
        }

        if (currentUser.role === "admin") {
            route.push("/admin/dashboard");
            return;
        }

        route.push("/user");
    };

    const hienThiTongLuotThi = useMemo(
        () => Number(tongLuotThi || 0),
        [tongLuotThi]
    );

    const thongTinDuThi = useMemo(() => {
        const batDau = formatLongVietnameseDate(dotThi?.cuoc_thi?.thoi_gian_bat_dau);
        const ketThuc = formatLongVietnameseDate(dotThi?.cuoc_thi?.thoi_gian_ket_thuc);

        if (batDau && ketThuc) {
            return `Cuộc thi diễn ra từ ${batDau} đến hết ${ketThuc}. Tập thể, cá nhân đoạt giải được thông báo sau khi cuộc thi kết thúc.`;
        }

        return "Tập thể, cá nhân đoạt giải được thông báo sau khi cuộc thi kết thúc.";
    }, [dotThi?.cuoc_thi?.thoi_gian_bat_dau, dotThi?.cuoc_thi?.thoi_gian_ket_thuc]);

    const scrollToSection = (key) => {
        const node = sectionRefs.current[key];

        if (!node) {
            return;
        }

        const top = node.getBoundingClientRect().top + window.scrollY - 96;

        window.scrollTo({
            top,
            behavior: "smooth",
        });
    };

    return (
        <div className="w-full bg-[#fffdf4]">
            <Reveal animation="soft">
                <div className="">
                    <div className="w-full">
                        <div
                            className="relative w-full overflow-hidden bg-[#fdf7df] shadow-sm"
                            style={{
                                aspectRatio: isMobileViewport ? "16/9" : "16/3"
                            }}
                        >
                            {image && (
                                <img
                                    src={
                                        getPublicFileUrl(
                                            image
                                        )
                                    }
                                    alt=""
                                    style={{
                                        width: `${100 * zoom}%`,
                                        height: `${100 * zoom}%`,
                                        objectFit: "cover",
                                        objectPosition: "center",
                                        position: "absolute",
                                        left: "50%",
                                        top: "50%",
                                        transform:
                                            "translate(-50%, -50%)"
                                    }}
                                />
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.22)_100%)]" />
                        </div>
                    </div>
                </div>

            </Reveal>

            <div
                className={`sticky z-30 border-b transition-all duration-300 ${
                    compactTicker
                        ? "top-0 backdrop-blur-xl"
                        : "top-0"
                }`}
                style={{
                    background: compactTicker
                        ? "rgba(255,255,255,0.92)"
                        : null,
                    borderColor: alphaColor(colorPrimary, compactTicker ? 0.18 : 0),
                    boxShadow: compactTicker
                        ? `0 14px 30px ${alphaColor(colorPrimary, 0.12)}`
                        : null,
                }}
            >
                <div className="mx-auto w-full px-4 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-50">
                    <Reveal delay={80} className="h-full w-full">
                        <div
                            className={`grid grid-cols-2 gap-2.5 py-2 transition-all duration-300 md:grid-cols-4 ${
                                compactTicker ? "md:py-1.5" : "md:py-2.5"
                            }`}
                        >
                            {tabItems.map((item) => {
                                const isActive = activeSection === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => scrollToSection(item.key)}
                                        className={`flex gap-3 rounded-2xl border transition duration-300 ${
                                            compactTicker
                                                ? "min-h-0 items-center justify-center px-3 py-2 text-center"
                                                : "min-h-20 items-center justify-start px-4 py-3 text-left"
                                        } ${
                                            isActive
                                                ? "shadow-sm"
                                                : "hover:-translate-y-0.5 hover:shadow-sm"
                                        }`}
                                        style={isActive
                                            ? {
                                                borderColor: colorPrimary,
                                                backgroundColor: alphaColor(colorPrimary, 0.12),
                                                color: colorPrimary,
                                            }
                                            : {
                                                borderColor: alphaColor(colorPrimary, 0.16),
                                                backgroundColor: compactTicker ? "rgba(255,255,255,0.88)" : "#f8fafc",
                                                color: "#334155",
                                            }}
                                    >
                                        <Image
                                            src={item.image}
                                            width={compactTicker ? 24 : 40}
                                            height={compactTicker ? 24 : 40}
                                            alt=""
                                        />
                                        {compactTicker ? (
                                            <span className="text-sm font-semibold">
                                                {item.title}
                                            </span>
                                        ) : (
                                            <div className="flex min-w-0 flex-col text-left">
                                                <span
                                                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                                                    style={{color: isActive ? colorPrimary : "#64748b"}}
                                                >
                                                    {item.title}
                                                </span>
                                                <span className="mt-1 text-sm font-bold md:text-base">
                                                    {item.subtitle}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Reveal>
                </div>
            </div>

            <div className="mx-auto w-full px-4 py-4 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-50">
                <Row gutter={[20, 20]} align="stretch">
                    <Col
                        span={24}
                        ref={(node) => {
                            sectionRefs.current["thong-tin"] = node;
                        }}
                    />
                    <Col xs={24} xl={12} className="flex">
                        <Reveal delay={90} className="h-full w-full">
                            <Card
                                className="h-full overflow-hidden rounded-[28px] border shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
                                style={{borderColor: alphaColor(colorPrimary, 0.14)}}
                                styles={{body: {padding: 0, height: "100%"}}}
                            >
                                <Flex vertical className="h-full" style={{background: alphaColor(colorPrimary, 0.05)}}>
                                    <h3 style={{
                                        background: deepPrimary,
                                        margin: '0'
                                    }} className="px-4 text-center py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white md:text-base">
                                        Thông tin cuộc thi
                                    </h3>

                                    <Flex vertical gap={18} className="flex-1 !px-5 !py-5 !md:px-6 !md:py-6 justify-around">
                                    
                                        {infoCards.map((item) => (
                                            <div key={item.title} className="space-y-3">
                                                <Text style={{
                                                    color: colorPrimary
                                                }} className="!block !text-xl !font-bold !uppercase !tracking-[0.04em] md:!text-xl">
                                                    {item.title}
                                                </Text>
                                                <div className="flex items-start gap-3 md:gap-4">
                                                    <div className="flex h-16 w-16 shrink-0 items-center 
                                                    justify-center rounded-full border-[3px] 
                                                    border-white bg-white text-[1.7rem] md:h-18 md:w-18"
                                                    style={{
                                                        color: colorPrimary,
                                                        borderColor: alphaColor(colorPrimary, 0.12),
                                                    }}>
                                                        {item.icon}
                                                    </div>
                                                    <div
                                                        className="flex-1 rounded-[24px] bg-white px-5 py-4"
                                                        style={{border: `1px solid ${alphaColor(colorPrimary, 0.1)}`}}
                                                    >
                                                        <Paragraph className="!mb-0 !text-sm !leading-7 !text-slate-700 md:!text-base">
                                                            {item.value}
                                                        </Paragraph>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Flex>
                                </Flex>
                            </Card>
                        </Reveal>
                    </Col>

                    <Col xs={24} xl={12} className="flex">
                        <Reveal delay={110} className="h-full w-full">
                            <Flex vertical gap={12} className="h-full w-full">
                                {thoiGianConLai && (
                                    <Reveal delay={70}>
                                        <CountDown time={thoiGianConLai}/>
                                    </Reveal>
                                )}

                                <Card
                                    className="flex-1 overflow-hidden rounded-[28px] border shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
                                    style={{borderColor: alphaColor(colorPrimary, 0.14)}}
                                    styles={{body: {padding: 0, height: "100%"}}}
                                >
                                    <Flex vertical className="h-full" style={{background: alphaColor(colorPrimary, 0.05)}}>
                                        <div className="flex-1 space-y-5 px-6 py-6 text-center md:px-7">
                                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                                                <div className="join-exam-pulse relative inline-flex items-center justify-center">
                                                    <span
                                                        className="join-exam-pulse__ring join-exam-pulse__ring--outer"
                                                        style={{"--pulse-color": alphaColor(colorPrimary, 0.22)}}
                                                    />
                                                    <span
                                                        className="join-exam-pulse__ring join-exam-pulse__ring--inner"
                                                        style={{"--pulse-color": alphaColor(colorPrimary, 0.34)}}
                                                    />
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        className="join-exam-pulse__button !h-14 w-full !rounded-2xl !px-8 !text-lg !font-bold sm:!min-w-[15rem]"
                                                        onClick={handleJoinExam}
                                                    >
                                                        THAM GIA THI
                                                    </Button>
                                                </div>

                                                <div
                                                    className="flex items-center gap-3 rounded-[24px] border bg-white px-4 py-3"
                                                    style={{borderColor: alphaColor(colorPrimary, 0.12)}}
                                                >
                                                    <QRCode
                                                        value={qrValue || " "}
                                                        size={88}
                                                        bordered={false}
                                                        color={colorPrimary}
                                                        bgColor="transparent"
                                                    />
                                                    <div className="text-left">
                                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                            Quét để tham gia
                                                        </div>
                                                        <div className="mt-1 text-sm font-medium text-slate-700">
                                                            Mở nhanh trên điện thoại
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 x-5 px-6" style={{borderColor: alphaColor(colorPrimary, 0.1)}}>
                                                <span className="text-xl font-semibold text-slate-900 md:text-2xl">
                                                    {thongTinDuThi}
                                                </span>
                                            </div>

                                            {hienThiTongLuotThi > SO_LUOT_THI_TOI_THIEU ? (
                                                <div className="text-center">
                                                    <Text style={{color: colorPrimary}} className="!mb-0 !block uppercase !text-base !font-semibold !tracking-[0.12em] md:!text-lg">
                                                        Đã có
                                                    </Text>
                                                    <div className="mt-1 flex flex-wrap items-end justify-center gap-x-3 gap-y-1">
                                                        <span className="text-5xl font-bold leading-none md:text-6xl" style={{color: colorPrimary}}>
                                                            {Intl.NumberFormat("vi-VN").format(hienThiTongLuotThi)}
                                                        </span>
                                                        <span className="pb-1 text-lg font-semibold uppercase text-slate-700 md:text-xl">
                                                            lượt thi
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </Flex>
                                </Card>

                            </Flex>
                        </Reveal>
                    </Col>

                    <Col span={24}>
                        <Reveal delay={130}>
                            <ContestTimeline items={timelineItems} colorPrimary={colorPrimary} />
                        </Reveal>
                    </Col>

                    <Col span={24}>
                        <div className="space-y-5">
                            <SectionDivider colorPrimary={colorPrimary} />

                            <Reveal delay={160}>
                                <section
                                    ref={(node) => {
                                        sectionRefs.current["giai-thuong"] = node;
                                    }}
                                    className="scroll-mt-24 space-y-3"
                                >
                                    <div className="space-y-1.5">
                                        <Text className="!text-xs !font-semibold !uppercase !tracking-[0.22em]" style={{color: colorPrimary}}>
                                            Cơ cấu giải thưởng
                                        </Text>
                                        <div className="text-3xl font-bold text-slate-900">
                                            Giải thưởng
                                        </div>
                                    </div>
                                    <GiaiThuongCuocThi/>
                                </section>
                            </Reveal>

                            <SectionDivider colorPrimary={colorPrimary} />

                            <Reveal delay={180}>
                                <section
                                    ref={(node) => {
                                        sectionRefs.current["document"] = node;
                                    }}
                                    className="scroll-mt-24 space-y-3"
                                >
                                    <div className="space-y-1.5">
                                        <Text className="!text-xs !font-semibold !uppercase !tracking-[0.22em]" style={{color: colorPrimary}}>
                                            Tài liệu phục vụ
                                        </Text>
                                        <div className="text-3xl font-bold text-slate-900">
                                            Tài liệu
                                        </div>
                                    </div>
                                    <TaiLieuTongHop/>
                                </section>
                            </Reveal>

                            <SectionDivider colorPrimary={colorPrimary} />

                            <Reveal delay={200}>
                                <section
                                    ref={(node) => {
                                        sectionRefs.current["ket-qua"] = node;
                                    }}
                                    className="scroll-mt-24 space-y-3"
                                >
                                    <div className="space-y-1.5">
                                        <Text className="!text-xs !font-semibold !uppercase !tracking-[0.22em]" style={{color: colorPrimary}}>
                                            Công bố thành tích
                                        </Text>
                                        <div className="text-3xl font-bold text-slate-900">
                                            Kết quả
                                        </div>
                                    </div>
                                    <KetQuaCongBo dotThi={dotThi} />
                                </section>
                            </Reveal>
                        </div>
                    </Col>
                </Row>
            </div>
            <style>{`
                .join-exam-pulse {
                    isolation: isolate;
                }

                .join-exam-pulse__button {
                    position: relative;
                    z-index: 2;
                    animation: join-exam-heartbeat 2.8s ease-in-out infinite;
                    box-shadow:
                        0 0 0 1px rgba(25, 72, 190, 0.10),
                        0 0 22px rgba(25, 72, 190, 0.22),
                        0 0 42px rgba(25, 72, 190, 0.16);
                }

                .join-exam-pulse__ring {
                    position: absolute;
                    inset: -2px;
                    border-radius: 18px;
                    background: var(--pulse-color);
                    z-index: 1;
                    pointer-events: none;
                    transform-origin: center;
                    filter: blur(2px);
                }

                .join-exam-pulse__ring--inner {
                    animation: join-exam-wave-inner 2.8s ease-out infinite;
                }

                .join-exam-pulse__ring--outer {
                    animation: join-exam-wave-outer 2.8s ease-out infinite 0.42s;
                }

                @keyframes join-exam-heartbeat {
                    0%, 100% {
                        transform: scale(1);
                    }
                    12% {
                        transform: scale(1.035);
                    }
                    22% {
                        transform: scale(0.988);
                    }
                    32% {
                        transform: scale(1.055);
                    }
                    44% {
                        transform: scale(1);
                    }
                }

                @keyframes join-exam-wave-inner {
                    0% {
                        opacity: 0;
                        transform: scale(0.94);
                    }
                    18% {
                        opacity: 0.5;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.34);
                    }
                }

                @keyframes join-exam-wave-outer {
                    0% {
                        opacity: 0;
                        transform: scale(0.96);
                    }
                    20% {
                        opacity: 0.34;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.5);
                    }
                }
            `}</style>
        </div>
    );
}
