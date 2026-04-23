'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useMemo, useState} from "react";
import {getPublicFileUrl} from "~/services/file";
import {layDotThiHienTai, layDotThi} from "~/services/thi/dot-thi";
import {Button, Card, Col, Flex, Row, Tag, Timeline, Typography, theme} from "antd";
import {LaptopOutlined, ProfileOutlined, TeamOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {layThoiGianConLaiCuaCuocThi} from "~/services/thi/cuoc-thi";
import CountDown from "~/app/(public)/CountDown";
import {useRouter} from "next/navigation";
import KetQuaCongBo from "~/app/(public)/KetQuaCongBo";
import Reveal from "~/app/components/common/Reveal";
import {useAuthStore} from "~/store/auth";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";
import BaiVietCuocThi from "~/app/(public)/BaiVietCuocThi";
import TaiLieuTongHop from "~/app/(public)/TaiLieuTongHop";
import GiaiThuongCuocThi from "~/app/(public)/GiaiThuongCuocThi";

const {Text, Paragraph} = Typography;

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
                children: (
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
    const [tab, setTab] = useState("bai-viet");
    const [timelineItems, setTimelineItems] = useState([]);

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
            try {
                const khoa = getKhoa();

                const [resBanner, resDotThi, resConLai] = await Promise.all([
                    layCauHinh(khoa),
                    layDotThiHienTai(),
                    layThoiGianConLaiCuaCuocThi()
                ]);

                if (!active) return;

                if (resBanner.data) {
                    const val =
                        JSON.parse(
                            resBanner.data.gia_tri
                        );

                    setImage(val.url);
                    setZoom(val.zoom || 1);
                }

                if (resDotThi.data) {
                    setDotThi(resDotThi.data);

                    if (resDotThi.data.cuoc_thi_id) {
                        const dsDotThi = await layDotThi(resDotThi.data.cuoc_thi_id, {
                            size: 50,
                            page: 1,
                        });

                        if (active) {
                            setTimelineItems(
                                buildTimelineItems(dsDotThi?.data || [], resDotThi.data.id)
                            );
                        }
                    }
                }

                if (resConLai.data) {
                    setThoiGianConLai(resConLai.data);
                }
            } catch (error) {
                console.error("Không thể tải dữ liệu trang chủ", error);
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

        if (currentUser.role === "admin") {
            route.push("/admin/dashboard");
            return;
        }

        route.push("/user");
    };

    return (
        <div className="w-full">
            <Reveal animation="soft">
                <div className="pt-4 lg:pt-6">
                    <div className="w-full">
                        <div
                            className="relative w-full overflow-hidden bg-slate-200 shadow-sm"
                            style={{
                                aspectRatio: "16/3"
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

            <div className="mx-auto w-full px-4 py-6 sm:px-20 lg:px-60">
                <Row gutter={[20, 20]} align="stretch">
                    <Col xs={24} xl={11} className="flex">
                        <Reveal delay={90} className="h-full w-full">
                            <Card
                                className="h-full overflow-hidden rounded-[32px] border-0 shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
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
                                                    border-white bg-white text-[1.7rem] text-[#1948be] md:h-18 md:w-18">
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

                    <Col xs={24} xl={13} className="flex">
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
                                        <div>
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="!h-14 w-full !rounded-2xl !text-lg !font-bold sm:!w-auto sm:min-w-[15rem]"
                                                onClick={handleJoinExam}
                                            >
                                                Tham gia thi
                                            </Button>
                                            
                                        </div>
                                        <Text className="!mb-0 !text-sm !text-slate-500">
                                            Bạn cần đăng nhập để tham gia cuộc thi!
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
                                                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                            : "border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
                                                    }`}
                                                >
                                                    <img src={item.image} width={40} alt="" />
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
        </div>
    );
}
