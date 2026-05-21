'use client';

import {useEffect, useState} from "react";
import {Button, Card, Empty, Space, Typography} from "antd";
import {
    DownloadOutlined,
    EyeOutlined,
    FilePdfOutlined,
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

export default function TaiLieuTongHop({demoData = null}) {
    const [loading, setLoading] = useState(true);
    const [taiLieu, setTaiLieu] = useState([]);

    useEffect(() => {
        if (Array.isArray(demoData)) {
            setTaiLieu(demoData);
            setLoading(false);
            return undefined;
        }

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
    }, [demoData]);

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
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                {taiLieu.map((item, index) => {
                    const fileUrl = typeof item.url === "string" && item.url.startsWith("/")
                        ? item.url
                        : getPublicFileUrl(item.url);
                    const isLast = index === taiLieu.length - 1;

                    return (
                        <div
                            key={item.id}
                            className={`flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:gap-6 ${
                                isLast ? "" : "border-b border-slate-200"
                            }`}
                        >
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg text-red-500">
                                    <FilePdfOutlined/>
                                </div>
                                <div className="min-w-0">
                                    <Title level={5} className="!mb-1 !text-base !font-bold !text-slate-900">
                                        {item.tieuDe}
                                    </Title>
                                    <Paragraph className="!mb-0 !text-sm !leading-7 !text-slate-500">
                                        {item.moTa || "Tài liệu phục vụ cuộc thi."}
                                    </Paragraph>
                                </div>
                            </div>

                            <Space wrap size={10} className="md:!shrink-0">
                                <Button
                                    type="link"
                                    icon={<EyeOutlined/>}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="!px-0 !font-semibold"
                                >
                                    Xem tài liệu
                                </Button>

                                <Button
                                    icon={<DownloadOutlined/>}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="!rounded-full"
                                >
                                    Tải xuống
                                </Button>
                            </Space>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
