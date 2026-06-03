'use client';

import Image from "next/image";
import {useEffect, useMemo, useState} from "react";
import {Card, Empty, Typography, theme} from "antd";
import {
    CrownOutlined,
    StarFilled,
    TeamOutlined,
    TrophyOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {layCauHinhGiaiThuong} from "~/services/giai-thuong";
import {darkenColor, lightenColor} from "~/utils/workspaceTheme";

const {Paragraph, Text, Title} = Typography;

function formatThousands(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatNumberText(value) {
    if (value == null) {
        return "";
    }

    if(value < 10)
        return '0' + String(value);

    return String(value).replace(/\d[\d,.]*/g, (match) => {
        const digits = match.replace(/[^\d]/g, "");

        if (!digits) {
            return match;
        }

        

        return formatThousands(digits);
    });
}

function getPrizePalette(index, primaryColor) {
    // Mau nhan theo thu hang giai: giai nhat, nhi, ba va cac giai con lai.
    if (index === 0) {
        return {
            accent: "#d97706",
            soft: "#fff7ed",
            border: "#fdba74",
            badge: "#f59e0b",
            icon: <CrownOutlined />,
        };
    }

    if (index === 1) {
        return {
            accent: "#0f766e",
            soft: "#ecfeff",
            border: "#fff7ed",
            badge: "#14b8a6",
            icon: <TrophyOutlined />,
        };
    }

    if (index === 2) {
        return {
            accent: "#7c3aed",
            soft: "#f5f3ff",
            border: "#fff7ed",
            badge: "#8b5cf6",
            icon: <StarFilled />,
        };
    }

    return {
        accent: primaryColor,
        soft: `${primaryColor}08`,
        border: `#fff7ed`,
        badge: primaryColor,
        icon: <TrophyOutlined />,
    };
}

function PrizeCard({item, index, primaryColor, accentTone, featured = false}) {
    // Moi the giai su dung palette theo thu hang; featured=true duoc dung cho giai nhat.
    const palette = getPrizePalette(index, primaryColor);
    const shineClass = featured ? "prize-bronze-shine prize-bronze-shine--featured" : "prize-bronze-shine";

    return (
        <div
            className={`rounded-[28px] border bg-white shadow-sm ${featured ? "p-6 md:p-7" : "p-5"}`}
            style={{
                borderColor: palette.border ,
                background: `repeating-linear-gradient(
                    -32deg,
                    rgba(255,255,255,0.06) 0,
                    rgba(255,255,255,0.06) 1px,
                    transparent 1px,
                    transparent 18px
                ), ${primaryColor}`,
            }}
        >
            <div className={`text-center ${featured ? "space-y-2" : "space-y-1"}`}>
                <div
                    style={{background: lightenColor(primaryColor, 0.2)}}
                    className="m-auto flex w-fit items-center justify-center gap-3 rounded-xl px-4 py-2 mb-3"
                >
                <div
                    className={`flex items-center justify-center gap-3 ${
                        featured ? "h-10 w-10 text-2xl" : "h-9 w-9 text-xl"
                    }`}
                    style={{
                        color:  "#ffffff",
                    }}
                >
                    {featured ? (
                        <Image
                            src="/award.png"
                            alt="Award"
                            width={featured ? 40 : 36}
                            height={featured ? 40 : 36}
                        />
                    ) : <TrophyOutlined />}
                </div>
                    <Title
                        level={featured ? 2 : 4}
                        className={`mb-0! font-bold! text-white! ${
                            featured ? "md:text-2xl!" : "text-xl!"
                        }`}
                    >
                        <span className={shineClass}>
                            {formatNumberText(item.soLuong || 0)} {item.tenGiai || `Giải ${index + 1}`}
                        </span>
                    </Title>
                </div>

                <div>
                    <div
                        className={`font-bold leading-none ${featured ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"}`}
                    >
                        <span className={shineClass}>
                            {item.triGia ? formatNumberText(item.triGia) : "Đang cập nhật"} đồng
                        </span>
                    </div>
                </div>
                {item.ghiChu ? (
                    <Paragraph className={`mx-auto! mb-0! max-w-2xl! text-white! ${featured ? "!text-base !leading-8" : "!text-sm !leading-7"}`}>
                        {item.ghiChu}
                    </Paragraph>
                ) : null}
            </div>
        </div>
    );
}

function PrizeGroup({
    title,
    items,
    primaryColor,
    accentTone,
}) {
    if (!items.length) {
        return null;
    }

    const titleBackground = darkenColor(primaryColor, 0.16);

    // Giai dau tien trong tung nhom duoc render thanh hero card full ngang.
    const remainingItems = items.slice(1);

    return (
        <section className="space-y-5" >
            <div className="flex items-center gap-4"> 
                <div className="text-center! m-auto">
                    <Title level={3} style={{
                        background: `linear-gradient(135deg, ${darkenColor(titleBackground, 0.08)} 0%, ${lightenColor(titleBackground, 0.16)} 24%, rgba(255,255,255,0.34) 50%, ${lightenColor(titleBackground, 0.14)} 72%, ${darkenColor(titleBackground, 0.18)} 100%)`,
                        width: 'fit-content',
                        boxShadow: `0 14px 28px ${lightenColor(primaryColor, 0.12)}55`,
                    }} className="mb-0! mt-1! border border-[#fdf6b3] text-3xl font-bold text-[#fdf6b3]! px-5 py-3 rounded-full uppercase tracking-[0.16em]">
                        {title}
                    </Title>
                </div>
            </div>

            <div className="space-y-4">
                {items[0] ? (
                    <PrizeCard
                        key={items[0].id}
                        item={items[0]}
                        index={0}
                        primaryColor={primaryColor}
                        accentTone={accentTone}
                        featured
                    />
                ) : null}

                {/* Cac giai con lai tu dong dan cot theo chieu ngang de tan dung khong gian. */}
                {remainingItems.length > 0 ? (
                    <div
                        className="grid gap-4"
                        style={{
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        }}
                    >
                        {remainingItems.map((item, index) => (
                            <PrizeCard
                                key={item.id}
                                item={item}
                                index={index + 1}
                                primaryColor={primaryColor}
                                accentTone={accentTone}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export default function GiaiThuongCuocThi({demoData = null, giaiTapTheRef = null}) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const {token} = theme.useToken();

    useEffect(() => {
        if (demoData) {
            setData(demoData);
            setLoading(false);
            return undefined;
        }

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
    }, [demoData]);

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
        <div className="space-y-8!">
        <Card
            className="overflow-hidden rounded-3xl! border border-slate-200 shadow-sm"
            styles={{body: {padding: 24, background: `repeating-linear-gradient(-32deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px), ${token.colorPrimary}`}}}
            loading={loading}
        >
                    {/* Nhom giai ca nhan */}
                    <PrizeGroup
                        title="Giải cá nhân"
                        subtitle="Danh sách giải dành cho thí sinh tham gia cuộc thi."
                        icon={<UserOutlined />}
                        items={data?.giaiCaNhan || []}
                        primaryColor={token.colorPrimary}
                        accentTone={`${token.colorPrimary}08`}
                        iconTone={{
                            background: `${token.colorPrimary}14`,
                            color: token.colorPrimary,
                        }}
                    />
            
        </Card>
        <div ref={giaiTapTheRef}>
            <Card
                className="overflow-hidden rounded-3xl! border border-slate-200 shadow-sm"
                styles={{body: {padding: 24, background: `repeating-linear-gradient(-32deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px), ${token.colorPrimary}`}}}
                loading={loading}
            >
                {/* Nhom giai tap the */}
                <PrizeGroup
                    title="Giải tập thể"
                    subtitle="Danh sách giải dành cho cơ quan, đơn vị hoặc tập thể tham gia."
                    icon={<TeamOutlined />}
                    items={data?.giaiTapThe || []}
                    primaryColor={token.colorPrimary}
                    accentTone={`${token.colorPrimary}08`}
                    iconTone={{
                        background: "#ffedd5",
                        color: "#d97706",
                    }}
                />
            </Card>
        </div>
        {!hasPrize ? (
                    <div className="flex min-h-[10rem] items-center justify-center rounded-[24px] bg-slate-50">
                        <Empty description="Chưa có cơ cấu giải thưởng được cập nhật"/>
                    </div>
                ) : null}
        </div>
    );
}
