'use client';

import {useEffect, useMemo, useState} from "react";
import {Card, Col, Empty, Row, Tag, Typography} from "antd";
import {GiftOutlined, TeamOutlined, TrophyOutlined, UserOutlined} from "@ant-design/icons";
import {layCauHinhGiaiThuong} from "~/services/giai-thuong";

const {Paragraph, Text, Title} = Typography;

function GiaiSection({title, icon, items, accentClass}) {
    if (!items.length) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${accentClass}`}>
                    {icon}
                </div>
                <div>
                    <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-slate-400">
                        Cơ cấu giải
                    </Text>
                    <Title level={4} className="!mb-0 !text-lg !font-bold !text-slate-900">
                        {title}
                    </Title>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {items.map((item) => (
                    <Col xs={24} md={12} xl={8} key={item.id}>
                        <Card
                            className="h-full rounded-[28px] border border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            styles={{body: {padding: 20, height: "100%"}}}
                        >
                            <div className="flex h-full flex-col gap-4">
                                <div className="space-y-2">
                                    <Tag color="gold" className="!m-0 !rounded-full !px-3 !py-1 !text-xs !font-semibold">
                                        {item.soLuong} giải
                                    </Tag>
                                    <Title level={5} className="!mb-0 !text-lg !font-bold !text-slate-900">
                                        {item.tenGiai}
                                    </Title>
                                </div>

                                <div className="rounded-[22px] border border-blue-100 bg-blue-50/60 px-4 py-4">
                                    <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.16em] !text-slate-400">
                                        Trị giá
                                    </Text>
                                    <div className="mt-2 text-2xl font-bold text-[#1948be]">
                                        {item.triGia}
                                    </div>
                                </div>

                                {item.ghiChu && (
                                    <Paragraph className="!mb-0 flex-1 !text-sm !leading-7 !text-slate-500">
                                        {item.ghiChu}
                                    </Paragraph>
                                )}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default function GiaiThuongCuocThi() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                const value = await layCauHinhGiaiThuong();

                if (!active) {
                    return;
                }

                setData(value);
            } catch {
                if (active) {
                    setData(null);
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

    const hasPrize = useMemo(() => {
        return (data?.giaiCaNhan?.length || 0) > 0 || (data?.giaiTapThe?.length || 0) > 0;
    }, [data]);

    if (!loading && !hasPrize) {
        return (
            <Card
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
                styles={{body: {padding: 32}}}
            >
                <Empty description="Chưa có cơ cấu giải thưởng được cập nhật"/>
            </Card>
        );
    }

    return (
        <Card
            className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
            styles={{body: {padding: 24}}}
            loading={loading}
        >
            <div className="mb-6 rounded-[28px] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,251,235,0.95)_0%,rgba(239,246,255,0.95)_100%)] px-5 py-6 md:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-[#1948be] shadow-sm">
                                <GiftOutlined/>
                            </div>
                            <Title level={3} className="!mb-0 !text-xl !font-bold !text-slate-900 md:!text-2xl">
                                {data?.tieuDe || "Giải thưởng cuộc thi"}
                            </Title>
                        </div>
                        <Paragraph className="!mb-0 !text-sm !leading-7 !text-slate-600 md:!text-base">
                            {data?.moTa || "Thông tin giải thưởng dành cho cá nhân và tập thể tham gia cuộc thi."}
                        </Paragraph>
                    </div>

                    <Tag
                        color="gold"
                        className="!m-0 !w-fit !rounded-full !px-4 !py-2 !text-sm !font-semibold"
                    >
                        Cập nhật mới nhất
                    </Tag>
                </div>
            </div>

            <div className="space-y-8">
                <GiaiSection
                    title="Giải cá nhân"
                    icon={<UserOutlined/>}
                    items={data?.giaiCaNhan || []}
                    accentClass="bg-blue-50 text-[#1948be]"
                />

                <GiaiSection
                    title="Giải tập thể"
                    icon={<TeamOutlined/>}
                    items={data?.giaiTapThe || []}
                    accentClass="bg-amber-50 text-amber-600"
                />

                {!hasPrize && (
                    <div className="flex min-h-[10rem] items-center justify-center rounded-[24px] bg-slate-50">
                        <Empty description="Chưa có cơ cấu giải thưởng được cập nhật"/>
                    </div>
                )}
            </div>
        </Card>
    );
}

