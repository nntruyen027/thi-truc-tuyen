'use client';

import {useEffect, useMemo, useState} from "react";
import {Card, Empty, Typography, theme} from "antd";
import {TeamOutlined, UserOutlined} from "@ant-design/icons";
import {layCauHinhGiaiThuong} from "~/services/giai-thuong";

const {Text, Title} = Typography;

function formatThousands(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatNumberText(value) {
    if (value == null) {
        return "";
    }

    return String(value).replace(/\d[\d,.]*/g, (match) => {
        const digits = match.replace(/[^\d]/g, "");

        if (!digits) {
            return match;
        }

        return formatThousands(digits);
    });
}

function GiaiSection({title, icon, items, accentStyle, primaryColor}) {
    if (!items.length) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl" style={accentStyle}>
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

            <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-sm">
                <div
                    className="hidden grid-cols-[88px_minmax(220px,1.5fr)_130px_190px] items-center gap-4 border-b border-slate-200 px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-500 md:grid lg:px-6"
                    style={{background: `${primaryColor}10`}}
                >
                    <div>Xếp hạng</div>
                    <div>Giải thưởng</div>
                    <div>Số lượng</div>
                    <div>Trị giá</div>
                </div>

                <div className="divide-y divide-slate-200 bg-white">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="grid gap-4 px-4 py-5 md:grid-cols-[88px_minmax(220px,1.5fr)_130px_190px] md:items-center md:px-5 lg:px-6"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold shadow-sm"
                                    style={accentStyle}
                                >
                                    {index + 1}
                                </div>
                                <div className="md:hidden">
                                    <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.14em] !text-slate-400">
                                        Xếp hạng
                                    </Text>
                                    <Text className="!text-sm !font-semibold !text-slate-700">
                                        Giải {formatThousands(index + 1)}
                                    </Text>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.14em] !text-slate-400 md:!hidden">
                                    Giải thưởng
                                </Text>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Title level={5} className="!mb-0 !text-lg !font-bold !text-slate-900">
                                        {item.tenGiai}
                                    </Title>
                                </div>
                            </div>

                            <div>
                                <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.14em] !text-slate-400 md:!hidden">
                                    Số lượng
                                </Text>
                                <Text className="!text-base !font-semibold !text-slate-700">
                                    {formatNumberText(item.soLuong)}
                                </Text>
                            </div>

                            <div>
                                <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.14em] !text-slate-400 md:!hidden">
                                    Trị giá
                                </Text>
                                <div
                                    className="inline-flex rounded-2xl px-4 py-3 text-lg font-bold"
                                    style={{
                                        border: `1px solid ${primaryColor}22`,
                                        background: `${primaryColor}10`,
                                        color: primaryColor,
                                    }}
                                >
                                    {formatNumberText(item.triGia)}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function GiaiThuongCuocThi() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const {token} = theme.useToken();

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
           

            <div className="space-y-8">
                <GiaiSection
                    title="Giải cá nhân"
                    icon={<UserOutlined/>}
                    items={data?.giaiCaNhan || []}
                    primaryColor={token.colorPrimary}
                    accentStyle={{
                        background: `${token.colorPrimary}12`,
                        color: token.colorPrimary,
                    }}
                />

                <GiaiSection
                    title="Giải tập thể"
                    icon={<TeamOutlined/>}
                    items={data?.giaiTapThe || []}
                    primaryColor={token.colorPrimary}
                    accentStyle={{
                        background: "#fff7ed",
                        color: "#d97706",
                    }}
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
