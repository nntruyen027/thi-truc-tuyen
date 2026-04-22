'use client'

import {useEffect, useState} from "react";
import {Card, Collapse, theme, Typography} from "antd";
import {layCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl} from "~/services/file";

const {Panel} = Collapse;

export default function TaiLieuKhac() {

    const [docs, setDocs] =
        useState([]);
    const {token} = theme.useToken();

    useEffect(() => {
        let active = true;

        const load = async () => {

            const res =
                await layCauHinh(
                    "document"
                );

            if (!active || !res.data) return;

            const val =
                JSON.parse(
                    res.data.gia_tri
                );

            setDocs(val || []);

        };

        void load();

        return () => {
            active = false;
        };
    }, []);


    if (!docs.length)
        return null;


    return (
        <Card
            id={'document'}
            className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
            styles={{body:{padding: 0}}}
            title={<Typography.Title style={{
                  color: token.colorPrimary,
                  margin: "12px"
              }} className={'text-center text-xl uppercase md:text-2xl'}>{'Tài liệu'}</Typography.Title>}
        >
        <Collapse
            accordion={false}
            className="border-0"
            items={docs.map((d) => ({
                key: d.id,
                label: d.tieuDe,
                children: d.url && (

                    <iframe
                        src={
                            getPublicFileUrl(
                                d.url
                            ) +
                            "#zoom=100&navpanes=0"
                        }
                        width="100%"
                        height="100%"
                        style={{
                            border: "none",
                            height: "min(75vh, 800px)",
                            minHeight: "420px"
                        }}
                    />

                )   
            }))
            }
                />

        
        </Card>

    );

}
