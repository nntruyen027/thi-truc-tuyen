'use client';

import {useCallback, useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import {
    App,
    Button,
    Card,
    Col,
    Progress,
    Row,
    Skeleton,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    BarChartOutlined,
    ClockCircleOutlined,
    CloudServerOutlined,
    DatabaseOutlined,
    EyeOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {usePageInfoStore} from "~/store/page-info";
import {layThongKeHeThong} from "~/services/thong-ke-he-thong";

const {Title, Text, Paragraph} = Typography;

function formatBytes(value) {
    const normalized = Number(value || 0);

    if (normalized <= 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
        Math.floor(Math.log(normalized) / Math.log(1024)),
        units.length - 1
    );
    const display = normalized / (1024 ** index);

    return `${display >= 100 ? display.toFixed(0) : display.toFixed(1)} ${units[index]}`;
}

function formatDuration(seconds) {
    const normalized = Math.max(0, Number(seconds || 0));
    const hours = Math.floor(normalized / 3600);
    const minutes = Math.floor((normalized % 3600) / 60);
    const secs = normalized % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }

    return `${secs}s`;
}

function formatDateTime(value) {
    return value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "-";
}

function SimpleBarChart({items = [], valueFormatter = (value) => value, color = "#1948be"}) {
    const maxValue = Math.max(...items.map((item) => Number(item.value || item.total || 0)), 1);

    return (
        <div className="space-y-3">
            {items.length ? items.map((item) => {
                const value = Number(item.value ?? item.total ?? 0);
                const label = item.label || item.time || item.path || item.method || item.status || "-";

                return (
                    <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-slate-600">{label}</span>
                            <span className="font-medium text-slate-900">{valueFormatter(value)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${Math.max((value / maxValue) * 100, value > 0 ? 6 : 0)}%`,
                                    background: color,
                                }}
                            />
                        </div>
                    </div>
                );
            }) : (
                <Text className="!text-slate-400">Chưa có dữ liệu</Text>
            )}
        </div>
    );
}

function SimpleLineChart({items = [], color = "#1948be", valueFormatter = (value) => value}) {
    const width = 640;
    const height = 220;
    const padding = 20;
    const values = items.map((item) => Number(item.value || 0));
    const maxValue = Math.max(...values, 1);

    const points = items.map((item, index) => {
        const x = items.length === 1
            ? width / 2
            : padding + (index * (width - padding * 2)) / (items.length - 1);
        const y = height - padding - ((Number(item.value || 0) / maxValue) * (height - padding * 2));

        return [x, y];
    });

    const polyline = points.map((point) => point.join(",")).join(" ");

    return (
        <div className="space-y-4">
            <div className="h-[220px] w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 px-3 py-3">
                {items.length ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
                        <polyline
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            points={polyline}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {points.map(([x, y], index) => (
                            <circle key={`${x}-${y}-${index}`} cx={x} cy={y} r="4.5" fill={color}/>
                        ))}
                    </svg>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        Chưa có dữ liệu
                    </div>
                )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                {(items.slice(-3)).map((item) => (
                    <div key={item.time} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{item.time}</div>
                        <div className="mt-1 font-semibold text-slate-900">{valueFormatter(item.value)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ThongKeHeThongPage() {
    const {message} = App.useApp();
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const loadData = useCallback(async ({silent = false} = {}) => {
        if (silent) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await layThongKeHeThong();
            setData(res);
        } catch (e) {
            message.error(e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [message]);

    useEffect(() => {
        setPageInfo({
            title: "Thống kê hệ thống",
        });
    }, [setPageInfo]);

    useEffect(() => {
        void loadData();

        const timer = setInterval(() => {
            void loadData({silent: true});
        }, 30000);

        return () => clearInterval(timer);
    }, [loadData]);

    const overview = data?.overview || {};
    const charts = data?.charts || {};

    const recentColumns = useMemo(() => ([
        {
            title: "Thời gian",
            dataIndex: "time",
            width: 180,
            render: (value) => formatDateTime(value),
        },
        {
            title: "Truy cập",
            key: "path",
            width: 320,
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Tag color="blue">{record.method}</Tag>
                        <span className="font-medium text-slate-900">{record.path}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                        {record.username ? `Tài khoản: ${record.username}` : "Khách/không xác định"}
                    </div>
                </div>
            ),
        },
        {
            title: "IP",
            dataIndex: "ip",
            width: 150,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 120,
            render: (value) => (
                <Tag color={value >= 400 ? "red" : value >= 300 ? "orange" : "green"}>
                    {value}
                </Tag>
            ),
        },
        {
            title: "Thời gian xử lý",
            dataIndex: "durationMs",
            width: 150,
            render: (value) => `${value} ms`,
        },
        {
            title: "Băng thông",
            key: "bandwidth",
            width: 180,
            render: (_, record) => (
                <div className="text-sm text-slate-600">
                    <div>Vào: {formatBytes(record.requestBytes)}</div>
                    <div>Ra: {formatBytes(record.responseBytes)}</div>
                </div>
            ),
        },
        {
            title: "Thiết bị",
            dataIndex: "userAgent",
            render: (value) => (
                <div className="max-w-[320px] truncate text-sm text-slate-500">
                    {value || "-"}
                </div>
            ),
        },
    ]), []);

    if (loading && !data) {
        return (
            <Card className="rounded-[28px] border-0 shadow-sm">
                <Skeleton active paragraph={{rows: 12}}/>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-sm md:p-8">
                <Row gutter={[20, 20]} align="middle">
                    <Col xs={24} xl={16}>
                        <Space direction="vertical" size={12} className="w-full">
                            <Tag color="blue" className="!mr-0 w-fit !rounded-full !px-3 !py-1 !text-xs uppercase">
                                Runtime analytics
                            </Tag>
                            <Title level={2} className="!mb-0 !text-slate-900">
                                Thống kê luồng sử dụng hệ thống
                            </Title>
                            <Paragraph className="!mb-0 !text-slate-600">
                                Dữ liệu được tổng hợp theo thời gian thực từ tiến trình server hiện tại, gồm RAM, dung lượng tệp, băng thông, lượt truy cập, thời gian xử lý và danh sách truy cập gần đây.
                            </Paragraph>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span>Bắt đầu ghi nhận: {formatDateTime(overview.startedAt)}</span>
                                <span>Uptime: {formatDuration(overview.uptimeSeconds)}</span>
                            </div>
                        </Space>
                    </Col>
                    <Col xs={24} xl={8}>
                        <Card className="rounded-[28px] border border-slate-100 bg-slate-50 shadow-none">
                            <Space direction="vertical" size={14} className="w-full">
                                <div className="flex items-center justify-between">
                                    <Text className="!text-xs uppercase tracking-[0.16em] !text-slate-400">
                                        Bộ nhớ RAM
                                    </Text>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        loading={refreshing}
                                        onClick={() => void loadData({silent: true})}
                                    >
                                        Làm mới
                                    </Button>
                                </div>
                                <Progress percent={overview.ramUsagePercent || 0} strokeColor="#1948be"/>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-white p-4">
                                        <div className="text-xs uppercase text-slate-400">Đang dùng</div>
                                        <div className="mt-1 font-semibold text-slate-900">{formatBytes(overview.ramUsedBytes)}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white p-4">
                                        <div className="text-xs uppercase text-slate-400">Tổng RAM</div>
                                        <div className="mt-1 font-semibold text-slate-900">{formatBytes(overview.ramTotalBytes)}</div>
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </section>

            <Row gutter={[20, 20]}>
                <Col xs={24} md={12} xl={6}>
                    <Card className="rounded-[28px] border-0 shadow-sm">
                        <Statistic title="Lượt truy cập" value={overview.totalRequests || 0} prefix={<EyeOutlined style={{color: "#1948be"}}/>}/>
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Card className="rounded-[28px] border-0 shadow-sm">
                        <Statistic title="Địa chỉ IP" value={overview.uniqueIps || 0} prefix={<CloudServerOutlined style={{color: "#1948be"}}/>}/>
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Card className="rounded-[28px] border-0 shadow-sm">
                        <Statistic title="Băng thông" value={formatBytes(overview.totalBandwidthBytes)} prefix={<BarChartOutlined style={{color: "#1948be"}}/>}/>
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Card className="rounded-[28px] border-0 shadow-sm">
                        <Statistic title="Tệp đã lưu" value={overview.fileCount || 0} suffix={formatBytes(overview.fileSizeBytes)} prefix={<DatabaseOutlined style={{color: "#1948be"}}/>}/>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} xl={16}>
                    <Card
                        title="Lượt truy cập theo giờ"
                        extra={<Text className="text-slate-500">30 phút tự làm mới</Text>}
                        className="rounded-[28px] border-0 shadow-sm"
                    >
                        <SimpleLineChart
                            items={charts.requestsByHour || []}
                            valueFormatter={(value) => `${value} request`}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card
                        title="Thời gian xử lý trung bình"
                        className="h-full rounded-[28px] border-0 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Trung bình toàn hệ thống</div>
                                <div className="mt-2 text-3xl font-semibold text-slate-900">
                                    {overview.averageDurationMs || 0} ms
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                    Lỗi: {overview.errorRequests || 0} request ({overview.errorRatePercent || 0}%)
                                </div>
                            </div>
                            <SimpleBarChart
                                items={(charts.durationByHour || []).slice(-6)}
                                valueFormatter={(value) => `${value} ms`}
                                color="#0f766e"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} xl={12}>
                    <Card title="Băng thông theo giờ" className="rounded-[28px] border-0 shadow-sm">
                        <SimpleLineChart
                            items={charts.bandwidthByHour || []}
                            color="#ea580c"
                            valueFormatter={(value) => formatBytes(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card title="Top đường dẫn truy cập" className="rounded-[28px] border-0 shadow-sm">
                        <SimpleBarChart
                            items={charts.topPaths || []}
                            valueFormatter={(value) => `${value} lượt`}
                            color="#1948be"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} xl={8}>
                    <Card title="Phương thức truy cập" className="rounded-[28px] border-0 shadow-sm">
                        <SimpleBarChart
                            items={(charts.methodBreakdown || []).map((item) => ({
                                label: item.method,
                                value: item.total,
                            }))}
                            valueFormatter={(value) => `${value} request`}
                            color="#7c3aed"
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card title="Mã trạng thái" className="rounded-[28px] border-0 shadow-sm">
                        <SimpleBarChart
                            items={(charts.statusBreakdown || []).map((item) => ({
                                label: `HTTP ${item.status}`,
                                value: item.total,
                            }))}
                            valueFormatter={(value) => `${value} lượt`}
                            color="#16a34a"
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card title="Tài nguyên tiến trình" className="rounded-[28px] border-0 shadow-sm">
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-100 p-4">
                                <div className="text-xs uppercase text-slate-400">Heap đang dùng</div>
                                <div className="mt-1 font-semibold text-slate-900">{formatBytes(overview.heapUsedBytes)}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-100 p-4">
                                <div className="text-xs uppercase text-slate-400">Heap tổng</div>
                                <div className="mt-1 font-semibold text-slate-900">{formatBytes(overview.heapTotalBytes)}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-100 p-4">
                                <div className="text-xs uppercase text-slate-400">RSS</div>
                                <div className="mt-1 font-semibold text-slate-900">{formatBytes(overview.rssBytes)}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card
                title="Danh sách thông tin truy cập gần đây"
                extra={<Space><ClockCircleOutlined className="text-slate-400"/><Text className="!text-slate-500">Tối đa 200 lượt gần nhất</Text></Space>}
                className="rounded-[28px] border-0 shadow-sm"
            >
                <Table
                    rowKey="id"
                    columns={recentColumns}
                    dataSource={data?.recentRequests || []}
                    scroll={{x: 1280}}
                    pagination={{
                        pageSize: 10,
                        responsive: true,
                        showSizeChanger: true,
                    }}
                />
            </Card>
        </div>
    );
}
