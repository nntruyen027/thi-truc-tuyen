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


    const load = async () => {

        const res =
            await layCauHinh(
                "document"
            );

        if (!res.data) return;

        const val =
            JSON.parse(
                res.data.gia_tri
            );

        setDocs(val || []);

    };


    useEffect(() => {
        load();
    }, []);


    if (!docs.length)
        return null;


    return (
        <Card id={'document'}
              bodyStyle={{padding: 0}}
              title={<Typography.Title style={{
                  color: token.colorPrimary,
                  margin: "12px"
              }} className={'text-center uppercase'}>{'Tài liệu'}</Typography.Title>}>
        <Collapse
            accordion={false}
        >

            {docs.map((d) => (

                <Panel
                    header={d.tieuDe}
                    key={d.id}
                >

                    {d.url && (

                        <iframe
                            src={
                                getPublicFileUrl(
                                    d.url
                                ) +
                                "#zoom=100&navpanes=0"
                            }
                            width="100%"
                            height="800"
                            style={{
                                border: "none"
                            }}
                        />

                    )}

                </Panel>

            ))}

        </Collapse>
            </Card>

    );

}