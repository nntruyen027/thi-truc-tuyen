'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useRef, useState} from "react";
import {layDotThi} from "~/services/thi/dot-thi";
import {Col, Row, Spin, Typography, theme} from "antd";
import {layCuocThi, layLuotThiHienTai} from "~/services/thi/cuoc-thi";
import {useRouter} from "next/navigation";
import KetQuaCongBo from "~/app/(public)/KetQuaCongBo";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {darkenColor, parseMediaConfig} from "~/utils/workspaceTheme";
import TaiLieuTongHop from "~/app/(public)/TaiLieuTongHop";
import GiaiThuongCuocThi from "~/app/(public)/GiaiThuongCuocThi";
import {
    buildTimelineStages,
    formatLongVietnameseDate,
    SO_LUOT_THI_MUC_TIEU_MARKETING,
    SO_LUOT_THI_OFFSET_MARKETING,
    tabItems,
} from "~/app/(public)/page.config";
import PublicPageBanner from "~/app/(public)/components/PublicPageBanner";
import PublicPageTicker from "~/app/(public)/components/PublicPageTicker";
import PublicContestOverview from "~/app/(public)/components/PublicContestOverview";
import PublicContestTimeline from "~/app/(public)/components/PublicContestTimeline";
import PublicPageSectionDivider from "~/app/(public)/components/PublicPageSectionDivider";
import dayjs from "dayjs";
import Demo1Page from "~/app/demo1/page";
import Demo2Page from "~/app/demo2/page";
import Demo3Page from "~/app/demo3/page";
import Demo4Page from "~/app/demo4/page";
import {layCauHinhTrangChu} from "~/services/trang-chu";

const {Text} = Typography;

function tinhTongLuotThiHienThi(tongLuotThiThucTe = 0) {
    return Number(tongLuotThiThucTe || 0) + SO_LUOT_THI_OFFSET_MARKETING;
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

    const dangDienRa =
        dsDotThi.find((item) => {
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
        const laSapDienRa = dayjs(cuocThi.thoi_gian_bat_dau).isAfter(dayjs());

        return {
            id: null,
            cuoc_thi_id: cuocThi.id,
            ten: "",
            mo_ta: "",
            thoi_gian_thi: null,
            la_sap_dien_ra: laSapDienRa,
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

function taoThongTinDemNguoc(dotThi, cuocThi, dsDotThi = []) {
    if (!cuocThi && !dotThi) {
        return null;
    }

    const now = dayjs();
    const dotThiSapDienRaKeTiep = timDotThiSapDienRaKeTiep(dsDotThi, now);
    const dotThiKetThuc = dotThi?.thoi_gian_ket_thuc
        ? dayjs(dotThi.thoi_gian_ket_thuc)
        : null;
    const daKetThucDotThiDaiDien =
        dotThiKetThuc?.isValid() && dotThiKetThuc.isBefore(now);
    const dotThiMucTieu =
        daKetThucDotThiDaiDien && dotThiSapDienRaKeTiep
            ? dotThiSapDienRaKeTiep
            : dotThi;
    const batDau = dayjs(dotThiMucTieu?.thoi_gian_bat_dau || cuocThi?.thoi_gian_bat_dau);
    const ketThuc = dayjs(dotThiMucTieu?.thoi_gian_ket_thuc || cuocThi?.thoi_gian_ket_thuc);

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
        tieu_de: batDau.isAfter(now)
            ? `${dotThiMucTieu?.ten || "Đợt thi"} sắp bắt đầu`
            : `Thời gian còn lại của ${dotThiMucTieu?.ten || "đợt thi"}`,
    };
}

export function DefaultPublicHomePage() {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [bannerPositionX, setBannerPositionX] = useState(50);
    const [bannerPositionY, setBannerPositionY] = useState(50);
    const [dotThi, setDotThi] = useState(null);
    const [thoiGianConLai, setThoiGianConLai] = useState(null);
    const [tongLuotThi, setTongLuotThi] = useState(SO_LUOT_THI_MUC_TIEU_MARKETING);
    const [dsDotThi, setDsDotThi] = useState([]);
    const [selectedKetQuaDotThi, setSelectedKetQuaDotThi] = useState(null);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [activeSection, setActiveSection] = useState("thong-tin");
    const [compactTicker, setCompactTicker] = useState(false);
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
    const ketQuaDotThi = selectedKetQuaDotThi || dotThi;
    const qrValue = typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "";

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

            const [bannerResult, cuocThiResult] = await Promise.allSettled([
                layCauHinh(khoa),
                layCuocThi({
                    size: 100,
                    page: 1,
                    sortField: "thoi_gian_bat_dau",
                    sortType: "asc",
                }),
            ]);

            applyIfActive(() => {
                setIsMobileViewport(mobile);
            });

            if (bannerResult.status === "fulfilled" && bannerResult.value?.data) {
                const val = parseMediaConfig(bannerResult.value.data.gia_tri);

                applyIfActive(() => {
                    setImage(val.duongDan || val.url || "");
                    setZoom(val.zoom || 1);
                    setBannerPositionX(val.positionX || 50);
                    setBannerPositionY(val.positionY || 50);
                });
            } else {
                applyIfActive(() => {
                    setImage(null);
                    setZoom(1);
                    setBannerPositionX(50);
                    setBannerPositionY(50);
                });
            }

            const selectedCuocThi = cuocThiResult.status === "fulfilled"
                ? chonCuocThiGanNhat(cuocThiResult.value?.data || [])
                : null;

            if (!selectedCuocThi?.id) {
                applyIfActive(() => {
                    setDotThi(null);
                    setDsDotThi([]);
                    setThoiGianConLai(null);
                    setTongLuotThi(SO_LUOT_THI_MUC_TIEU_MARKETING);
                });
                return;
            }

            try {
                const [dsDotThiResult, luotThiResult] = await Promise.all([
                    layDotThi(selectedCuocThi.id, {
                        size: 50,
                        page: 1,
                        sortField: "thoi_gian_bat_dau",
                        sortType: "asc",
                    }),
                    layLuotThiHienTai(),
                ]);
                const danhSachDotThi = dsDotThiResult?.data || [];
                const selectedDotThi = taoDotThiTheoCuocThi(selectedCuocThi, danhSachDotThi);
                const tongLuotThiThucTe = Number(
                    luotThiResult?.data?.data
                    ?? luotThiResult?.data
                    ?? 0
                );

                applyIfActive(() => {
                    setDotThi(selectedDotThi);
                    setDsDotThi(danhSachDotThi);
                    setThoiGianConLai(taoThongTinDemNguoc(selectedDotThi, selectedCuocThi, danhSachDotThi));
                    setTongLuotThi(tinhTongLuotThiHienThi(tongLuotThiThucTe));
                });
            } catch (error) {
                console.error("Không thể tải timeline đợt thi", error);

                applyIfActive(() => {
                    const fallbackDotThi = taoDotThiTheoCuocThi(selectedCuocThi, []);
                    setDotThi(fallbackDotThi);
                    setDsDotThi([]);
                    setThoiGianConLai(taoThongTinDemNguoc(fallbackDotThi, selectedCuocThi, []));
                    setTongLuotThi(SO_LUOT_THI_MUC_TIEU_MARKETING);
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
        if (!selectedKetQuaDotThi?.id) {
            return;
        }

        const matchedDotThi =
            dsDotThi.find((item) => Number(item?.id) === Number(selectedKetQuaDotThi.id))
            || null;

        setSelectedKetQuaDotThi(matchedDotThi);
    }, [dsDotThi, selectedKetQuaDotThi?.id]);

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
            return `Cuộc thi diễn ra từ ${batDau} đến hết ${ketThuc}.`;
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

    const handleOpenKetQuaDotThi = (timelineItem) => {
        if (!timelineItem?.id) {
            return;
        }

        const matchedDotThi =
            dsDotThi.find((item) => Number(item?.id) === Number(timelineItem.id))
            || null;

        setSelectedKetQuaDotThi(matchedDotThi);
        scrollToSection("ket-qua");
    };

    return (
        <div className="w-full bg-[#fffdf4]">
            <PublicPageBanner
                image={image}
                zoom={zoom}
                positionX={bannerPositionX}
                positionY={bannerPositionY}
                isMobileViewport={isMobileViewport}
            />

            <PublicPageTicker
                items={tabItems}
                compactTicker={compactTicker}
                colorPrimary={colorPrimary}
                activeSection={activeSection}
                onSelect={scrollToSection}
            />

            <div className="mx-auto w-full px-4 py-4 sm:px-10 md:px-10 lg:px-30 xl:px-50 2xl:px-70">
                <Row gutter={[20, 20]} align="stretch">
                    <PublicContestOverview
                        colorPrimary={colorPrimary}
                        deepPrimary={deepPrimary}
                        contestMeta={contestMeta}
                        thoiGianConLai={thoiGianConLai}
                        qrValue={qrValue}
                        thongTinDuThi={thongTinDuThi}
                        hienThiTongLuotThi={hienThiTongLuotThi}
                        minLuotThi={SO_LUOT_THI_MUC_TIEU_MARKETING}
                        onJoinExam={handleJoinExam}
                        thongTinRef={(node) => {
                            sectionRefs.current["thong-tin"] = node;
                        }}
                    />

                    <Col span={24}>
                        <Reveal delay={130}>
                            <PublicContestTimeline
                                items={timelineItems}
                                colorPrimary={colorPrimary}
                                onResultClick={handleOpenKetQuaDotThi}
                            />
                        </Reveal>
                    </Col>

                    <Col span={24}>
                        <div className="space-y-5">
                            <PublicPageSectionDivider colorPrimary={colorPrimary} />

                            <Reveal delay={160}>
                                <section
                                    ref={(node) => {
                                        sectionRefs.current["giai-thuong"] = node;
                                    }}
                                    className="scroll-mt-24 space-y-3"
                                >
                                    <div className="space-y-1.5">
                            
                                        <div className="text-3xl font-bold text-slate-900 up" style={{color: colorPrimary}}> 
                                            Giải thưởng
                                        </div>
                                    </div>
                                    <GiaiThuongCuocThi/>
                                </section>
                            </Reveal>

                            <PublicPageSectionDivider colorPrimary={colorPrimary} />

                            <Reveal delay={180}>
                                <section
                                    ref={(node) => {
                                        sectionRefs.current["document"] = node;
                                    }}
                                    className="scroll-mt-24 space-y-3"
                                >
                                    <div className="space-y-1.5">
                                        
                                        <div className="text-3xl font-bold text-slate-900 up" style={{color: colorPrimary}}> 
                                            Tài liệu
                                        </div>
                                    </div>
                                    <TaiLieuTongHop/>
                                </section>
                            </Reveal>

                            <PublicPageSectionDivider colorPrimary={colorPrimary} />

                            <Reveal delay={200}>
                                <section
                                    ref={(node) => {
                                        sectionRefs.current["ket-qua"] = node;
                                    }}
                                    className="scroll-mt-24 space-y-3"
                                >
                                    <div className="space-y-1.5">
                                        
                                        <div className="text-3xl font-bold text-slate-900 up" style={{color: colorPrimary}}> 
                                            Kết quả
                                        </div>
                                    </div>
                                    <KetQuaCongBo dotThi={ketQuaDotThi} />
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

export default function Page() {
    const [selectedDemo, setSelectedDemo] = useState("demo0");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res = await layCauHinhTrangChu();

                if (active) {
                    setSelectedDemo(res.data.selectedDemo);
                }
            } catch {
                if (active) {
                    setSelectedDemo("demo0");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fffdf4]">
                <Spin size="large" />
            </div>
        );
    }

    if (selectedDemo === "demo1") {
        return <Demo1Page skipDemoAccessCheck />;
    }

    if (selectedDemo === "demo2") {
        return <Demo2Page skipDemoAccessCheck />;
    }

    if (selectedDemo === "demo3") {
        return <Demo3Page skipDemoAccessCheck />;
    }

    if (selectedDemo === "demo4") {
        return <Demo4Page skipDemoAccessCheck />;
    }

    return <DefaultPublicHomePage />;
}
