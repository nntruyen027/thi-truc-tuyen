'use client';

import {Col, Layout, Row, theme, Typography} from "antd";
import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";

export default function Footer() {
    const {token} = theme.useToken();


    const [leftFooter, setLeftFooter] = useState({
        tieuDe: "",
        noiDung: ""
    });

    const [rightFooter, setRightFooter] = useState({
        tieuDe: "",
        noiDung: ""
    });

    const [banQuyen, setBanQuyen] = useState("");


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
                resBanQuyen.data.gia_tri


            setBanQuyen(valBanQuyen)

            setLeftFooter({
                tieuDe: valLeftFooter?.tieuDe || '',
                noiDung: valLeftFooter?.noiDung || ''
            })

            setRightFooter({
                tieuDe: valRightFooter?.tieuDe || '',
                noiDung: valRightFooter?.noiDung || ''
            })

        }


        useEffect(() => {
            load()
        }, [])

    return (
        <Layout.Footer className={'mt-10'}>

            <Row gutter={[16, 16]} >

                <Col md={24} lg={12}>

                    <Typography.Title level={4} >
                        {leftFooter.tieuDe}
                    </Typography.Title>

                    <div
                        className={'font-semibold'}
                        dangerouslySetInnerHTML={{
                            __html: leftFooter.noiDung
                        }}
                    />

                </Col>


                <Col md={24} lg={12}>

                    <Typography.Title level={4}>
                        {rightFooter.tieuDe}
                    </Typography.Title>

                    <div
                        className={'font-semibold'}
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
                className={'font-semibold'}
                dangerouslySetInnerHTML={{
                    __html: banQuyen
                }}
            />

        </Layout.Footer>
    )
}