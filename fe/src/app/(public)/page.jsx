'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";
import {getPublicFileUrl} from "~/services/file";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import {Button, Col, Row, theme} from "antd";
import dayjs from "dayjs";
import {layThoiGianConLaiCuaCuocThi} from "~/services/thi/cuoc-thi";
import CountDown from "~/app/(public)/CountDown";
import {useRouter} from "next/navigation";
import TaiLieu from "~/app/(public)/TaiLieu";
import TaiLieuKhac from "~/app/(public)/TaiLieuKhac";

const tabItems = [
    {
        key: "ke-hoach",
        label: "Kế hoạch",
        image: "/schedule.png",
    },
    {
        key: "the-le",
        label: "Thể lệ",
        image: "/law.png",
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

export default function Page() {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [dotThi, setDotThi] = useState(null);
    const [thoiGianConLai, setThoiGianConLai] = useState(null);
    const [tab, setTab] = useState("ke-hoach");

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const route = useRouter();

    const getKhoa = () => {
        if (window.innerWidth < 768) {
            return "banner_mobile";
        }

        return "banner_desktop";
    };

    useEffect(() => {
        let active = true;

        const load = async () => {
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
            }

            if (resConLai.data) {
                setThoiGianConLai(resConLai.data);
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

    return (
        <div className="w-full">
            <Row>
                <Col span={24}>
                    <div
                        className="relative w-full overflow-hidden bg-slate-200"
                        style={{
                            aspectRatio: "16/7"
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
                    </div>
                </Col>

                <Col span={24}>
                    {dotThi && (
                        <div
                            style={{
                                background: colorPrimary,
                                fontFamily: "Arial"
                            }}
                            className="px-4 py-4 text-center text-white"
                        >
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                                Đang diễn ra
                            </div>

                            <div className="mt-1 text-base font-semibold md:text-lg">
                                {dotThi?.ten}
                            </div>

                            <div className="mt-1 text-sm md:text-base">
                                Từ {dayjs(dotThi.thoi_gian_bat_dau).format("DD/MM/YYYY HH:mm:ss")}
                                {" đến "}
                                {dayjs(dotThi.thoi_gian_ket_thuc).format("DD/MM/YYYY HH:mm:ss")}
                            </div>
                        </div>
                    )}
                </Col>
            </Row>

            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Row gutter={[20, 20]}>
                    <Col xs={24} xl={12}>
                        {thoiGianConLai && (
                            <CountDown time={thoiGianConLai}/>
                        )}
                    </Col>

                    <Col xs={24} xl={12}>
                        <div className="mt-3 flex min-h-full flex-col justify-center gap-6 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm md:p-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Cổng thi trực tuyến
                                </h2>
        
                            </div>

                            <div>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="!h-14 w-full !text-lg !font-bold sm:!w-auto sm:min-w-[15rem]"
                                    onClick={() => route.push("/login")}
                                >
                                    Tham gia thi
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {tabItems.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setTab(item.key)}
                                        className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-3 py-4 text-center transition ${
                                            tab === item.key
                                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                                        }`}
                                    >
                                        <img src={item.image} width={40} alt="" />
                                        <span className="text-sm font-semibold md:text-base">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Col>

                    <Col span={24}>
                        {tab === "ke-hoach" && (
                            <TaiLieu
                                title="Kế hoạch"
                                khoa="ke_hoach"
                            />
                        )}

                        {tab === "the-le" && (
                            <TaiLieu
                                title="Thể lệ"
                                khoa="the_le"
                            />
                        )}

                        {tab === "tai-lieu" && (
                            <TaiLieu
                                title="Tài liệu"
                                khoa="tai_lieu"
                            />
                        )}

                        {tab === "ket-qua" && (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 shadow-sm">
                                Chưa có kết quả
                            </div>
                        )}

                        {tab === "document" && (
                            <TaiLieuKhac/>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
}
