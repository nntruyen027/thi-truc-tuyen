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


    const pad = (v) =>
        String(v).padStart(2, "0");


    return (
        <div className={'flex flex-col text-center pb-3 m-0 text-lg mt-3 rounded-2xl overflow-hidden'}>
            <h3 style={{
                background: colorPrimary,
                margin: '0'
            }} className={'text-white p-3 uppercase'}>Thời gian còn lại của cuộc thi</h3>

            <div
                className="
                p-10
            w-full
            text-center
            font-bold
            flex
            justify-center
            gap-2
            bg-gray-200
        "

            >

                {t.thang > 0 &&
                    <Card style={{
                        width: "6rem",
                        color: colorPrimary
                    }}>
                        <div style={{fontFamily: "Roboto", fontSize: 50}}>{t.thang}</div>
                        <div className={'uppercase'}>tháng</div>
                    </Card>}

                {(t.tuan > 0 || t.thang> 0) &&
                    <Card style={{
                        width: "6rem",
                        color: colorPrimary
                    }}>
                        <div style={{fontFamily: "Roboto", fontSize: 50}}>{t.tuan}</div>
                        <div className={'uppercase'}>Tuần</div>
                    </Card>}

                {(t.ngay > 0 || t.tuan > 0 || t.thang> 0) &&
                    <Card style={{
                        width: "6rem",
                        color: colorPrimary
                    }}>
                        <div style={{fontFamily: "Roboto", fontSize: 50}}>{t.ngay}</div>
                        <div className={'uppercase'}>Ngày</div>
                    </Card>}

                <Card style={{
                    width: "6rem",
                    color: colorPrimary
                }}>
                    <div style={{fontFamily: "Roboto", fontSize: 50}}>{t.gio}</div>
                    <div className={'uppercase'}>Giờ</div>
                </Card>

                <Card style={{
                    width: "6rem",
                    color: colorPrimary
                }}>
                    <div style={{fontFamily: "Roboto", fontSize: 50}}>{t.phut}</div>
                    <div className={'uppercase'}>Phút</div>
                </Card>

                <Card style={{
                    width: "6rem",
                    color: colorPrimary
                }}>
                    <div style={{fontFamily: "Roboto", fontSize: 50}}>{t.giay}</div>
                    <div className={'uppercase'}>Giây</div>
                </Card>

            </div>
        </div>
    );

}