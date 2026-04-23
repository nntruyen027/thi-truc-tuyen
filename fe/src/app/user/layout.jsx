'use client'

import {Layout, theme} from 'antd'
import {useEffect, useState} from "react";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import dayjs from "dayjs";
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";

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

    return <Layout className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_28%,#f8fafc_100%)]">
            <UserInteractionGuard blockDevTools disableCopy />
            <div
                style={{
                    color:'white',
                    background: `linear-gradient(135deg, ${colorPrimary} 0%, #2563eb 55%, #60a5fa 100%)`
                }}
                className="relative overflow-hidden px-4 py-5 shadow-sm sm:px-6 lg:px-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.16),_transparent_26%)]" />
                    <div className="relative mx-auto max-w-7xl text-center">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                        Cuộc thi hiện tại
                    </div>
                    <div
                        className="mt-1 text-lg font-bold md:text-2xl"
                    >
                        {dotThi?.cuoc_thi?.ten || "Chưa có cuộc thi diễn ra"}
                    </div>
                    <div className="mt-1 text-sm font-semibold md:text-base">
                        {dotThi?.cuoc_thi?.thoi_gian_bat_dau
                            ? `${dayjs(dotThi.cuoc_thi.thoi_gian_bat_dau).format("DD/MM/YYYY HH:mm:ss")} - ${dayjs(dotThi.cuoc_thi.thoi_gian_ket_thuc).format("DD/MM/YYYY HH:mm:ss")}`
                            : "Thông tin thời gian sẽ được cập nhật khi có đợt thi."}
                    </div>
                    </div>
                </div>
        <Layout.Content className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</Layout.Content>
        <Footer/>
        </Layout>
}
