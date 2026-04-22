'use client';

import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";
import {getPublicFileUrl} from "~/services/file";
import {Card, theme, Typography} from "antd";

export default function TaiLieu({title, khoa, id =''}) {
    const [url, setUrl] = useState("");
    const {token} = theme.useToken()

    useEffect(() => {
        let active = true;

        const load = async () => {

            const res =
                await layCauHinh(khoa);


            if (!active || !res.data) return;


            const val =
                JSON.parse(
                    res.data.gia_tri
                );

            setUrl(val.url)

        };

        void load()

        return () => {
            active = false;
        };
    }, [khoa])

    return (
        <Card
            id={id}
            className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
            styles={{body: {padding: 0}}}
            title={<Typography.Title style={{
                color: token.colorPrimary,
                margin: "12px"
            }} className={'text-center text-xl uppercase md:text-2xl'}>{title}</Typography.Title>}
        >


        {url && (
            <iframe
                src={
                    getPublicFileUrl(
                        url
                    )+ "#zoom=100&navpanes=0"
                }
                width="100%"
                height="100%"
                style={{
                    margin: 0,
                    border: 0,
                    height: "min(75vh, 800px)",
                    minHeight: "420px"
                }}
            />

        )}
    </Card>)
}
