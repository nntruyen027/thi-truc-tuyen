'use client'

import {Col, Row} from "antd"
import BannerEditor from "~/app/admin/cai-dat-chung/BannerEditor";
import {useEffect} from "react";
import {usePageInfoStore} from "~/store/page-info";
import CotChanTrang from "~/app/admin/cai-dat-chung/CotChanTrang";
import BanQuyen from "~/app/admin/cai-dat-chung/VanBanBanQuyen";
import FaviconEditor from "~/app/admin/cai-dat-chung/FaviconEditor";
import FooterMetaEditor from "~/app/admin/cai-dat-chung/FooterMetaEditor";

export default function CaiDatChung() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo);

    useEffect(() => {


        setPageInfo({
            title: "Cài đặt chung"
        });

    }, []);


    return (
        <Row gutter={[16,16]}>
            <Col md={24} lg={12}>
                <BannerEditor
                    title="Banner Desktop (16:3)"
                    khoa="banner_desktop"
                    aspectRatio={"16/3"}
                />
            </Col>

            <Col md={24} lg={12}>
                <BannerEditor
                    title="Banner Mobile (16:9)"
                    khoa="banner_mobile"
                />
            </Col>
            <Col md={24} lg={12}>
                <FaviconEditor />
            </Col>

            <Col md={24} lg={12}>
                <FooterMetaEditor />
            </Col>

            <Col md={24} lg={12}>
                <CotChanTrang
                    tieuDe={"Cột chân trang trái"}
                    khoa={"left_footer"}
                />
            </Col>

            <Col md={24} lg={12}>
                <CotChanTrang
                    tieuDe={"Cột chân trang phải"}
                    khoa={"right_footer"}
                />
            </Col>
            <Col md={24} lg={24}>
                <BanQuyen/>
            </Col>
        </Row>


    )

}


