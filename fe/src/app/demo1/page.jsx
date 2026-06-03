'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useRef, useState} from "react";
import {Button, Row, Typography, theme} from "antd";
import {ArrowUpOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import KetQuaCongBo from "~/app/demo1/KetQuaCongBo";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {darkenColor, parseMediaConfig} from "~/utils/workspaceTheme";
import TaiLieuTongHop from "~/app/demo1/TaiLieuTongHop";
import GiaiThuongCuocThi from "~/app/demo1/GiaiThuongCuocThi";
import {buildTimelineStages, SO_LUOT_THI_TOI_THIEU} from "~/app/demo1/page.config";
import PublicPageBanner from "~/app/demo1/components/PublicPageBanner";
import PublicContestOverview from "~/app/demo1/components/PublicContestOverview";
import PublicContestTimeline from "~/app/demo1/components/PublicContestTimeline";
import PublicPageSectionDivider from "~/app/demo1/components/PublicPageSectionDivider";
import PublicHonorBoard from "~/app/demo1/components/PublicHonorBoard";
import useDemoRouteAccess from "~/hooks/useDemoRouteAccess";
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

const {Text} = Typography;

export default function Page({skipDemoAccessCheck = false}) {
    const canRender = useDemoRouteAccess("demo1", skipDemoAccessCheck);
    const [image, setImage] = useState(DEMO_BANNER_CONFIG.image);
    const [zoom, setZoom] = useState(DEMO_BANNER_CONFIG.zoom);
    const [bannerPositionX, setBannerPositionX] = useState(DEMO_BANNER_CONFIG.positionX);
    const [bannerPositionY, setBannerPositionY] = useState(DEMO_BANNER_CONFIG.positionY);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const sectionRefs = useRef({
        "thong-tin": null,
        "giai-thuong": null,
        "document": null,
        "ket-qua": null,
    });

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const deepPrimary = darkenColor(colorPrimary, 0.08);
    const route = useRouter();
    const user = useAuthStore((state) => state.user);
    const dotThi = DEMO_DOT_THI;
    const thoiGianConLai = DEMO_TIME_LEFT;
    const tongLuotThi = DEMO_TOTAL_ATTEMPTS;
    const dsDotThi = DEMO_TIMELINE;

    const contestMeta = useMemo(
        () => parseCuocThiMeta(dotThi?.cuoc_thi?.mo_ta),
        [dotThi?.cuoc_thi?.mo_ta]
    );
    const timelineItems = useMemo(
        () => buildTimelineStages(dsDotThi, dotThi?.id),
        [dotThi?.id, dsDotThi]
    );
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

        void loadBanner();

        const updateViewport = () => {
            void loadBanner();
        };

        window.addEventListener("resize", updateViewport);

        return () => {
            active = false;
            window.removeEventListener("resize", updateViewport);
        };
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

    useEffect(() => {
        const updateBackToTopState = () => {
            setShowBackToTop(window.scrollY > (isMobileViewport ? 320 : 420));
        };

        updateBackToTopState();
        window.addEventListener("scroll", updateBackToTopState, { passive: true });

        return () => {
            window.removeEventListener("scroll", updateBackToTopState);
        };
    }, [isMobileViewport]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!canRender) {
        return null;
    }

    return (
        <div className="w-full bg-[#fffdf4]">
            <PublicPageBanner
                image={image}
                zoom={zoom}
                positionX={bannerPositionX}
                positionY={bannerPositionY}
                isMobileViewport={isMobileViewport}
            />

            <div className="w-full px-4 py-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12">
                <Row gutter={[20, 20]} align="stretch">
                    <PublicContestOverview
                        colorPrimary={colorPrimary}
                        deepPrimary={deepPrimary}
                        contestMeta={contestMeta}
                        thoiGianConLai={thoiGianConLai}
                        qrValue={qrValue}
                        hienThiTongLuotThi={hienThiTongLuotThi}
                        minLuotThi={SO_LUOT_THI_TOI_THIEU}
                        onJoinExam={handleJoinExam}
                        thongTinRef={(node) => {
                            sectionRefs.current["thong-tin"] = node;
                        }}
                            honorBoard={
                                <PublicHonorBoard
                                    dotThi={dotThi}
                                    colorPrimary={colorPrimary}
                                    deepPrimary={deepPrimary}
                                    demoData={DEMO_HONOR_BOARD}
                                />
                            }
                        />
                </Row>
            </div>

            <div className="mx-auto w-full px-4 py-4 sm:px-10 md:px-10 lg:px-30 xl:px-50 2xl:px-70">
                <div className="space-y-5">
                    <Reveal delay={130}>
                        <PublicContestTimeline items={timelineItems} colorPrimary={colorPrimary} />
                    </Reveal>

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
                                    <GiaiThuongCuocThi demoData={DEMO_PRIZES}/>
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
                                    <TaiLieuTongHop demoData={DEMO_DOCUMENTS}/>
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
                                    <KetQuaCongBo dotThi={dotThi} demoData={DEMO_RANKINGS} />
                                </section>
                            </Reveal>
                        </div>
                    </div>
                </div>
            {showBackToTop ? (
                <div className="fixed bottom-5 right-5 z-40 md:bottom-7 md:right-7">
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<ArrowUpOutlined />}
                        onClick={scrollToTop}
                        className="!h-13 !w-13 !border-0 shadow-[0_14px_30px_rgba(25,72,190,0.28)]"
                        style={{background: colorPrimary}}
                    />
                </div>
            ) : null}
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
