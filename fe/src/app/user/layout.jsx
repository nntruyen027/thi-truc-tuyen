'use client'

import {Layout, theme} from 'antd'
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import dayjs from "dayjs";
import Footer from "~/app/components/public/Footer";

export default function UserLayout({children}) {
    const [dotThi, setDotThi] = useState(null);


    // tab đang chọn

    const {token} = theme.useToken()
    const {colorPrimary} = token
    const route = useRouter()


    const load = async () => {


        const resDotThi = await layDotThiHienTai()

        if (!resDotThi.data) return;



        setDotThi(resDotThi.data);
    };


    useEffect(() => {

        load();

        const onResize = () => {
            load();
        };

        window.addEventListener(
            "resize",
            onResize
        );

        return () =>
            window.removeEventListener(
                "resize",
                onResize
            );

    }, []);

    return <Layout>
            <div
                style={{
                    color:'white',
                    background: colorPrimary
                }}
                className={'p-3'}>
                    <div
                        className={'text-center font-bold'}
                    >
                        {dotThi?.cuoc_thi?.ten}
                    </div>
                    <div className={'text-center font-semibold'}>
                        {dayjs(dotThi?.cuoc_thi?.thoi_gian_bat_dau).format("DD/MM/YYYY hh:mm:ss")}
                        {" - "}
                        {dayjs(dotThi?.cuoc_thi?.thoi_gian_ket_thuc).format("DD/MM/YYYY hh:mm:ss")}
                    </div>
                </div>
        <Layout.Content>{children}</Layout.Content>
        <Footer/>
        </Layout>
}