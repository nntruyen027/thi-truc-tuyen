'use client';

import {useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import {Avatar, Card, Empty, Image, List, Typography} from "antd";
import {CalendarOutlined, FileTextOutlined} from "@ant-design/icons";
import {layDanhSachBaiViet} from "~/services/bai-viet";
import {getPublicFileUrl} from "~/services/file";

const {Paragraph, Text, Title} = Typography;

function transformNoiDungHtml(html = "") {
    return html.replace(
        /(<img[^>]+src=["'])(?!https?:\/\/|data:|blob:)([^"']+)(["'])/gi,
        (_, prefix, path, suffix) => `${prefix}${getPublicFileUrl(path)}${suffix}`
    );
}

function stripHtml(html = "") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function BaiVietCuocThi() {
    const [loading, setLoading] = useState(true);
    const [danhSach, setDanhSach] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                const result = await layDanhSachBaiViet({
                    chiHienThi: true,
                    size: 100,
                });
                const items = result.data || [];

                if (!active) {
                    return;
                }

                setDanhSach(items);
                setActiveId(items[0]?.id || null);
            } catch {
                if (active) {
                    setDanhSach([]);
                    setActiveId(null);
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

    const activeBaiViet = useMemo(
        () => danhSach.find((item) => item.id === activeId) || danhSach[0] || null,
        [activeId, danhSach]
    );

    if (!loading && !danhSach.length) {
        return (
            <Card
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
                styles={{body: {padding: 32}}}
            >
                <Empty description="Chưa có bài viết nào được cập nhật"/>
            </Card>
        );
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Card
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
                styles={{body: {padding: 0}}}
                title={
                    <Title level={3} className="!mb-0 !text-center !text-xl !font-bold uppercase !text-[#1948be]">
                        Bài viết
                    </Title>
                }
                loading={loading}
            >
                <List
                    dataSource={danhSach}
                    renderItem={(item) => {
                        const isActive = item.id === activeBaiViet?.id;

                        return (
                            <List.Item
                                className={`cursor-pointer px-5 py-4 transition ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}`}
                                onClick={() => setActiveId(item.id)}
                            >
                                <div className="flex w-full items-start gap-4">
                                    <Avatar
                                        shape="square"
                                        size={72}
                                        src={item.anhDaiDien ? getPublicFileUrl(item.anhDaiDien) : null}
                                        icon={<FileTextOutlined/>}
                                        className="!rounded-2xl !bg-slate-100"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 line-clamp-2 text-base font-semibold text-slate-900">
                                            {item.tieuDe}
                                        </div>
                                        <Text className="!mb-2 !flex !items-center !gap-2 !text-xs !uppercase !tracking-[0.16em] !text-slate-400">
                                            <CalendarOutlined/>
                                            {dayjs(item.ngayDang).format("DD/MM/YYYY HH:mm")}
                                        </Text>
                                        <Paragraph className="!mb-0 line-clamp-3 !text-sm !leading-6 !text-slate-500">
                                            {item.tomTat || stripHtml(item.noiDung)}
                                        </Paragraph>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Card>

            <Card
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
                styles={{body: {padding: 0}}}
                loading={loading}
            >
                {activeBaiViet ? (
                    <div>
                        {activeBaiViet.anhDaiDien && (
                            <div className="aspect-[16/7] w-full overflow-hidden bg-slate-100">
                                <Image
                                    src={getPublicFileUrl(activeBaiViet.anhDaiDien)}
                                    alt={activeBaiViet.tieuDe}
                                    preview={false}
                                    width="100%"
                                    height="100%"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-5 px-5 py-6 md:px-8 md:py-8">
                            <div className="space-y-3">
                                <Title level={2} className="!mb-0 !text-2xl !font-bold !text-slate-900 md:!text-3xl">
                                    {activeBaiViet.tieuDe}
                                </Title>
                                <Text className="!flex !items-center !gap-2 !text-sm !text-slate-400">
                                    <CalendarOutlined/>
                                    {dayjs(activeBaiViet.ngayDang).format("DD/MM/YYYY HH:mm")}
                                </Text>
                                {activeBaiViet.tomTat && (
                                    <Paragraph className="!mb-0 !text-base !leading-7 !text-slate-500">
                                        {activeBaiViet.tomTat}
                                    </Paragraph>
                                )}
                            </div>

                            <div
                                className="max-w-none text-base leading-8 text-slate-700"
                                dangerouslySetInnerHTML={{
                                    __html: transformNoiDungHtml(activeBaiViet.noiDung)
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-10">
                        <Empty description="Chưa có bài viết để hiển thị"/>
                    </div>
                )}
            </Card>
        </div>
    );
}
