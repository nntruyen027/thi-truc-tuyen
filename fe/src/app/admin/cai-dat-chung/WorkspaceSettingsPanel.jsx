'use client';

import {Alert, Col, Row} from "antd";
import BannerEditor from "~/app/admin/cai-dat-chung/BannerEditor";
import CotChanTrang from "~/app/admin/cai-dat-chung/CotChanTrang";
import BanQuyen from "~/app/admin/cai-dat-chung/VanBanBanQuyen";
import FaviconEditor from "~/app/admin/cai-dat-chung/FaviconEditor";
import FooterMetaEditor from "~/app/admin/cai-dat-chung/FooterMetaEditor";
import ColorThemeEditor from "~/app/admin/cai-dat-chung/ColorThemeEditor";
import UserProfileFieldsEditor from "~/app/admin/cai-dat-chung/UserProfileFieldsEditor";

export default function WorkspaceSettingsPanel({
    workspaceId = null,
    currentWorkspaceId = null,
}) {
    const canEditMedia =
        !workspaceId
        || !currentWorkspaceId
        || Number(workspaceId) === Number(currentWorkspaceId);

    return (
        <Row gutter={[16, 16]}>
            {!canEditMedia ? (
                <Col span={24}>
                    <Alert
                        type="warning"
                        showIcon
                        message="Workspace đang chọn khác workspace của domain hiện tại"
                        description="Bạn vẫn có thể xem cấu hình, nhưng các mục media như banner, favicon và tài liệu tải lên sẽ không nên cập nhật ở đây. Hãy mở đúng domain của workspace này để chỉnh media."
                    />
                </Col>
            ) : null}

            <Col md={24} lg={12}>
                <ColorThemeEditor workspaceId={workspaceId} />
            </Col>

            <Col md={24} lg={12}>
                <FaviconEditor workspaceId={workspaceId} disabled={!canEditMedia} />
            </Col>

            <Col md={24} lg={12}>
                <BannerEditor
                    title="Banner Desktop (16:4)"
                    khoa="banner_desktop"
                    aspectRatio="16/4"
                    workspaceId={workspaceId}
                    disabled={!canEditMedia}
                />
            </Col>

            <Col md={24} lg={12}>
                <BannerEditor
                    title="Banner Mobile (16:9)"
                    khoa="banner_mobile"
                    aspectRatio="16/9"
                    workspaceId={workspaceId}
                    disabled={!canEditMedia}
                />
            </Col>

            <Col md={24} lg={12}>
                <FooterMetaEditor workspaceId={workspaceId} />
            </Col>

            <Col md={24} lg={12}>
                <UserProfileFieldsEditor workspaceId={workspaceId} />
            </Col>

            <Col md={24} lg={12}>
                <CotChanTrang
                    tieuDe="Cột chân trang trái"
                    khoa="left_footer"
                    workspaceId={workspaceId}
                />
            </Col>

            <Col md={24} lg={12}>
                <CotChanTrang
                    tieuDe="Cột chân trang phải"
                    khoa="right_footer"
                    workspaceId={workspaceId}
                />
            </Col>

            <Col md={24} lg={24}>
                <BanQuyen workspaceId={workspaceId}/>
            </Col>
        </Row>
    );
}
