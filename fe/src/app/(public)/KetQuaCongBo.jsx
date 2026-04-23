'use client';

import {useEffect, useMemo, useState} from "react";
import {Card, Empty, Segmented, Spin, Table, Tag, Typography} from "antd";
import {TrophyOutlined} from "@ant-design/icons";

import {
    xepHangTracNghiemTheoCuocThi,
    xepHangTracNghiemTheoDotThi
} from "~/services/thi/thi";

const {Text, Title} = Typography;

function getThiSinh(record) {
    return record?.thiSinh || record?.thi_sinh || null;
}

function getBaiThiId(record) {
    return record?.baiThiId || record?.bai_thi_id || null;
}

function getThoiGian(record) {
    return record?.thoiGian ?? record?.thoi_gian ?? null;
}

function formatDuration(seconds, maxMinutes) {
    if (seconds == null) {
        return "-";
    }

    const maxSeconds =
        maxMinutes ? maxMinutes * 60 : seconds;

    const total =
        Math.min(seconds, maxSeconds);

    const minutes = Math.floor(total / 60);
    const secs = total % 60;

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export default function KetQuaCongBo({dotThi}) {
    const [scope, setScope] = useState("dot-thi");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const choPhepCongBo =
        !!dotThi?.cuoc_thi?.cho_phep_xem_lich_su;

    useEffect(() => {
        if (!dotThi?.id || !choPhepCongBo) {
            setData([]);
            return;
        }

        let active = true;

        const load = async () => {
            setLoading(true);

            try {
                const res =
                    scope === "cuoc-thi"
                        ? await xepHangTracNghiemTheoCuocThi(dotThi.cuoc_thi_id, 10)
                        : await xepHangTracNghiemTheoDotThi(dotThi.id, 10);

                if (!active) {
                    return;
                }

                setData(res || []);
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
    }, [choPhepCongBo, dotThi?.cuoc_thi_id, dotThi?.id, scope]);

    const topThree =
        useMemo(() => data.slice(0, 3), [data]);

    const columns = [
        {
            title: "Hạng",
            width: 72,
            align: "center",
            render: (_, __, index) => (
                <Tag color={index < 3 ? "gold" : "blue"}>
                    #{index + 1}
                </Tag>
            )
        },
        {
            title: "Thí sinh",
            render: (_, record) => getThiSinh(record)?.hoTen || getThiSinh(record)?.ho_ten || "-"
        },
        {
            title: "Điểm",
            dataIndex: "diem",
            align: "center"
        },
        {
            title: "Thời gian",
            align: "center",
            render: (_, record) => formatDuration(getThoiGian(record), dotThi?.thoi_gian_thi)
        }
    ];

    if (!choPhepCongBo) {
        return (
            <Card className="rounded-3xl border border-dashed border-slate-300 shadow-sm">
                <div className="py-10 text-center">
                    <Title level={4} className="!mb-2 !text-slate-800">
                        Kết quả chưa được công bố
                    </Title>
                    <Text className="!text-slate-500">
                        Ban tổ chức chưa mở quyền xem lịch sử và bảng xếp hạng cho cuộc thi này.
                    </Text>
                </div>
            </Card>
        );
    }

    return (
        <Card className="rounded-3xl border border-slate-200 shadow-sm" styles={{body: {padding: 24}}}>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <Text className="!text-xs !font-semibold !uppercase !tracking-[0.22em] !text-blue-700">
                        Công bố kết quả
                    </Text>
                    <Title level={3} className="!mb-0 !mt-1">
                        Bảng xếp hạng nổi bật
                    </Title>
                </div>

                <Segmented
                    value={scope}
                    onChange={setScope}
                    options={[
                        {label: "Theo đợt thi", value: "dot-thi"},
                        {label: "Theo cuộc thi", value: "cuoc-thi"},
                    ]}
                />
            </div>

            {loading ? (
                <div className="flex min-h-60 items-center justify-center">
                    <Spin size="large" />
                </div>
            ) : !data.length ? (
                <Empty description="Chưa có dữ liệu kết quả" />
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {topThree.map((item, index) => (
                            <div
                                key={getBaiThiId(item)}
                                className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <Tag color={index === 0 ? "gold" : index === 1 ? "cyan" : "geekblue"}>
                                        #{index + 1}
                                    </Tag>
                                    <TrophyOutlined className="text-lg text-amber-500" />
                                </div>
                                <Title level={4} className="!mb-1 !text-slate-900">
                                    {getThiSinh(item)?.hoTen || getThiSinh(item)?.ho_ten || "-"}
                                </Title>
                                <Text className="!block !text-slate-500">
                                    {getThiSinh(item)?.username || ""}
                                </Text>
                                <div className="mt-4 flex items-end justify-between">
                                    <div>
                                        <Text className="!block !text-xs !uppercase !tracking-[0.18em] !text-slate-400">
                                            Điểm
                                        </Text>
                                        <div className="text-3xl font-bold text-blue-700">
                                            {item.diem ?? 0}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Text className="!block !text-xs !uppercase !tracking-[0.18em] !text-slate-400">
                                            Thời gian
                                        </Text>
                                    <div className="text-base font-semibold text-slate-700">
                                            {formatDuration(getThoiGian(item), dotThi?.thoi_gian_thi)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Table
                        rowKey={(record) => getBaiThiId(record) || getThiSinh(record)?.id || "ranking-row"}
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        scroll={{x: 680}}
                    />
                </div>
            )}
        </Card>
    );
}
