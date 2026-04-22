'use client';

import {useEffect, useRef, useState} from "react";
import {Card, theme} from "antd";

export default function CountDown({seconds, onEnd}) {

    const {token} = theme.useToken();

    const {colorPrimary} = token;

    const [t, setT] = useState(seconds ?? 0);
    const [seed] = useState(seconds ?? 0);
    const onEndRef = useRef(onEnd);

    useEffect(() => {
        onEndRef.current = onEnd;
    }, [onEnd]);


    useEffect(() => {

        if (seed == null) return;

        const timer = setInterval(() => {

            setT(prev => {

                if (prev <= 0) {

                    clearInterval(timer);

                    onEndRef.current?.();

                    return 0;

                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(timer);

    }, [seed]);


    const total =
        Math.max(0, t || 0);

    const gio = Math.floor(total / 3600);
    const phut = Math.floor((total % 3600) / 60);
    const giay = total % 60;


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
