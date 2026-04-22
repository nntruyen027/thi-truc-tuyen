'use client';

import {Col, Layout, Row, Typography} from "antd";
import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";

export default function Footer() {
    const [leftFooter, setLeftFooter] = useState({
        tieuDe: "",
        noiDung: ""
    });

    const [rightFooter, setRightFooter] = useState({
        tieuDe: "",
        noiDung: ""
    });

    const [banQuyen, setBanQuyen] = useState("");


    useEffect(() => {
        let active = true;

        const load = async () => {
            const resBanQuyen =
                await layCauHinh('van-ban-ban-quyen')

            const resLeftFooter =
                await layCauHinh('left_footer')

            const resRightFooter =
                await layCauHinh('right_footer')


            // if (
            //     !resBanQuyen.data ||
            //     !resLeftFooter.data ||
            //     !resRightFooter.data
            // ) return;


            const valLeftFooter =
                JSON.parse(
                    resLeftFooter?.data?.gia_tri || 'null'
                )


            const valRightFooter =
                JSON.parse(
                    resRightFooter?.data?.gia_tri || 'null'
                )



            const valBanQuyen =
                resBanQuyen?.data?.gia_tri || ""

            if (!active) return;

            setBanQuyen(valBanQuyen)

            setLeftFooter({
                tieuDe: valLeftFooter?.tieuDe || '',
                noiDung: valLeftFooter?.noiDung || ''
            })

            setRightFooter({
                tieuDe: valRightFooter?.tieuDe || '',
                noiDung: valRightFooter?.noiDung || ''
            })

        };

        void load()

        return () => {
            active = false;
        };
    }, [])

    return (
        <Layout.Footer className="mt-10 border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
            <Row gutter={[24, 24]} >
                <Col xs={24} lg={12}>

                    <Typography.Title level={4} className="!mb-3">
                        {leftFooter.tieuDe}
                    </Typography.Title>

                    <div
                        className="font-semibold text-slate-600"
                        dangerouslySetInnerHTML={{
                            __html: leftFooter.noiDung
                        }}
                    />

                </Col>


                <Col xs={24} lg={12}>

                    <Typography.Title level={4} className="!mb-3">
                        {rightFooter.tieuDe}
                    </Typography.Title>

                    <div
                        className="font-semibold text-slate-600"
                        dangerouslySetInnerHTML={{
                            __html: rightFooter.noiDung
                        }}
                    />

                </Col>

            </Row>


            <div
                style={{
                    marginTop: 16,
                    textAlign: "center"
                }}
                className="border-t border-slate-200 pt-4 font-semibold text-slate-500"
                dangerouslySetInnerHTML={{
                    __html: banQuyen
                }}
            />
            </div>

        </Layout.Footer>
    )
}
