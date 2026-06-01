'use client';

import {useEffect, useState} from "react";
import {Card, theme} from "antd";
import {alphaColor, darkenColor} from "~/utils/workspaceTheme";

export default function CountDown({time}) {

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const titleBackground = darkenColor(colorPrimary, 0.18);
    const [t, setT] = useState(time);

    useEffect(() => {
        setT(time);
    }, [time]);

    useEffect(() => {
        if (!time) {
            return undefined;
        }

        const timer = setInterval(() => {

            setT(prev => {

                if (!prev) return prev;

                const {
                    dem_nguoc,
                    thang,
                    tuan,
                    ngay,
                    gio,
                    phut,
                    giay
                } = prev;

                let nextThang = thang ?? 0;
                let nextTuan = tuan ?? 0;
                let nextNgay = ngay ?? 0;
                let nextGio = gio ?? 0;
                let nextPhut = phut ?? 0;
                let nextGiay = giay ?? 0;


                if (
                    nextThang === 0 &&
                    nextTuan === 0 &&
                    nextNgay === 0 &&
                    nextGio === 0 &&
                    nextPhut === 0 &&
                    nextGiay === 0
                ) {
                    return prev;
                }


                nextGiay--;

                if (nextGiay < 0) {
                    nextGiay = 59;
                    nextPhut--;
                }

                if (nextPhut < 0) {
                    nextPhut = 59;
                    nextGio--;
                }

                if (nextGio < 0) {
                    nextGio = 23;
                    nextNgay--;
                }

                if (nextNgay < 0) {
                    nextNgay = 6;
                    nextTuan--;
                }

                if (nextTuan < 0) {
                    nextTuan = 3;
                    nextThang--;
                }

                return {
                    ...prev,
                    dem_nguoc,
                    thang: nextThang,
                    tuan: nextTuan,
                    ngay: nextNgay,
                    gio: nextGio,
                    phut: nextPhut,
                    giay: nextGiay,
                };

            });

        }, 1000);

        return () => clearInterval(timer);

    }, [time]);


    if (!t) return null;


    const tongNgay =
        (t.thang || 0) * 30
        + (t.tuan || 0) * 7
        + (t.ngay || 0);

    const blocks = [
        {label: "Ngày", value: tongNgay},
        {label: "Giờ", value: t.gio},
        {label: "Phút", value: t.phut},
        {label: "Giây", value: t.giay},
    ];


    return (
        <div
            className="overflow-hidden rounded-[10px]! border bg-white text-center shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
            style={{borderColor: alphaColor(colorPrimary, 0.14)}}
        >
            <h3 style={{
                background: titleBackground,
                margin: '0'
            }} className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white md:text-base">
                {t?.moc_thoi_gian === "bat_dau" || t?.dem_nguoc === false
                    ? "Cuộc thi sắp diễn ra"
                    : "Thời gian còn lại của cuộc thi"}
            </h3>

            <div
                className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4"
                style={{background: alphaColor(colorPrimary, 0.05)}}
            >
                {blocks.map((block) => (
                    <Card
                        key={block.label}
                        styles={{body: {padding: 14}}}
                        className="w-full rounded-[16px] text-center shadow-sm"
                        style={{
                            color: colorPrimary,
                            borderColor: alphaColor(colorPrimary, 0.1),
                            background: "#ffffff",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: '"Aptos", "Segoe UI", Inter, "Helvetica Neue", Arial, sans-serif',
                                fontSize: 56,
                                fontWeight: 700,
                                lineHeight: 1,
                                letterSpacing: "-0.02em",
                                fontVariantNumeric: "tabular-nums lining-nums",
                                fontFeatureSettings: '"tnum" 1, "lnum" 1',
                            }}
                        >
                            {block.value}
                        </div>
                        <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                            {block.label}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

}
