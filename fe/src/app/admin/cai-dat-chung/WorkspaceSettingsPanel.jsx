'use client';

import {Col, Row} from "antd";
import BannerEditor from "~/app/admin/cai-dat-chung/BannerEditor";
import CotChanTrang from "~/app/admin/cai-dat-chung/CotChanTrang";
import BanQuyen from "~/app/admin/cai-dat-chung/VanBanBanQuyen";
import FaviconEditor from "~/app/admin/cai-dat-chung/FaviconEditor";
import FooterMetaEditor from "~/app/admin/cai-dat-chung/FooterMetaEditor";
import ColorThemeEditor from "~/app/admin/cai-dat-chung/ColorThemeEditor";
import UserProfileFieldsEditor from "~/app/admin/cai-dat-chung/UserProfileFieldsEditor";

export default function WorkspaceSettingsPanel() {
    return (
        <Row gutter={[16, 16]}>
            <Col md={24} lg={12}>
                <ColorThemeEditor />
            </Col>

            <Col md={24} lg={12}>
                <FaviconEditor />
            </Col>

            <Col md={24} lg={12}>
                <BannerEditor
                    title="Banner Desktop (16:4)"
                    khoa="banner_desktop"
                    aspectRatio="16/4"
                />
            </Col>

            <Col md={24} lg={12}>
                <BannerEditor
                    title="Banner Mobile (16:9)"
                    khoa="banner_mobile"
                    aspectRatio="16/9"
                />
            </Col>

            <Col md={24} lg={12}>
                <FooterMetaEditor />
            </Col>

            <Col md={24} lg={12}>
                <UserProfileFieldsEditor />
            </Col>

            <Col md={24} lg={12}>
                <CotChanTrang
                    tieuDe="Cột chân trang trái"
                    khoa="left_footer"
                />
            </Col>

            <Col md={24} lg={12}>
                <CotChanTrang
                    tieuDe="Cột chân trang phải"
                    khoa="right_footer"
                />
            </Col>

            <Col md={24} lg={24}>
                <BanQuyen/>
            </Col>
        </Row>
    );
}
