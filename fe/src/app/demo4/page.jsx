'use client';

import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import dayjs from "dayjs";
import {ArrowRightOutlined, ClockCircleFilled, SwapOutlined, TrophyFilled, UserOutlined} from "@ant-design/icons";
import {Button, Card, Col, Empty, QRCode, Row, Spin, Statistic, Typography, theme} from "antd";
import {useRouter} from "next/navigation";

import {layCauHinh} from "~/services/cau-hinh";
import {layCuocThi, layLuotThiHienTai} from "~/services/thi/cuoc-thi";
import {layDotThi} from "~/services/thi/dot-thi";
import {layBangXepHangCongKhai, xepHangDonViTheoDotThi, xepHangTracNghiemTheoDotThi} from "~/services/thi/thi";
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
const DEMO4_BACKGROUND_IMAGES = {
    cantho: "/bg_cantho.jpg",
    soctrang: "/bg_soctrang.jpg",
    haugiang: "/bg_haugiang.jpg",
};
const LIVE_DATA_REFRESH_MS = 120 * 1000;
const RESIZE_DEBOUNCE_MS = 180;
const UNIT_RANKING_FETCH_LIMIT = 1000;

async function loadUnitRankingsForCurrentRound(dotThiId) {
    try {
        return await xepHangDonViTheoDotThi(dotThiId, UNIT_RANKING_FETCH_LIMIT);
    } catch {
        return xepHangDonViTheoDotThi(dotThiId);
    }
}
function chonCuocThiGanNhat(dsCuocThi = []) {
    const now = dayjs();
    const dsHopLe = [...dsCuocThi]
        .filter((item) => item?.trang_thai);

    const dsDangDienRa = dsHopLe.filter((item) => {
        const batDau = dayjs(item.thoi_gian_bat_dau);
        const ketThuc = dayjs(item.thoi_gian_ket_thuc);

        return batDau.isValid()
            && ketThuc.isValid()
            && !batDau.isAfter(now)
            && !ketThuc.isBefore(now);
    });

    if (dsDangDienRa.length) {
        return dsDangDienRa.sort(
            (a, b) => dayjs(b.thoi_gian_bat_dau).valueOf() - dayjs(a.thoi_gian_bat_dau).valueOf()
        )[0];
    }

    const dsDaKetThuc = dsHopLe.filter((item) => {
        const ketThuc = dayjs(item.thoi_gian_ket_thuc);
        return ketThuc.isValid() && ketThuc.isBefore(now);
    });

    if (dsDaKetThuc.length) {
        return dsDaKetThuc.sort(
            (a, b) => dayjs(b.thoi_gian_ket_thuc).valueOf() - dayjs(a.thoi_gian_ket_thuc).valueOf()
        )[0];
    }

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

    const dangDienRa = dsDotThi.find((item) => {
        const batDau = dayjs(item.thoi_gian_bat_dau);
        const ketThuc = dayjs(item.thoi_gian_ket_thuc);
        return !batDau.isAfter(now) && !ketThuc.isBefore(now);
    });

    if (dangDienRa) {
        return dangDienRa;
    }

    const dsDaKetThuc =
        dsDotThi.filter((item) => dayjs(item.thoi_gian_ket_thuc).isBefore(now));

    if (dsDaKetThuc.length) {
        return [...dsDaKetThuc].sort(
            (a, b) => dayjs(b.thoi_gian_ket_thuc).valueOf() - dayjs(a.thoi_gian_ket_thuc).valueOf()
        )[0];
    }

    const dsSapDienRa =
        dsDotThi.filter((item) => dayjs(item.thoi_gian_bat_dau).isAfter(now));

    if (dsSapDienRa.length) {
        return [...dsSapDienRa].sort(
            (a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf()
        )[0];
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

function timDotThiSapDienRaKeTiep(dsDotThi = [], now = dayjs()) {
    return dsDotThi
        .filter((item) => dayjs(item.thoi_gian_bat_dau).isAfter(now))
        .sort((a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf())[0] || null;
}

function taoThongTinDemNguoc(dotThi, cuocThi) {
    const now = dayjs();
    const batDau = dayjs(dotThi?.thoi_gian_bat_dau || cuocThi?.thoi_gian_bat_dau);
    const ketThuc = dayjs(dotThi?.thoi_gian_ket_thuc || cuocThi?.thoi_gian_ket_thuc);

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
        moc_thoi_gian: batDau.isAfter(now) ? "bat_dau" : "ket_thuc",
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
    return rows
        .map((item, index) => ({
            id: item?.donViId || item?.don_vi_id || item?.id || index,
            tenDonVi: getTenDonVi(item),
            diem: Number(item?.soLuongThiSinh ?? item?.so_luong_thi_sinh ?? 0),
        }))
        .sort(compareUnitRankingItem);
}

function normalizeParticipantUnitRankings(rows = []) {
    return rows
        .map((item, index) => ({
            id: item?.id || item?.donViId || item?.don_vi_id || index,
            tenDonVi: getTenDonVi(item),
            diem: Number(item?.so_nguoi_tham_gia ?? item?.soNguoiThamGia ?? 0),
        }))
        .sort(compareUnitRankingItem);
}

function mergeUnitRankings(allUnits = [], rankingRows = []) {
    const rankingMap = new Map(
        rankingRows.map((item) => [
            Number(item?.id),
            Number(item?.diem ?? 0),
        ])
    );

    return [...allUnits]
        .map((item, index) => ({
            id: item?.id || index,
            tenDonVi: item?.ten || "-",
            diem: rankingMap.get(Number(item?.id)) ?? 0,
        }))
        .sort(compareUnitRankingItem);
}

function compareUnitRankingItem(a, b) {
    const byDiem = Number(b?.diem || 0) - Number(a?.diem || 0);

    if (byDiem !== 0) {
        return byDiem;
    }

    return String(a?.tenDonVi || "").localeCompare(String(b?.tenDonVi || ""), "vi", {
        sensitivity: "base",
    });
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

function AnimatedNumber({
    value,
    duration = 900,
    formatter = (nextValue) => Intl.NumberFormat("vi-VN").format(nextValue),
    className = "",
    style,
}) {
    const [displayValue, setDisplayValue] = useState(Number(value || 0));
    const previousValueRef = useRef(Number(value || 0));

    useEffect(() => {
        const nextValue = Number(value || 0);
        const startValue = previousValueRef.current;

        if (startValue === nextValue) {
            setDisplayValue(nextValue);
            return undefined;
        }

        let frameId = 0;
        const startedAt = performance.now();

        const tick = (currentTime) => {
            const progress = Math.min((currentTime - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const animatedValue = Math.round(startValue + ((nextValue - startValue) * eased));

            setDisplayValue(animatedValue);

            if (progress < 1) {
                frameId = window.requestAnimationFrame(tick);
                return;
            }

            previousValueRef.current = nextValue;
        };

        frameId = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frameId);
            previousValueRef.current = nextValue;
        };
    }, [duration, value]);

    return (
        <span className={className} style={style}>
            {formatter(displayValue)}
        </span>
    );
}

const DEMO4_HEADER_CLASS =
    "flex min-h-[64px] items-center justify-between gap-3 px-5 py-4";

const DEMO4_HEADER_TEXT_CLASS =
    "flex min-w-0 items-center gap-3 text-sm font-black uppercase tracking-[0.18em] leading-[1.2]";

function Demo4CardHeader({
    title,
    icon,
    background,
    color,
    onClick = null,
    titleHint = "",
    trailing = null,
    centered = false,
}) {
    const content = (
        <>
            <span className={DEMO4_HEADER_TEXT_CLASS}>
                <span className="shrink-0">{icon}</span>
                <span className="truncate">{title}</span>
            </span>
            {trailing ? (
                <span className="shrink-0">{trailing}</span>
            ) : null}
        </>
    );

    const className = centered
        ? `${DEMO4_HEADER_CLASS} justify-center`
        : DEMO4_HEADER_CLASS;

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${className} m-0 w-full border-0 text-left transition-opacity hover:opacity-95`}
                style={{
                    background,
                    color,
                    fontFamily: "inherit",
                    appearance: "none",
                }}
                title={titleHint}
            >
                {content}
            </button>
        );
    }

    return (
        <div
            className={className}
            style={{
                background,
                color,
            }}
        >
            {content}
        </div>
    );
}

function RankingColumn({
    title,
    icon,
    items,
    colorPrimary,
    deepPrimary,
    emptyText,
    loading = false,
    onTitleClick = null,
    titleHint = "",
}) {
    const headerBackground = `linear-gradient(135deg, ${alphaColor(colorPrimary, 0.18)} 0%, ${alphaColor(colorPrimary, 0.32)} 100%)`;
    const itemRefs = useRef(new Map());
    const previousPositionsRef = useRef(new Map());
    const previousIndexMapRef = useRef(new Map());

    useLayoutEffect(() => {
        items.forEach((item, index) => {
            const element = itemRefs.current.get(item.id);

            if (!element) {
                return;
            }

            const previousIndex = previousIndexMapRef.current.get(item.id);
            const currentTop = element.getBoundingClientRect().top;
            const previousTop = previousPositionsRef.current.get(item.id);

            if (previousIndex != null && previousIndex !== index && previousTop != null) {
                const deltaY = previousTop - currentTop;

                if (Math.abs(deltaY) > 1) {
                    element.style.transition = "none";
                    element.style.transform = `translateY(${deltaY}px)`;

                    window.requestAnimationFrame(() => {
                        element.style.transition = "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)";
                        element.style.transform = "translateY(0)";
                    });
                }
            }
        });

        previousPositionsRef.current = new Map(
            items.map((item) => [
                item.id,
                itemRefs.current.get(item.id)?.getBoundingClientRect().top,
            ])
        );
        previousIndexMapRef.current = new Map(
            items.map((item, index) => [item.id, index])
        );
    }, [items]);

    return (
        <Card
            className="h-full overflow-hidden rounded-[30px] border shadow-[0_20px_44px_rgba(15,23,42,0.08)]"
            style={{borderColor: alphaColor(colorPrimary, 0.14)}}
            styles={{body: {padding: 0, height: "100%"}}}
        >
            <div className="flex h-full flex-col bg-white">
                <Demo4CardHeader
                    title={title}
                    icon={icon}
                    background={headerBackground}
                    color={deepPrimary}
                    onClick={onTitleClick}
                    titleHint={titleHint}
                    trailing={onTitleClick ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#efb5b5] bg-white/70 text-xs transition-colors">
                            <SwapOutlined />
                        </span>
                    ) : null}
                />

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
                            ref={(node) => {
                                if (node) {
                                    itemRefs.current.set(item.id, node);
                                    return;
                                }

                                itemRefs.current.delete(item.id);
                            }}
                            className="rounded-[24px] border px-4 py-4"
                            style={{
                                borderColor: alphaColor(colorPrimary, 0.1),
                                background: "linear-gradient(180deg, #ffffff 0%, #fff7f2 100%)",
                                transition: "border-color 320ms ease, background 320ms ease, box-shadow 320ms ease",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black"
                                    style={{
                                        background: "#f8fafc",
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
                                    <div className="text-2xl font-black leading-none" style={{color: colorPrimary, fontVariantNumeric: "tabular-nums"}}>
                                        {item.diem == null ? "-" : (
                                            <AnimatedNumber value={item.diem} />
                                        )}
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
    const [activeBackground, setActiveBackground] = useState("cantho");
    const [scrollY, setScrollY] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [dotThi, setDotThi] = useState(null);
    const [dsDotThi, setDsDotThi] = useState([]);
    const [tongLuotThi, setTongLuotThi] = useState(0);
    const [topUnits, setTopUnits] = useState([]);
    const [topUnitsByParticipants, setTopUnitsByParticipants] = useState([]);
    const [topParticipants, setTopParticipants] = useState([]);
    const [unitLoading, setUnitLoading] = useState(true);
    const [participantLoading, setParticipantLoading] = useState(true);
    const [unitRankingMode, setUnitRankingMode] = useState("luot-thi");

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const deepPrimary = darkenColor(colorPrimary, 0.12);
    const rankingHeaderBackground = `linear-gradient(135deg, ${alphaColor(colorPrimary, 0.18)} 0%, ${alphaColor(colorPrimary, 0.32)} 100%)`;
    const timelineSectionRef = useRef(null);
    const giaiTapTheSectionRef = useRef(null);
    const topUnitsRef = useRef([]);
    const topUnitsByParticipantsRef = useRef([]);
    const topParticipantsRef = useRef([]);
    const bannerViewportModeRef = useRef(null);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const timelineItems = useMemo(
        () => buildTimelineStages(dsDotThi, dotThi?.id),
        [dotThi?.id, dsDotThi]
    );
    const countdownCards = useMemo(() => buildCountdownCards(countdown), [countdown]);
    const upcomingDotThi = useMemo(
        () => timDotThiSapDienRaKeTiep(dsDotThi),
        [dsDotThi]
    );
    const dotThiStatusText = useMemo(() => {
        if (!dotThi?.ten) {
            return "Cuộc thi sắp diễn ra";
        }

        const daKetThucDotThiDaiDien =
            dotThi?.thoi_gian_ket_thuc
                ? dayjs(dotThi.thoi_gian_ket_thuc).isBefore(dayjs())
                : false;
        const dotThiHienThi =
            daKetThucDotThiDaiDien && upcomingDotThi
                ? upcomingDotThi
                : dotThi;
        const nhanTrangThai = dayjs(dotThiHienThi?.thoi_gian_bat_dau).isAfter(dayjs())
            ? "Sắp bắt đầu"
            : "Đang diễn ra";

        return `${dotThiHienThi.ten}: ${nhanTrangThai}`;
    }, [dotThi, upcomingDotThi]);
    const qrValue = typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "";

    useEffect(() => {
        topUnitsRef.current = topUnits;
    }, [topUnits]);

    useEffect(() => {
        topUnitsByParticipantsRef.current = topUnitsByParticipants;
    }, [topUnitsByParticipants]);

    useEffect(() => {
        topParticipantsRef.current = topParticipants;
    }, [topParticipants]);

    useEffect(() => {
        let active = true;

        const getViewportMode = () => (window.innerWidth < 768 ? "mobile" : "desktop");
        const getKhoa = (mode = getViewportMode()) => (mode === "mobile" ? "banner_mobile" : "banner_desktop");

        const loadBanner = async (forcedMode) => {
            const viewportMode = forcedMode || getViewportMode();
            const mobile = viewportMode === "mobile";

            if (active) {
                setIsMobileViewport(mobile);
            }

            try {
                const res = await layCauHinh(getKhoa(viewportMode));
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

            bannerViewportModeRef.current = viewportMode;
        };

        const handleResize = () => {
            const nextMode = getViewportMode();

            if (active) {
                setIsMobileViewport(nextMode === "mobile");
            }

            if (bannerViewportModeRef.current === nextMode) {
                return;
            }

            window.clearTimeout(handleResize.timeoutId);
            handleResize.timeoutId = window.setTimeout(() => {
                if (!active) {
                    return;
                }

                const confirmedMode = getViewportMode();

                if (bannerViewportModeRef.current === confirmedMode) {
                    return;
                }

                void loadBanner(confirmedMode);
            }, RESIZE_DEBOUNCE_MS);
        };
        handleResize.timeoutId = null;

        void loadBanner();
        window.addEventListener("resize", handleResize);

        return () => {
            active = false;
            window.clearTimeout(handleResize.timeoutId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        let active = true;
        let timeoutId = null;

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
                    const dotThiDemNguoc =
                        dayjs(selectedDotThi?.thoi_gian_ket_thuc).isBefore(dayjs()) && timDotThiSapDienRaKeTiep(danhSachDotThi)
                            ? timDotThiSapDienRaKeTiep(danhSachDotThi)
                            : selectedDotThi;
                    setCountdown(taoThongTinDemNguoc(dotThiDemNguoc, selectedCuocThi));
                }
            } catch {
                if (active) {
                    setDotThi(null);
                    setDsDotThi([]);
                    setCountdown(null);
                    setTongLuotThi(0);
                }
            } finally {
                if (active) {
                    timeoutId = window.setTimeout(() => {
                        void load();
                    }, LIVE_DATA_REFRESH_MS);
                }
            }
        };

        void load();

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        let active = true;
        let timeoutId = null;

        const loadRankings = async () => {
            if (!dotThi?.id) {
                if (active) {
                    setTopParticipants([]);
                    setTopUnits([]);
                    setTopUnitsByParticipants([]);
                    setParticipantLoading(false);
                    setUnitLoading(false);
                }
                return;
            }

            if (!topParticipantsRef.current.length) {
                setParticipantLoading(true);
            }

            if (!topUnitsRef.current.length) {
                setUnitLoading(true);
            }

            const [participantsResult, allUnitsResult, publicRankingsResult] = await Promise.allSettled([
                xepHangTracNghiemTheoDotThi(dotThi.id, 20),
                getDonVi({
                    page: 1,
                    size: 1000,
                    sortField: "id",
                    sortType: "asc",
                }),
                layBangXepHangCongKhai({
                    dotThiId: dotThi.id,
                    cuocThiId: dotThi.cuoc_thi_id,
                    rankingTop: 20,
                    honorTop: UNIT_RANKING_FETCH_LIMIT,
                }),
            ]);

            if (!active) {
                return;
            }

            const participantRows = participantsResult.status === "fulfilled"
                ? normalizeRankingParticipants(participantsResult.value || [])
                : [];
            setTopParticipants(participantRows);
            setParticipantLoading(false);

            const allUnits = allUnitsResult.status === "fulfilled"
                ? allUnitsResult.value?.data || []
                : [];
            const publicHonorBoard =
                publicRankingsResult.status === "fulfilled"
                    ? publicRankingsResult.value?.honorBoard?.["dot-thi"] || null
                    : null;
            const publicAttemptRows =
                publicHonorBoard?.["luot-thi"] || null;
            const publicParticipantRows =
                publicHonorBoard?.["nguoi-tham-gia"] || null;
            const [unitsResult] = await Promise.all([
                publicAttemptRows
                    ? Promise.resolve({status: "fulfilled", value: publicAttemptRows})
                    : loadUnitRankingsForCurrentRound(dotThi.id)
                        .then((data) => ({status: "fulfilled", value: data}))
                        .catch(() => ({status: "rejected"})),
            ]);

            if (!active) {
                return;
            }

            if (unitsResult.status === "fulfilled") {
                const unitRows = normalizeUnitRankings(unitsResult.value || []);

                setTopUnits(
                    allUnits.length
                        ? mergeUnitRankings(allUnits, unitRows)
                        : unitRows
                );
            } else if (!topUnitsRef.current.length) {
                setTopUnits([]);
            }

            if (Array.isArray(publicParticipantRows)) {
                const participantUnitRows = normalizeParticipantUnitRankings(publicParticipantRows || []);

                setTopUnitsByParticipants(
                    allUnits.length
                        ? mergeUnitRankings(allUnits, participantUnitRows)
                        : participantUnitRows
                );
            } else if (!topUnitsByParticipantsRef.current.length) {
                setTopUnitsByParticipants([]);
            }

            setUnitLoading(false);

            if (active) {
                timeoutId = window.setTimeout(() => {
                    void loadRankings();
                }, LIVE_DATA_REFRESH_MS);
            }
        };

        void loadRankings();

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
        };
    }, [dotThi?.cuoc_thi_id, dotThi?.id]);

    useEffect(() => {
        const cuocThi = dotThi?.cuoc_thi;

        if (!cuocThi) {
            return undefined;
        }

        const capNhatDemNguoc = () => {
            const dotThiMoi = taoDotThiTheoCuocThi(cuocThi, dsDotThi);
            const dotThiDemNguoc =
                dayjs(dotThiMoi?.thoi_gian_ket_thuc).isBefore(dayjs()) && timDotThiSapDienRaKeTiep(dsDotThi)
                    ? timDotThiSapDienRaKeTiep(dsDotThi)
                    : dotThiMoi;
            const countdownMoi = taoThongTinDemNguoc(dotThiDemNguoc, cuocThi);

            setDotThi((prev) => {
                if (
                    prev?.id === dotThiMoi?.id &&
                    prev?.la_sap_dien_ra === dotThiMoi?.la_sap_dien_ra &&
                    prev?.thoi_gian_bat_dau === dotThiMoi?.thoi_gian_bat_dau &&
                    prev?.thoi_gian_ket_thuc === dotThiMoi?.thoi_gian_ket_thuc
                ) {
                    return prev;
                }

                return dotThiMoi;
            });
            setCountdown(countdownMoi);
        };

        capNhatDemNguoc();
        const timer = setInterval(capNhatDemNguoc, 1000);

        return () => clearInterval(timer);
    }, [dotThi?.cuoc_thi, dsDotThi]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setShowFloatingCta(window.scrollY > (isMobileViewport ? 280 : 360));

            const threshold = 0;
            const timelineTop = timelineSectionRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
            const giaiTapTheTop = giaiTapTheSectionRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;

            if (giaiTapTheTop <= threshold) {
                setActiveBackground("haugiang");
                return;
            }

            if (timelineTop <= threshold) {
                setActiveBackground("soctrang");
                return;
            }

            setActiveBackground("cantho");
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

    const unitRankingTitle = unitRankingMode === "luot-thi"
        ? "Đơn vị có nhiều lượt thi"
        : "Đơn vị nhiều người tham gia";
    const displayedUnitItems = unitRankingMode === "luot-thi"
        ? topUnits
        : topUnitsByParticipants;

    if (!canRender) {
        return null;
    }

    return (
        <div
            className="relative w-full bg-[#fffaf5]"
            style={{overflowX: "hidden", overflowY: "clip"}}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{overflow: "clip", contain: "paint"}}
            >
                {Object.entries(DEMO4_BACKGROUND_IMAGES).map(([key, src]) => (
                    <div
                        key={key}
                        className={`demo4-background-layer ${activeBackground === key ? "is-active" : ""}`}
                        style={{
                            transform: `translate3d(0, ${Math.round(scrollY * -0.08)}px, 0) scale(1.08)`,
                            backgroundImage: `
                                linear-gradient(180deg, rgba(255, 250, 245, 0.16) 0%, rgba(255, 250, 245, 0.28) 28%, rgba(255, 250, 245, 0.42) 64%, rgba(255, 250, 245, 0.56) 100%),
                                url(${src})
                            `,
                        }}
                    />
                ))}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(180deg, rgba(255, 250, 245, 0.04) 0%, rgba(255, 250, 245, 0.08) 22%, rgba(255, 250, 245, 0.16) 58%, rgba(255, 250, 245, 0.24) 100%)`,
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
                                title="Top thí sinh dẫn đầu"
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
                                <div className="flex h-full flex-col">
                                    <Demo4CardHeader
                                        title={dotThiStatusText}
                                        icon={<ClockCircleFilled />}
                                        background={alphaColor(colorPrimary, 0.32)}
                                        color={deepPrimary}
                                        centered
                                    />

                                    <div
                                        className="flex h-full flex-col px-5 py-6 text-center md:px-2! md:py-8"
                                        style={{
                                            background: alphaColor(colorPrimary, 0.12),
                                        }}
                                    >
                                    <div className="flex h-full flex-col justify-around gap-6">
                                        
                                        <div className="mx-auto grid max-w-[540px] grid-cols-4 gap-3 md:grid-cols-4">
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
                                                <AnimatedNumber
                                                    value={tongLuotThi}
                                                    className="text-5xl font-bold leading-none md:text-6xl"
                                                    style={{color: colorPrimary, fontVariantNumeric: "tabular-nums"}}
                                                />
                                                <span className="pb-1 text-lg font-semibold uppercase text-slate-700 md:text-xl">
                                                    lượt thi
                                                </span>
                                            </div>
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
                                title={unitRankingTitle}
                                icon={<TrophyFilled />}
                                items={displayedUnitItems}
                                colorPrimary={colorPrimary}
                                deepPrimary={deepPrimary}
                                loading={unitLoading}
                                emptyText="Chưa có dữ liệu đơn vị"
                                onTitleClick={() => {
                                    setUnitRankingMode((current) => (
                                        current === "luot-thi" ? "nguoi-tham-gia" : "luot-thi"
                                    ));
                                }}
                                titleHint={
                                    unitRankingMode === "luot-thi"
                                        ? "Chuyển sang xếp hạng đơn vị có nhiều người tham gia"
                                        : "Chuyển về xếp hạng đơn vị có nhiều lượt thi"
                                }
                            />
                        </Reveal>
                    </Col>
                </Row>

                <div className="mt-8 space-y-8">
                    <Reveal delay={170}>
                        <div
                            ref={timelineSectionRef}
                            className="rounded-[32px] border bg-white p-5 shadow-[0_22px_48px_rgba(15,23,42,0.08)] md:p-6"
                            style={{borderColor: alphaColor(colorPrimary, 0.12)}}
                        >
                            <PublicContestTimeline
                                items={timelineItems}
                                colorPrimary={colorPrimary}
                                onItemClick={handleJoinExam}
                            />
                        </div>
                    </Reveal>

                    <Reveal delay={190}>
                        <section className="space-y-4">
                            <Title level={2} className="!mb-0 !text-3xl !font-black" style={{color: colorPrimary}}>
                                Cơ cấu giải thưởng
                            </Title>
                            <GiaiThuongCuocThi giaiTapTheRef={giaiTapTheSectionRef} />
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
                    <div className="floating-join-pulse relative inline-flex items-center justify-center">
                        <span
                            className="floating-join-pulse__ring floating-join-pulse__ring--outer"
                            style={{"--floating-pulse-color": alphaColor("#ef4444", 0.26)}}
                        />
                        <span
                            className="floating-join-pulse__ring floating-join-pulse__ring--inner"
                            style={{"--floating-pulse-color": alphaColor("#ef4444", 0.38)}}
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleJoinExam}
                            icon={<ArrowRightOutlined />}
                            className="floating-join-pulse__button !h-13 !rounded-full !border-0 !px-6 !text-sm !font-black md:!text-base"
                            style={{
                                background: "#ffffff",
                                borderColor: "#ffffff",
                                color: "#ef4444",
                            }}
                        >
                            Tham gia thi
                        </Button>
                    </div>
                </div>
            ) : null}

            <style>{`
                .demo4-background-layer {
                    position: absolute;
                    inset: -8vh -4vw;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                    contain: paint;
                    backface-visibility: hidden;
                    opacity: 0;
                    transition: opacity 0.55s ease, transform 0.25s linear;
                    will-change: opacity, transform;
                    image-rendering: auto;
                }

                .demo4-background-layer.is-active {
                    opacity: 1;
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

                .floating-join-pulse {
                    isolation: isolate;
                }

                .floating-join-pulse__button {
                    position: relative;
                    z-index: 2;
                    animation: floating-join-heartbeat 1.55s ease-in-out infinite;
                    box-shadow:
                        0 0 0 1px ${alphaColor("#ef4444", 0.18)},
                        0 0 0 4px ${alphaColor("#ffffff", 0.4)},
                        0 0 24px ${alphaColor("#ef4444", 0.34)},
                        0 0 54px ${alphaColor("#ef4444", 0.3)},
                        0 16px 30px ${alphaColor("#991b1b", 0.24)};
                }

                .floating-join-pulse__ring {
                    position: absolute;
                    inset: -3px;
                    border-radius: 999px;
                    background: var(--floating-pulse-color);
                    z-index: 1;
                    pointer-events: none;
                    transform-origin: center;
                    filter: blur(3px);
                }

                .floating-join-pulse__ring--inner {
                    animation: floating-join-wave-inner 1.55s ease-out infinite;
                }

                .floating-join-pulse__ring--outer {
                    animation: floating-join-wave-outer 1.55s ease-out infinite 0.24s;
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

                @keyframes floating-join-heartbeat {
                    0%, 100% {
                        transform: scale(1);
                    }
                    16% {
                        transform: scale(1.06);
                    }
                    30% {
                        transform: scale(0.985);
                    }
                    46% {
                        transform: scale(1.08);
                    }
                    62% {
                        transform: scale(0.992);
                    }
                }

                @keyframes floating-join-wave-inner {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    18% {
                        opacity: 0.62;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.38);
                    }
                }

                @keyframes floating-join-wave-outer {
                    0% {
                        opacity: 0;
                        transform: scale(0.98);
                    }
                    22% {
                        opacity: 0.42;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.62);
                    }
                }
            `}</style>
        </div>
    );
}
