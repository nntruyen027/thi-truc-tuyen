'use client';

import {Button, Card, Col, Flex, QRCode, Row, Typography} from "antd";
import {LaptopOutlined, ProfileOutlined, TeamOutlined} from "@ant-design/icons";
import CountDown from "~/app/demo1/CountDown";
import Reveal from "~/app/components/common/Reveal";
import {alphaColor} from "~/utils/workspaceTheme";

const {Text, Paragraph} = Typography;

export default function PublicContestOverview({
    colorPrimary,
    deepPrimary,
    contestMeta,
    thoiGianConLai,
    qrValue,
    hienThiTongLuotThi,
    minLuotThi,
    onJoinExam,
    thongTinRef,
    honorBoard,
}) {
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

    return (
        <>
            <Col xs={24} lg={12} xl={8} className="order-3 flex xl:order-3" ref={thongTinRef}>
                <Reveal delay={90} className="h-full w-full">
                    <Card
                        className="h-full overflow-hidden rounded-[28px] border shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
                        style={{borderColor: alphaColor(colorPrimary, 0.14)}}
                        styles={{body: {padding: 0, height: "100%"}}}
                    >
                        <Flex vertical className="h-full" style={{background: alphaColor(colorPrimary, 0.05)}}>
                            <h3 style={{
                                background: deepPrimary,
                                margin: 0,
                            }} className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-white md:text-base">
                                Thông tin cuộc thi
                            </h3>

                            <Flex vertical gap={18} className="flex-1 !px-5 !py-5 !md:px-6 !md:py-6 justify-around">
                                {infoCards.map((item) => (
                                    <div key={item.title} className="space-y-3">
                                        <Text style={{color: colorPrimary}} className="!block !text-xl !font-bold !uppercase !tracking-[0.04em] md:!text-xl">
                                            {item.title}
                                        </Text>
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <div
                                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-white text-[1.7rem] md:h-18 md:w-18"
                                                style={{
                                                    color: colorPrimary,
                                                    borderColor: alphaColor(colorPrimary, 0.12),
                                                }}
                                            >
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

            <Col xs={24} lg={12} xl={8} className="order-1 flex xl:order-1">
                <Reveal delay={110} className="h-full w-full">
                    <Flex vertical gap={12} className="h-full w-full">
                        {thoiGianConLai ? (
                            <Reveal delay={70}>
                                <CountDown time={thoiGianConLai}/>
                            </Reveal>
                        ) : null}

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
                                                onClick={onJoinExam}
                                            >
                                                THAM GIA THI
                                            </Button>
                                        </div>

                                        
                                    </div>
                                    <div
                                            className="flex flex-col items-center gap-3 text-center w-full px-4 py-3"
                                        >
                                            
                                            <QRCode
                                                value={qrValue || " "}
                                                size={100}
                                                bordered={false}
                                                color={colorPrimary}
                                                bgColor="transparent"
                                            />
                                    </div>

                                    {hienThiTongLuotThi > minLuotThi ? (
                                        <div className="text-center">
                                            <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-1">
                                                <Text className="!mb-0 !pb-1 !text-lg !font-semibold !uppercase !text-slate-700 md:!text-xl">
                                                    Đã có
                                                </Text>
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

            {honorBoard ? (
                <Col xs={24} lg={12} xl={8} className="order-2 flex xl:order-2">
                    {honorBoard}
                </Col>
            ) : null}
        </>
    );
}
