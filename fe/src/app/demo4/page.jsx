'use client';

import {useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import {ArrowRightOutlined, TrophyFilled, UserOutlined} from "@ant-design/icons";
import {Button, Card, Col, Empty, QRCode, Row, Spin, Statistic, Typography, theme} from "antd";
import {useRouter} from "next/navigation";

import {layCauHinh} from "~/services/cau-hinh";
import {layCuocThi, layLuotThiHienTai} from "~/services/thi/cuoc-thi";
import {layDotThi} from "~/services/thi/dot-thi";
import {xepHangDonViTheoCuocThi, xepHangTracNghiemTheoCuocThi} from "~/services/thi/thi";
import {getDonVi} from "~/services/dm_chung/don_vi";
import PublicPageBanner from "~/app/(public)/components/PublicPageBanner";
import PublicContestTimeline from "~/app/(public)/components/PublicContestTimeline";
import Reveal from "~/app/components/common/Reveal";
import GiaiThuongCuocThi from "~/app/demo1/GiaiThuongCuocThi";
import TaiLieuTongHop from "~/app/demo1/TaiLieuTongHop";
import {buildTimelineStages} from "~/app/demo1/page.config";
import {DEMO_BANNER_CONFIG} from "~/app/demo1/demo-data";
import {useAuthStore} from "~/store/auth";
import useDemoRouteAccess from "~/hooks/useDemoRouteAccess";
import {alphaColor, darkenColor, parseMediaConfig} from "~/utils/workspaceTheme";

const {Title, Text} = Typography;

function chonCuocThiGanNhat(dsCuocThi = []) {
    const now = dayjs();
    const dsHopLe = [...dsCuocThi]
        .filter((item) => item?.trang_thai)
        .filter((item) => {
            const ketThuc = dayjs(item.thoi_gian_ket_thuc);
            return ketThuc.isValid() && !ketThuc.isBefore(now);
        });

    const dsSapDienRa =
        dsHopLe.filter((item) => dayjs(item.thoi_gian_bat_dau).isAfter(now));

    if (dsSapDienRa.length) {
        return dsSapDienRa.sort(
            (a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf()
        )[0];
    }

    return dsHopLe.sort(
        (a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf()
    )[0] || null;
}

function chonDotThiDaiDien(dsDotThi = []) {
    const now = dayjs();

    if (!dsDotThi.length) {
        return null;
    }

    const dsSapDienRa =
        dsDotThi.filter((item) => dayjs(item.thoi_gian_bat_dau).isAfter(now));

    if (dsSapDienRa.length) {
        return [...dsSapDienRa].sort(
            (a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf()
        )[0];
    }

    const dangDienRa = dsDotThi.find((item) => {
        const batDau = dayjs(item.thoi_gian_bat_dau);
        const ketThuc = dayjs(item.thoi_gian_ket_thuc);
        return !batDau.isAfter(now) && !ketThuc.isBefore(now);
    });

    if (dangDienRa) {
        return dangDienRa;
    }

    return [...dsDotThi].sort(
        (a, b) => dayjs(b.thoi_gian_bat_dau).valueOf() - dayjs(a.thoi_gian_bat_dau).valueOf()
    )[0] || null;
}

function taoDotThiTheoCuocThi(cuocThi, dsDotThi = []) {
    if (!cuocThi) {
        return null;
    }

    const dotThiDaiDien = chonDotThiDaiDien(dsDotThi);

    if (!dotThiDaiDien) {
        return {
            id: null,
            cuoc_thi_id: cuocThi.id,
            ten: "",
            mo_ta: "",
            thoi_gian_thi: null,
            la_sap_dien_ra: dayjs(cuocThi.thoi_gian_bat_dau).isAfter(dayjs()),
            cuoc_thi: cuocThi,
        };
    }

    return {
        ...dotThiDaiDien,
        cuoc_thi_id: cuocThi.id,
        la_sap_dien_ra: dayjs(dotThiDaiDien.thoi_gian_bat_dau).isAfter(dayjs()),
        cuoc_thi: cuocThi,
    };
}

function taoThongTinDemNguoc(cuocThi) {
    if (!cuocThi) {
        return null;
    }

    const now = dayjs();
    const batDau = dayjs(cuocThi.thoi_gian_bat_dau);
    const ketThuc = dayjs(cuocThi.thoi_gian_ket_thuc);

    if (!batDau.isValid() || !ketThuc.isValid() || ketThuc.isBefore(now)) {
        return null;
    }

    const moc = batDau.isAfter(now) ? batDau : ketThuc;
    let seconds = Math.max(0, moc.diff(now, "second"));

    const thang = Math.floor(seconds / (30 * 24 * 3600));
    seconds %= 30 * 24 * 3600;

    const tuan = Math.floor(seconds / (7 * 24 * 3600));
    seconds %= 7 * 24 * 3600;

    const ngay = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;

    const gio = Math.floor(seconds / 3600);
    seconds %= 3600;

    const phut = Math.floor(seconds / 60);
    const giay = seconds % 60;

    return {
        thang,
        tuan,
        ngay,
        gio,
        phut,
        giay,
        dem_nguoc: !batDau.isAfter(now),
    };
}

function buildCountdownCards(countdown) {
    const totalDays = ((countdown?.thang || 0) * 30) + ((countdown?.tuan || 0) * 7) + (countdown?.ngay || 0);

    return [
        {label: "Ngày", value: totalDays},
        {label: "Giờ", value: countdown?.gio ?? 0},
        {label: "Phút", value: countdown?.phut ?? 0},
        {label: "Giây", value: countdown?.giay ?? 0},
    ];
}

function getThiSinh(record) {
    return record?.thiSinh || record?.thi_sinh || null;
}

function getTenDonVi(record) {
    return record?.tenDonVi || record?.ten_don_vi || record?.ten || "-";
}

function getDonViThiSinh(record) {
    return record?.don_vi?.ten
        || record?.don_vi_ten
        || getThiSinh(record)?.don_vi?.ten
        || getThiSinh(record)?.don_vi_ten
        || "";
}

function normalizeRankingParticipants(rows = []) {
    return rows.map((item, index) => ({
        id: item?.baiThiId || item?.bai_thi_id || item?.id || index,
        hoTen: getThiSinh(item)?.hoTen || getThiSinh(item)?.ho_ten || "-",
        donVi: getDonViThiSinh(item),
        diem: Number(item?.diem || 0),
    }));
}

function normalizeUnitRankings(rows = []) {
    return rows.map((item, index) => ({
        id: item?.donViId || item?.don_vi_id || item?.id || index,
        tenDonVi: getTenDonVi(item),
        diem: Number(item?.soLuongThiSinh ?? item?.so_luong_thi_sinh ?? 0),
    }));
}

function normalizeAlphabetUnits(rows = []) {
    return [...rows]
        .sort((a, b) => String(a?.ten || "").localeCompare(String(b?.ten || ""), "vi"))
        .map((item, index) => ({
            id: item?.id || index,
            tenDonVi: item?.ten || "-",
            diem: null,
        }));
}

function resolveLuotThiValue(payload) {
    if (typeof payload === "number") {
        return payload;
    }

    if (Array.isArray(payload)) {
        return payload.length;
    }

    return Number(
        payload?.tongLuotThi
        ?? payload?.tong_luot_thi
        ?? payload?.soLuong
        ?? payload?.so_luong
        ?? payload?.value
        ?? 0
    ) || 0;
}

function RankingColumn({
    title,
    icon,
    items,
    colorPrimary,
    deepPrimary,
    emptyText,
    loading = false,
}) {
    const headerBackground = `linear-gradient(135deg, ${alphaColor(colorPrimary, 0.18)} 0%, ${alphaColor(colorPrimary, 0.32)} 100%)`;

    return (
        <Card
            className="h-full overflow-hidden rounded-[30px] border shadow-[0_20px_44px_rgba(15,23,42,0.08)]"
            style={{borderColor: alphaColor(colorPrimary, 0.14)}}
            styles={{body: {padding: 0, height: "100%"}}}
        >
            <div className="flex h-full flex-col bg-white">
                <div
                    className="flex items-center gap-3 px-5 py-4 text-sm font-black uppercase tracking-[0.18em]"
                    style={{
                        background: headerBackground,
                        color: deepPrimary,
                    }}
                >
                    {icon}
                    {title}
                </div>

                <div className="demo4-scroll flex-1 space-y-3 px-4 py-4" style={{maxHeight: 560, overflowY: "auto"}}>
                    {loading ? (
                        <div className="flex min-h-[18rem] items-center justify-center">
                            <Spin size="large" />
                        </div>
                    ) : !items.length ? (
                        <div className="flex min-h-[18rem] items-center justify-center">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
                        </div>
                    ) : items.map((item, index) => (
                        <div
                            key={item.id}
                            className="rounded-[24px] border bg-[linear-gradient(180deg,#ffffff_0%,#fff7f2_100%)] px-4 py-4"
                            style={{borderColor: alphaColor(colorPrimary, 0.1)}}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black"
                                    style={{
                                        background: index < 3 ? alphaColor(colorPrimary, 0.16) : "#f8fafc",
                                        color: colorPrimary,
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base font-black leading-6 text-slate-900">
                                        {item.tenDonVi || item.hoTen}
                                    </div>
                                    {item.donVi ? (
                                        <div className="mt-1 text-sm text-slate-500">
                                            {item.donVi}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black leading-none" style={{color: colorPrimary}}>
                                        {item.diem == null ? "-" : Intl.NumberFormat("vi-VN").format(item.diem)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

export default function Demo4Page({skipDemoAccessCheck = false}) {
    const canRender = useDemoRouteAccess("demo4", skipDemoAccessCheck);
    const [image, setImage] = useState(DEMO_BANNER_CONFIG.image);
    const [zoom, setZoom] = useState(DEMO_BANNER_CONFIG.zoom);
    const [bannerPositionX, setBannerPositionX] = useState(DEMO_BANNER_CONFIG.positionX);
    const [bannerPositionY, setBannerPositionY] = useState(DEMO_BANNER_CONFIG.positionY);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [dotThi, setDotThi] = useState(null);
    const [dsDotThi, setDsDotThi] = useState([]);
    const [tongLuotThi, setTongLuotThi] = useState(0);
    const [topUnits, setTopUnits] = useState([]);
    const [topParticipants, setTopParticipants] = useState([]);
    const [unitLoading, setUnitLoading] = useState(true);
    const [participantLoading, setParticipantLoading] = useState(true);

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const deepPrimary = darkenColor(colorPrimary, 0.12);
    const rankingHeaderBackground = `linear-gradient(135deg, ${alphaColor(colorPrimary, 0.18)} 0%, ${alphaColor(colorPrimary, 0.32)} 100%)`;
    const parallaxLayers = [
        {
            key: "cantho",
            src: "/bg_cantho.jpg",
            top: "96vh",
            left: "-4vw",
            width: "52vw",
            height: "42vh",
            speed: 0.05,
            opacity: 0.42,
            mobileOpacity: 0.32,
        },
        {
            key: "soctrang",
            src: "/bg_soctrang.jpg",
            top: "142vh",
            right: "-2vw",
            width: "48vw",
            height: "38vh",
            speed: 0.08,
            opacity: 0.44,
            mobileOpacity: 0.34,
        },
        {
            key: "haugiang",
            src: "/bg_haugiang.jpg",
            top: "196vh",
            left: "10vw",
            width: "62vw",
            height: "42vh",
            speed: 0.11,
            opacity: 0.4,
            mobileOpacity: 0.3,
        },
    ];
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const timelineItems = useMemo(
        () => buildTimelineStages(dsDotThi, dotThi?.id),
        [dotThi?.id, dsDotThi]
    );
    const countdownCards = useMemo(() => buildCountdownCards(countdown), [countdown]);
    const qrValue = typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "";

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
        let active = true;

        const load = async () => {
            try {
                const [cuocThiResult, luotThiResult] = await Promise.allSettled([
                    layCuocThi({
                        size: 100,
                        page: 1,
                        sortField: "thoi_gian_bat_dau",
                        sortType: "asc",
                    }),
                    layLuotThiHienTai(),
                ]);

                const selectedCuocThi = cuocThiResult.status === "fulfilled"
                    ? chonCuocThiGanNhat(cuocThiResult.value?.data || [])
                    : null;

                if (active) {
                    setTongLuotThi(
                        luotThiResult.status === "fulfilled"
                            ? resolveLuotThiValue(luotThiResult.value?.data ?? luotThiResult.value)
                            : 0
                    );
                }

                if (!selectedCuocThi?.id) {
                    if (active) {
                        setDotThi(null);
                        setDsDotThi([]);
                        setCountdown(null);
                    }
                    return;
                }

                const dsDotThiResult = await layDotThi(selectedCuocThi.id, {
                    size: 50,
                    page: 1,
                    sortField: "thoi_gian_bat_dau",
                    sortType: "asc",
                });
                const danhSachDotThi = dsDotThiResult?.data || [];
                const selectedDotThi = taoDotThiTheoCuocThi(selectedCuocThi, danhSachDotThi);

                if (active) {
                    setDotThi(selectedDotThi);
                    setDsDotThi(danhSachDotThi);
                    setCountdown(taoThongTinDemNguoc(selectedCuocThi));
                }
            } catch {
                if (active) {
                    setDotThi(null);
                    setDsDotThi([]);
                    setCountdown(null);
                    setTongLuotThi(0);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadRankings = async () => {
            if (!dotThi?.cuoc_thi_id) {
                if (active) {
                    setTopParticipants([]);
                    setTopUnits([]);
                    setParticipantLoading(false);
                    setUnitLoading(false);
                }
                return;
            }

            setParticipantLoading(true);
            setUnitLoading(true);

            const [participantsResult, unitsResult] = await Promise.allSettled([
                xepHangTracNghiemTheoCuocThi(dotThi.cuoc_thi_id, 20),
                xepHangDonViTheoCuocThi(dotThi.cuoc_thi_id, 1000),
            ]);

            if (!active) {
                return;
            }

            const participantRows = participantsResult.status === "fulfilled"
                ? normalizeRankingParticipants(participantsResult.value || [])
                : [];
            setTopParticipants(participantRows);
            setParticipantLoading(false);

            const unitRows = unitsResult.status === "fulfilled"
                ? normalizeUnitRankings(unitsResult.value || [])
                : [];

            if (unitRows.length) {
                setTopUnits(unitRows);
                setUnitLoading(false);
                return;
            }

            try {
                const allUnits = await getDonVi({
                    page: 1,
                    size: 1000,
                    sortField: "ten",
                    sortType: "asc",
                });

                if (!active) {
                    return;
                }

                setTopUnits(normalizeAlphabetUnits(allUnits?.data || []));
            } catch {
                if (active) {
                    setTopUnits([]);
                }
            } finally {
                if (active) {
                    setUnitLoading(false);
                }
            }
        };

        void loadRankings();

        return () => {
            active = false;
        };
    }, [dotThi?.cuoc_thi_id]);

    useEffect(() => {
        if (!countdown?.dem_nguoc) {
            return undefined;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (!prev) {
                    return prev;
                }

                let nextThang = prev.thang ?? 0;
                let nextTuan = prev.tuan ?? 0;
                let nextNgay = prev.ngay ?? 0;
                let nextGio = prev.gio ?? 0;
                let nextPhut = prev.phut ?? 0;
                let nextGiay = prev.giay ?? 0;

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
            setShowFloatingCta(window.scrollY > (isMobileViewport ? 280 : 360));
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
        <div className="relative w-full overflow-x-hidden bg-[#fffaf5]">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                {parallaxLayers.map((layer) => (
                    <div
                        key={layer.key}
                        className="demo4-parallax-layer"
                        style={{
                            top: layer.top,
                            left: layer.left,
                            right: layer.right,
                            width: layer.width,
                            height: layer.height,
                            opacity: isMobileViewport ? layer.mobileOpacity : layer.opacity,
                            transform: `translate3d(0, ${Math.round(scrollY * layer.speed)}px, 0)`,
                            backgroundImage: `
                                linear-gradient(180deg, rgba(255, 250, 245, 0.16) 0%, rgba(255, 250, 245, 0.34) 100%),
                                url(${layer.src})
                            `,
                        }}
                    />
                ))}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(180deg, rgba(255, 250, 245, 0) 0%, rgba(255, 250, 245, 0.1) 28%, rgba(255, 250, 245, 0.24) 62%, rgba(255, 250, 245, 0.42) 100%)`,
                    }}
                />
            </div>

            <div className="relative z-10">
            <PublicPageBanner
                image={image}
                zoom={zoom}
                positionX={bannerPositionX}
                positionY={bannerPositionY}
                isMobileViewport={isMobileViewport}
            />

            <div className="w-full px-2 py-6 sm:px-3 lg:px-4 xl:px-20">
                <Row gutter={[20, 20]} align="stretch">
                    <Col xs={24} xl={8} className="order-3 xl:order-1">
                        <Reveal delay={80} className="h-full">
                            <RankingColumn
                                title="Top 20 người tham gia"
                                icon={<UserOutlined />}
                                items={topParticipants}
                                colorPrimary={colorPrimary}
                                deepPrimary={deepPrimary}
                                loading={participantLoading}
                                emptyText="Chưa có người tham gia"
                            />
                        </Reveal>
                    </Col>

                    <Col xs={24} xl={8} className="order-1 xl:order-2">
                        <Reveal delay={110} className="h-full">
                            <Card
                                className="h-full overflow-hidden rounded-[32px] border shadow-[0_26px_56px_rgba(127,29,29,0.14)]"
                                style={{borderColor: alphaColor(colorPrimary, 0.16)}}
                                styles={{body: {padding: 0, height: "100%"}}}
                            >
                                <div
                                    className="flex h-full flex-col px-5 py-6 text-center md:px-7 md:py-8"
                                    style={{
                                        background: rankingHeaderBackground,
                                    }}
                                >
                                    <div className="flex h-full flex-col justify-around gap-6">
                                        <div className="mx-auto grid max-w-[540px] grid-cols-2 gap-3 md:grid-cols-4">
                                        {countdownCards.map((item, index) => (
                                            <Reveal key={item.label} delay={140 + (index * 40)}>
                                                <div
                                                    className="rounded-[14px] border bg-white px-3 py-5 text-center shadow-[0_4px_14px_rgba(185,28,28,0.08)]"
                                                    style={{borderColor: "rgba(248, 200, 200, 0.9)"}}
                                                >
                                                    <Statistic
                                                        value={item.value}
                                                        styles={{
                                                            content: {
                                                                color: "#ff1f1f",
                                                                fontWeight: 900,
                                                                fontSize: 42,
                                                                lineHeight: 1,
                                                            },
                                                        }}
                                                    />
                                                    <Text className="!mt-2 !block !text-[12px] !font-semibold !uppercase !tracking-[0.22em] !text-slate-500">
                                                        {item.label}
                                                    </Text>
                                                </div>
                                            </Reveal>
                                        ))}
                                        </div>

                                        <div className="flex justify-center">
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
                                                    icon={<ArrowRightOutlined />}
                                                    onClick={handleJoinExam}
                                                    className="join-exam-pulse__button !h-14 !rounded-2xl !border-0 !px-8 !text-lg !font-bold sm:!min-w-[15rem]"
                                                >
                                                    THAM GIA THI
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <QRCode
                                                value={qrValue || " "}
                                                size={104}
                                                bordered={false}
                                                color={colorPrimary}
                                                bgColor="transparent"
                                            />
                                        </div>

                                        <div className="text-center">
                                            <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-1">
                                                <Text className="!mb-0 !pb-1 !text-lg !font-semibold !uppercase !text-slate-700 md:!text-xl">
                                                    Đã có
                                                </Text>
                                                <span className="text-5xl font-bold leading-none md:text-6xl" style={{color: colorPrimary}}>
                                                    {Intl.NumberFormat("vi-VN").format(tongLuotThi)}
                                                </span>
                                                <span className="pb-1 text-lg font-semibold uppercase text-slate-700 md:text-xl">
                                                    lượt thi
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Reveal>
                    </Col>

                    <Col xs={24} xl={8} className="order-2 xl:order-3">
                        <Reveal delay={140} className="h-full">
                            <RankingColumn
                                title="Top đơn vị điểm cao"
                                icon={<TrophyFilled />}
                                items={topUnits}
                                colorPrimary={colorPrimary}
                                deepPrimary={deepPrimary}
                                loading={unitLoading}
                                emptyText="Chưa có dữ liệu đơn vị"
                            />
                        </Reveal>
                    </Col>
                </Row>

                <div className="mt-8 space-y-8">
                    <Reveal delay={170}>
                        <div
                            className="rounded-[32px] border bg-white p-5 shadow-[0_22px_48px_rgba(15,23,42,0.08)] md:p-6"
                            style={{borderColor: alphaColor(colorPrimary, 0.12)}}
                        >
                            <PublicContestTimeline items={timelineItems} colorPrimary={colorPrimary} />
                        </div>
                    </Reveal>

                    <Reveal delay={190}>
                        <section className="space-y-4">
                            <Title level={2} className="!mb-0 !text-3xl !font-black" style={{color: colorPrimary}}>
                                Cơ cấu giải thưởng
                            </Title>
                            <GiaiThuongCuocThi />
                        </section>
                    </Reveal>

                    <Reveal delay={210}>
                        <section className="space-y-4">
                            <Title level={2} className="!mb-0 !text-3xl !font-black" style={{color: colorPrimary}}>
                                Tài liệu
                            </Title>
                            <TaiLieuTongHop />
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
                        className="!h-13 !rounded-full !border-0 !px-6 !text-sm !font-black md:!text-base"
                        style={{
                            background: colorPrimary,
                            color: "#ffffff",
                            boxShadow: `0 18px 36px ${alphaColor(colorPrimary, 0.28)}`,
                        }}
                    >
                        Tham gia thi
                    </Button>
                </div>
            ) : null}

            <style>{`
                .demo4-parallax-layer {
                    position: absolute;
                    border-radius: 44px;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                    filter: saturate(1) contrast(1.02);
                    will-change: transform;
                    box-shadow: 0 30px 80px rgba(148, 163, 184, 0.14);
                }

                .join-exam-pulse {
                    isolation: isolate;
                }

                .join-exam-pulse__button {
                    position: relative;
                    z-index: 2;
                    animation: join-exam-heartbeat 2.8s ease-in-out infinite;
                    box-shadow:
                        0 0 0 1px ${alphaColor(colorPrimary, 0.1)},
                        0 0 22px ${alphaColor(colorPrimary, 0.22)},
                        0 0 42px ${alphaColor(colorPrimary, 0.16)};
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

                .demo4-scroll::-webkit-scrollbar {
                    width: 8px;
                }

                .demo4-scroll::-webkit-scrollbar-thumb {
                    background: rgba(185, 28, 28, 0.28);
                    border-radius: 999px;
                }

                .demo4-scroll::-webkit-scrollbar-track {
                    background: rgba(248, 250, 252, 0.92);
                    border-radius: 999px;
                }

                @media (max-width: 767px) {
                    .demo4-parallax-layer {
                        width: 84vw !important;
                        height: 24vh !important;
                        border-radius: 28px;
                    }
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
