'use client'

import {useEffect, useState} from "react";
import {Card, Collapse, theme, Typography} from "antd";
import {layCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl} from "~/services/file";
import PdfViewer from "~/app/components/common/PdfViewer";

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
                    <div className="p-1 sm:p-2">
                        <PdfViewer
                            url={getPublicFileUrl(d.url)}
                        />
                    </div>

                )   
            }))
            }
                />

        
        </Card>

    );

}
