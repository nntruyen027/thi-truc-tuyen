'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useRef, useState} from "react";
import {layDotThiHienTai, layDotThi} from "~/services/thi/dot-thi";
import {Col, Row, Typography, theme} from "antd";
import {layLuotThiHienTai, layThoiGianConLaiCuaCuocThi} from "~/services/thi/cuoc-thi";
import {useRouter} from "next/navigation";
import KetQuaCongBo from "~/app/(public)/KetQuaCongBo";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {darkenColor, parseMediaConfig} from "~/utils/workspaceTheme";
import TaiLieuTongHop from "~/app/(public)/TaiLieuTongHop";
import GiaiThuongCuocThi from "~/app/(public)/GiaiThuongCuocThi";
import {buildTimelineStages, formatLongVietnameseDate, SO_LUOT_THI_TOI_THIEU, tabItems} from "~/app/(public)/page.config";
import PublicPageBanner from "~/app/(public)/components/PublicPageBanner";
import PublicPageTicker from "~/app/(public)/components/PublicPageTicker";
import PublicContestOverview from "~/app/(public)/components/PublicContestOverview";
import PublicContestTimeline from "~/app/(public)/components/PublicContestTimeline";
import PublicPageSectionDivider from "~/app/(public)/components/PublicPageSectionDivider";

const {Text} = Typography;

export default function Page() {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [bannerPositionX, setBannerPositionX] = useState(50);
    const [bannerPositionY, setBannerPositionY] = useState(50);
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
                        minLuotThi={SO_LUOT_THI_TOI_THIEU}
                        onJoinExam={handleJoinExam}
                        thongTinRef={(node) => {
                            sectionRefs.current["thong-tin"] = node;
                        }}
                    />

                    <Col span={24}>
                        <Reveal delay={130}>
                            <PublicContestTimeline items={timelineItems} colorPrimary={colorPrimary} />
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
