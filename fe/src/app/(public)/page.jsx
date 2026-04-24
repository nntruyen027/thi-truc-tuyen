'use client';

import Image from "next/image";
import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useState} from "react";
import {getPublicFileUrl} from "~/services/file";
import {layDotThiHienTai, layDotThi} from "~/services/thi/dot-thi";
import {Button, Card, Col, Flex, Row, Tag, Timeline, Typography, theme} from "antd";
import {LaptopOutlined, ProfileOutlined, TeamOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {layLuotThiHienTai, layThoiGianConLaiCuaCuocThi} from "~/services/thi/cuoc-thi";
import CountDown from "~/app/(public)/CountDown";
import {useRouter} from "next/navigation";
import KetQuaCongBo from "~/app/(public)/KetQuaCongBo";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import {alphaColor, parseMediaConfig} from "~/utils/workspaceTheme";
import BaiVietCuocThi from "~/app/(public)/BaiVietCuocThi";
import TaiLieuTongHop from "~/app/(public)/TaiLieuTongHop";
import GiaiThuongCuocThi from "~/app/(public)/GiaiThuongCuocThi";

const {Text, Paragraph} = Typography;
const SO_LUOT_THI_TOI_THIEU = 132;

const tabItems = [
    {
        key: "bai-viet",
        label: "Bài viết",
        image: "/schedule.png",
    },
    {
        key: "giai-thuong",
        label: "Giải thưởng",
        image: "/medal.png",
    },
    {
        key: "document",
        label: "Tài liệu",
        image: "/documentation.png",
    },
    {
        key: "ket-qua",
        label: "Kết quả",
        image: "/medal.png",
    },
];

function buildTimelineItems(dsDotThi = [], currentDotThiId) {
    const now = dayjs();

    return [...dsDotThi]
        .sort((a, b) => dayjs(a.thoi_gian_bat_dau).valueOf() - dayjs(b.thoi_gian_bat_dau).valueOf())
        .map((item) => {
            const isCurrent = item.id === currentDotThiId;
            const isFinished = dayjs(item.thoi_gian_ket_thuc).isBefore(now);
            const isUpcoming = dayjs(item.thoi_gian_bat_dau).isAfter(now);

            let color = "blue";
            let status = "Đang diễn ra";

            if (isFinished) {
                color = "gray";
                status = "Đã kết thúc";
            } else if (isUpcoming) {
                color = "green";
                status = "Sắp diễn ra";
            } else if (isCurrent) {
                color = "red";
                status = "Đang diễn ra";
            }

            return {
                color,
                content: (
                    <div className="space-y-2 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Text className="!text-base !font-semibold !text-slate-900">
                                {item.ten}
                            </Text>
                            <Tag color={isCurrent ? "red" : isFinished ? "default" : isUpcoming ? "green" : "blue"}>
                                {status}
                            </Tag>
                        </div>
                        {item.mo_ta && (
                            <Paragraph className="!mb-0 !text-sm !leading-7 !text-slate-500">
                                {item.mo_ta}
                            </Paragraph>
                        )}
                        <Text className="!text-sm !text-slate-500">
                            {dayjs(item.thoi_gian_bat_dau).format("DD/MM/YYYY HH:mm")} - {dayjs(item.thoi_gian_ket_thuc).format("DD/MM/YYYY HH:mm")}
                        </Text>
                    </div>
                )
            };
        });
}

export default function Page() {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [dotThi, setDotThi] = useState(null);
    const [thoiGianConLai, setThoiGianConLai] = useState(null);
    const [tongLuotThi, setTongLuotThi] = useState(SO_LUOT_THI_TOI_THIEU);
    const [tab, setTab] = useState("bai-viet");
    const [timelineItems, setTimelineItems] = useState([]);
    const [isMobileViewport, setIsMobileViewport] = useState(false);

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const route = useRouter();
    const user = useAuthStore((state) => state.user);

    const contestMeta = useMemo(
        () => parseCuocThiMeta(dotThi?.cuoc_thi?.mo_ta),
        [dotThi?.cuoc_thi?.mo_ta]
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
                            setTimelineItems(
                                buildTimelineItems(dsDotThi?.data || [], currentDotThi.id)
                            );
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
                        Math.max(Number(luotThiResult.value?.data || 0), SO_LUOT_THI_TOI_THIEU)
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
        () => Math.max(Number(tongLuotThi || 0), SO_LUOT_THI_TOI_THIEU),
        [tongLuotThi]
    );

    return (
        <div className="w-full">
            <Reveal animation="soft">
                <div className="">
                    <div className="w-full">
                        <div
                            className="relative w-full overflow-hidden bg-slate-200 shadow-sm"
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

            <div className="mx-auto w-full px-4 py-6 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-50">
                <Row gutter={[20, 20]} align="stretch">
                    <Col xs={24} xl={12} className="flex">
                        <Reveal delay={90} className="h-full w-full">
                            <Card
                                className="h-full overflow-hidden rounded-2xl border-0 shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
                                styles={{body: {padding: 0, height: "100%"}}}
                            >
                                <Flex vertical className="h-full bg-slate-100">
                                    <h3 style={{
                                        background: colorPrimary,
                                        margin: '0'
                                    }} className="px-4 text-center py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white md:text-base">
                                        Thông tin cuộc thi
                                    </h3>

                                    <Flex vertical gap={18} className="flex-1 !px-5 !py-5 !md:px-6 !md:py-6">
                                    
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
                                                    style={{color: colorPrimary}}>
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex-1 rounded-[24px] bg-white px-5 py-4">
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
                            <Flex vertical gap={16} className="h-full w-full">
                                {thoiGianConLai && (
                                    <Reveal delay={70}>
                                        <CountDown time={thoiGianConLai}/>
                                    </Reveal>
                                )}

                                <Card
                                    className="flex-1 rounded-[32px] border border-slate-200 shadow-sm"
                                    styles={{body: {padding: 24, height: "100%"}}}
                                >
                                    <Flex vertical justify="space-around" gap={24} className="h-full text-center">
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
                                                className="join-exam-pulse__button !h-14 w-full !rounded-2xl !text-lg !font-bold sm:!w-auto sm:min-w-[15rem]"
                                                onClick={handleJoinExam}
                                            >
                                                THAM GIA THI
                                            </Button>
                                            </div>
                                        </div>
                                        <Text style={{
                                                    color: colorPrimary
                                                }} className="!mb-0  uppercase !text-2xl">
                                            Đã có  
                                                <span className="font-bold text-7xl"> {Intl.NumberFormat("vi-VN").format(hienThiTongLuotThi)} </span> 
                                            lượt thi.
                                        </Text>
                                        

            
                                    </Flex>
                                </Card>

                                <Card
                                    className="flex-1 rounded-[32px] border border-slate-200 shadow-sm"
                                    styles={{body: {padding: 24, height: "100%"}}}
                                >
                                     <Timeline
                                     
                                items={timelineItems}
                                orientation="horizontal"
                            />
                                </Card>

                               
                            </Flex>
                        </Reveal>
                    </Col>

                
                    <Col span={24}>
                    <Reveal delay={110} className="h-full w-full">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {tabItems.map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setTab(item.key)}
                                                    className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-3 py-4 text-center transition duration-300 ${
                                                        tab === item.key
                                                            ? "shadow-sm"
                                                            : "border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5"
                                                    }`}
                                                    style={tab === item.key
                                                        ? {
                                                            borderColor: colorPrimary,
                                                            backgroundColor: alphaColor(colorPrimary, 0.1),
                                                            color: colorPrimary,
                                                        }
                                                        : undefined}
                                                >
                                                    <Image src={item.image} width={40} height={40} alt="" />
                                                    <span className="text-sm font-semibold md:text-base">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                    </Reveal>
                    </Col>

                    <Col span={24}>
                        <Reveal key={tab} delay={140}>
                            {tab === "bai-viet" && (
                                <BaiVietCuocThi/>
                            )}

                            {tab === "giai-thuong" && (
                                <GiaiThuongCuocThi/>
                            )}

                            {tab === "ket-qua" && (
                                <KetQuaCongBo dotThi={dotThi} />
                            )}

                            {tab === "document" && (
                                <TaiLieuTongHop/>
                            )}
                        </Reveal>
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
