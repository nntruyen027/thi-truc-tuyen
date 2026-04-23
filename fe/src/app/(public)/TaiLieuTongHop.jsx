'use client';

import {useEffect, useMemo, useState} from "react";
import {Button, Card, Col, Empty, Row, Space, Tag, Typography} from "antd";
import {
    DownloadOutlined,
    EyeOutlined,
    FilePdfOutlined,
    FolderOpenOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import {layCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl} from "~/services/file";

const {Paragraph, Text, Title} = Typography;

function parseGiaTri(giaTri) {
    if (!giaTri) {
        return null;
    }

    try {
        return JSON.parse(giaTri);
    } catch {
        return null;
    }
}

function normalizeTaiLieu(item = {}, fallback = {}) {
    return {
        id: item.id || fallback.id,
        tieuDe: item.tieuDe || fallback.tieuDe || "",
        moTa: item.moTa || fallback.moTa || "",
        nhom: item.nhom || fallback.nhom || "Tài liệu",
        url: item.url || fallback.url || "",
    };
}

export default function TaiLieuTongHop() {
    const [loading, setLoading] = useState(true);
    const [taiLieu, setTaiLieu] = useState([]);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);

                const [resKeHoach, resTheLe, resKhac] = await Promise.all([
                    layCauHinh("ke_hoach"),
                    layCauHinh("the_le"),
                    layCauHinh("document"),
                ]);

                if (!active) {
                    return;
                }

                const dsTaiLieu = [
                    normalizeTaiLieu(parseGiaTri(resKeHoach.data?.gia_tri) || {}, {
                        id: "ke-hoach",
                        tieuDe: "Kế hoạch cuộc thi",
                        moTa: "Thông tin về tiến độ, các mốc triển khai và lịch trình chung của cuộc thi.",
                        nhom: "Tài liệu chính",
                    }),
                    normalizeTaiLieu(parseGiaTri(resTheLe.data?.gia_tri) || {}, {
                        id: "the-le",
                        tieuDe: "Thể lệ cuộc thi",
                        moTa: "Quy định tham gia, tiêu chí chấm điểm và các nguyên tắc cần lưu ý.",
                        nhom: "Tài liệu chính",
                    }),
                ];

                const valKhac = parseGiaTri(resKhac.data?.gia_tri);

                if (Array.isArray(valKhac)) {
                    valKhac.forEach((item, index) => {
                        dsTaiLieu.push(
                            normalizeTaiLieu(item, {
                                id: item.id || `tai-lieu-${index}`,
                                tieuDe: item.tieuDe || `Tài liệu ${index + 1}`,
                                moTa: "Tài liệu bổ sung phục vụ cuộc thi.",
                                nhom: "Tài liệu khác",
                            })
                        );
                    });
                }

                const keHoachUrl = parseGiaTri(resKeHoach.data?.gia_tri)?.url;
                const theLeUrl = parseGiaTri(resTheLe.data?.gia_tri)?.url;

                if (keHoachUrl) {
                    dsTaiLieu[0].url = keHoachUrl;
                }

                if (theLeUrl) {
                    dsTaiLieu[1].url = theLeUrl;
                }

                setTaiLieu(dsTaiLieu.filter((item) => item.url));
            } catch {
                if (active) {
                    setTaiLieu([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    const groupedTaiLieu = useMemo(() => {
        return taiLieu.reduce((acc, item) => {
            if (!acc[item.nhom]) {
                acc[item.nhom] = [];
            }

            acc[item.nhom].push(item);
            return acc;
        }, {});
    }, [taiLieu]);

    if (!loading && !taiLieu.length) {
        return (
            <Card
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
                styles={{body: {padding: 32}}}
            >
                <Empty description="Chưa có tài liệu được cập nhật"/>
            </Card>
        );
    }

    return (
        <Card
            className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
            styles={{body: {padding: 24}}}
            loading={loading}
        >
           
            <Space direction="vertical" size={20} className="!flex">
                {Object.entries(groupedTaiLieu).map(([nhom, items]) => (
                    <div key={nhom} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg text-[#1948be]">
                                <FolderOpenOutlined/>
                            </div>
                            <div>
                                <Text className="!block !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-slate-400">
                                    Nhóm tài liệu
                                </Text>
                                <Title level={4} className="!mb-0 !text-lg !font-bold !text-slate-900">
                                    {nhom}
                                </Title>
                            </div>
                        </div>

                        <Row gutter={[16, 16]}>
                            {items.map((item) => {
                                const fileUrl = getPublicFileUrl(item.url);

                                return (
                                    <Col xs={24} md={12} xl={8} key={item.id}>
                                        <Card
                                            className="h-full rounded-[28px] border border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                            styles={{body: {padding: 20, height: "100%"}}}
                                        >
                                            <div className="flex h-full flex-col gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
                                                        <FilePdfOutlined/>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Title level={5} className="!mb-1 !text-base !font-bold !text-slate-900">
                                                            {item.tieuDe}
                                                        </Title>
                                                        <Text className="!text-sm !text-slate-400">
                                                            File PDF
                                                        </Text>
                                                    </div>
                                                </div>

                                                <Paragraph className="!mb-0 flex-1 !text-sm !leading-7 !text-slate-500">
                                                    {item.moTa || "Tài liệu phục vụ cuộc thi."}
                                                </Paragraph>

                                                <Space wrap>
                                                    <Button
                                                        type="primary"
                                                        icon={<EyeOutlined/>}
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Mở tài liệu
                                                    </Button>

                                                    <Button
                                                        icon={<DownloadOutlined/>}
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download
                                                    >
                                                        Tải xuống
                                                    </Button>
                                                </Space>
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                ))}
            </Space>
        </Card>
    );
}
