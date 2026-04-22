'use client'

import {Layout, theme} from 'antd'
import {useEffect, useState} from "react";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import dayjs from "dayjs";
import Footer from "~/app/components/public/Footer";

export default function UserLayout({children}) {
    const [dotThi, setDotThi] = useState(null);

    const {token} = theme.useToken()
    const {colorPrimary} = token

    useEffect(() => {
        let active = true;

        const load = async () => {
            const resDotThi = await layDotThiHienTai()

            if (!active || !resDotThi.data) return;

            setDotThi(resDotThi.data);
        };

        void load();

        return () => {
            active = false;
        };

    }, []);

    return <Layout className="min-h-screen bg-slate-50">
            <div
                style={{
                    color:'white',
                    background: colorPrimary
                }}
                className="px-4 py-4 shadow-sm sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl text-center">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                        Cuộc thi hiện tại
                    </div>
                    <div
                        className="mt-1 text-lg font-bold md:text-2xl"
                    >
                        {dotThi?.cuoc_thi?.ten}
                    </div>
                    <div className="mt-1 text-sm font-semibold md:text-base">
                        {dayjs(dotThi?.cuoc_thi?.thoi_gian_bat_dau).format("DD/MM/YYYY hh:mm:ss")}
                        {" - "}
                        {dayjs(dotThi?.cuoc_thi?.thoi_gian_ket_thuc).format("DD/MM/YYYY hh:mm:ss")}
                    </div>
                    </div>
                </div>
        <Layout.Content className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</Layout.Content>
        <Footer/>
        </Layout>
}
