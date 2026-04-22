'use client';

import {useEffect, useState} from "react";
import {Card, theme} from "antd";

export default function CountDown({time}) {

    const {token} = theme.useToken();
    const {colorPrimary} = token;
    const [t, setT] = useState(time);

    useEffect(() => {

        const timer = setInterval(() => {

            setT(prev => {

                if (!prev) return prev;

                let {
                    thang,
                    tuan,
                    ngay,
                    gio,
                    phut,
                    giay
                } = prev;


                if (
                    thang === 0 &&
                    tuan === 0 &&
                    ngay === 0 &&
                    gio === 0 &&
                    phut === 0 &&
                    giay === 0
                ) {
                    return prev;
                }


                giay--;

                if (giay < 0) {
                    giay = 59;
                    phut--;
                }

                if (phut < 0) {
                    phut = 59;
                    gio--;
                }

                if (gio < 0) {
                    gio = 23;
                    ngay--;
                }

                if (ngay < 0) {
                    ngay = 6;
                    tuan--;
                }

                if (tuan < 0) {
                    tuan = 3;
                    thang--;
                }

                return {
                    thang,
                    tuan,
                    ngay,
                    gio,
                    phut,
                    giay
                };

            });

        }, 1000);

        return () => clearInterval(timer);

    }, []);


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
        <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-sm">
            <h3 style={{
                background: colorPrimary,
                margin: '0'
            }} className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white md:text-base">
                Thời gian còn lại của cuộc thi
            </h3>

            <div
                className="grid grid-cols-2 gap-3 bg-slate-100 p-4 md:grid-cols-4"
            >
                {blocks.map((block) => (
                    <Card
                        key={block.label}
                        styles={{body: {padding: 14}}}
                        className="w-full rounded-2xl border-none text-center shadow-sm"
                        style={{color: colorPrimary}}
                    >
                        <div style={{fontFamily: "Roboto", fontSize: 40, lineHeight: 1}}>{block.value}</div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {block.label}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

}
