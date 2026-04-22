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

export default function Page() {

    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [dotThi, setDotThi] = useState(null);
    const [thoiGianConLai, setThoiGianConLai] = useState(null);

    // tab đang chọn
    const [tab, setTab] = useState("ke-hoach");

    const {token} = theme.useToken()
    const {colorPrimary} = token
    const route = useRouter()

    const getKhoa = () => {
        if (window.innerWidth < 768)
            return "banner_mobile";
        return "banner_desktop";
    };

    const load = async () => {

        const khoa = getKhoa();

        const [resBanner, resDotThi, resConLai] = await Promise.all([
            layCauHinh(khoa),
            layDotThiHienTai(),
            layThoiGianConLaiCuaCuocThi()
        ]);

        if(resBanner.data) {
            const val =
                JSON.parse(
                    resBanner.data.gia_tri
                );
                    setImage(val.url);
            setZoom(val.zoom || 1);
        }

        if(resDotThi.data) {
            setDotThi(resDotThi.data);
        }

        if(resConLai.data) {
            setThoiGianConLai(resConLai.data);
        }

    };


    useEffect(() => {

        void load();

        const onResize = () => {
            load();
        };

        window.addEventListener(
            "resize",
            onResize
        );

        return () =>
            window.removeEventListener(
                "resize",
                onResize
            );

    }, []);


    return (
        <div className={'w-screen'}>

            <Row>
                <Col span={24}>
                    <div
                        style={{
                            width: "100%",
                            aspectRatio: "8/3",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >

                        {image && (

                            <img
                                src={
                                    getPublicFileUrl(
                                        image
                                    )
                                }
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

                    {
                        dotThi && (
                            <div
                                style={{
                                    background: colorPrimary,
                                    fontFamily: "Arial"
                                }}
                                className={
                                    'text-center text-lg p-3 flex flex-col text-white'
                                }
                            >

                                <span className={'uppercase'}>
                                    Đang diễn ra
                                </span>

                                <span>

                                    {dotThi?.ten}

                                    (
                                    Từ {dayjs(dotThi.thoi_gian_bat_dau).format("DD/MM/YYYY hh:mm:ss")} đến {dayjs(dotThi.thoi_gian_ket_thuc).format("DD/MM/YYYY hh:mm:ss")}
                                    )

                                </span>

                            </div>
                        )
                    }

                </Col>

            </Row>


            <div className={'w-[80%] m-auto'}>

                <Row gutter={[16, 16]}>

                    <Col xs={24} lg={12}>
                        {thoiGianConLai && (
                            <CountDown time={thoiGianConLai}/>
                        )}
                    </Col>


                    <Col xs={24} lg={12}>

                        <div
                            className={
                                'text-center flex flex-col gap-10 justify-center items-center mt-3 min-h-[30vh]'
                            }
                        >

                            <Button
                                type="primary"
                                size="large"
                                style={{
                                    width: "15rem",
                                    height: "4rem",
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                }}
                                className="transition hover:scale-110"
                                onClick={() => route.push("/login")}
                            >
                                Tham gia thi
                            </Button>


                            {/* MENU */}

                            <div
                                className={'flex gap-10 justify-around text-xl'}
                            >

                                <div
                                    onClick={() => setTab("ke-hoach")}
                                    className={`flex flex-col cursor-pointer items-center 
                                    ${tab === "ke-hoach" ? "text-blue-600 font-bold" : ""}`}
                                >
                                    <img src={'/schedule.png'} width={40}/>
                                    <span>Kế hoạch</span>
                                </div>


                                <div
                                    onClick={() => setTab("the-le")}
                                    className={`flex flex-col cursor-pointer items-center 
                                    ${tab === "the-le" ? "text-blue-600 font-bold" : ""}`}
                                >
                                    <img src={'/law.png'} width={40}/>
                                    <span>Thể lệ</span>
                                </div>


                                <div
                                    onClick={() => setTab("document")}
                                    className={`flex flex-col cursor-pointer items-center 
                                    ${tab === "document" ? "text-blue-600 font-bold" : ""}`}
                                >
                                    <img src={'/documentation.png'} width={40}/>
                                    <span>Tài liệu</span>
                                </div>


                                <div
                                    onClick={() => setTab("ket-qua")}
                                    className={`flex flex-col cursor-pointer items-center 
                                    ${tab === "ket-qua" ? "text-blue-600 font-bold" : ""}`}
                                >
                                    <img src={'/medal.png'} width={40}/>
                                    <span>Kết quả</span>
                                </div>

                            </div>

                        </div>

                    </Col>


                    {/* CONTENT */}

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
                                khoa="the-le"
                            />
                        )}

                        {tab === "tai-lieu" && (
                            <TaiLieu
                                title="Tài liệu"
                                khoa="tai_lieu"
                            />
                        )}

                        {tab === "ket-qua" && (
                            <div>
                                Chưa có kết quả
                            </div>
                        )}

                        {
                            tab  === 'document' && (
                                <TaiLieuKhac/>
                            )
                        }

                    </Col>

                </Row>

            </div>

        </div>
    );
}