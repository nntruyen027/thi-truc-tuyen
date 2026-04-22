'use client';

import {useEffect, useState} from "react";
import {Card, theme} from "antd";

export default function CountDown({seconds, onEnd}) {

    const {token} = theme.useToken();

    const {colorPrimary} = token;

    const [t, setT] = useState(seconds);


    useEffect(() => {

        if (!seconds) return;

        const timer = setInterval(() => {

            setT(prev => {

                if (prev <= 0) {

                    clearInterval(timer);

                    onEnd?.();

                    return 0;

                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(timer);

    }, [seconds]);


    const gio = Math.floor(t / 3600);
    const phut = Math.floor((t % 3600) / 60);
    const giay = t % 60;


    return (

        <div className="flex gap-2">

            <Card size="small">
                <div className="text-2xl font-bold text-center">
                    {gio}
                </div>
                Giờ
            </Card>

            <Card size="small">
                <div className="text-2xl font-bold text-center">
                    {phut}
                </div>
                Phút
            </Card>

            <Card size="small">
                <div className="text-2xl font-bold text-center">
                    {giay}
                </div>
                Giây
            </Card>

        </div>

    );

}