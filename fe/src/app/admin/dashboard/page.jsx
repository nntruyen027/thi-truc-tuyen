'use client';

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
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
    theme,
} from "antd";
import {
    ArrowRightOutlined,
    BankOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    NotificationOutlined,
    TeamOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {usePageInfoStore} from "~/store/page-info";
import {layCuocThi} from "~/services/thi/cuoc-thi";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import {layTracNghiem} from "~/services/thi/trac_nghiem";
import {layDsNguoiDung} from "~/services/dm_chung/nguoi_dung";

const {Title, Paragraph, Text} = Typography;

const quickActions = [
    {
        title: "Tạo cuộc thi mới",
        description: "Khởi tạo kỳ thi, cấu hình thời gian và trạng thái công bố.",
        href: "/admin/cuoc-thi",
        icon: <BankOutlined/>,
    },
    {
        title: "Cập nhật ngân hàng câu hỏi",
        description: "Bổ sung câu hỏi, import file Excel hoặc chỉnh sửa đáp án.",
        href: "/admin/trac-nghiem",
        icon: <FileTextOutlined/>,
    },
    {
        title: "Quản lý tài khoản thí sinh",
        description: "Theo dõi số lượng tài khoản và hỗ trợ đặt lại mật khẩu.",
        href: "/admin/nguoi-dung",
        icon: <TeamOutlined/>,
    },
    {
        title: "Theo dõi kết quả thi",
        description: "Xem điểm, thời gian làm bài và thống kê dự đoán.",
        href: "/admin/ket-qua-trac-nghiem",
        icon: <TrophyOutlined/>,
    },
];

export default function Dashboard() {
    const {message} = App.useApp();
    const router = useRouter();
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);
    const {token} = theme.useToken();

    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState({
        users: 0,
        contests: 0,
        activeContests: 0,
        questions: 0,
    });
    const [currentDotThi, setCurrentDotThi] = useState(null);
    const [contestRows, setContestRows] = useState([]);

    useEffect(() => {
        setPageInfo({
            title: "Dashboard",
        });
    }, [setPageInfo]);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);

            try {
                const [userRes, contestRes, questionRes, currentDotThiRes] = await Promise.all([
                    layDsNguoiDung({page: 1, size: 5}),
                    layCuocThi({page: 1, size: 6}),
                    layTracNghiem({page: 1, size: 5}),
                    layDotThiHienTai().catch(() => ({data: null})),
                ]);

                if (!active) {
                    return;
                }

                const contests = contestRes?.data || [];
                const activeContests = contests.filter((item) => item.trang_thai).length;

                setOverview({
                    users: userRes?.total || 0,
                    contests: contestRes?.total || 0,
                    activeContests,
                    questions: questionRes?.total || 0,
                });
                setCurrentDotThi(currentDotThiRes?.data || null);
                setContestRows(contests);
            } catch (error) {
                if (active) {
                    message.error(error.message || "Không thể tải dữ liệu dashboard");
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
    }, [message]);

    const contestColumns = useMemo(() => ([
        {
            title: "Cuộc thi",
            dataIndex: "ten",
            key: "ten",
            render: (value, record) => (
                <div className="min-w-[200px]">
                    <div className="font-semibold text-slate-900">{value}</div>
                    <div className="line-clamp-2 text-sm text-slate-500">{record.mo_ta || "Chưa có mô tả"}</div>
                </div>
            ),
        },
        {
            title: "Thời gian",
            key: "time",
            render: (_, record) => (
                <div className="text-sm text-slate-600">
                    <div>{dayjs(record.thoi_gian_bat_dau).format("DD/MM/YYYY HH:mm")}</div>
                    <div>{dayjs(record.thoi_gian_ket_thuc).format("DD/MM/YYYY HH:mm")}</div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            render: (value) =>
                value ? <Tag color="blue">Đang mở</Tag> : <Tag>Đóng</Tag>,
        },
        {
            title: "",
            key: "action",
            align: "right",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => router.push(`/admin/cuoc-thi/${record.id}/dot-thi`)}
                >
                    Xem đợt thi
                </Button>
            ),
        },
    ]), [router]);

    const todaySummary = useMemo(() => {
        if (!currentDotThi) {
            return {
                status: "Không có đợt thi đang diễn ra",
                progress: 0,
                durationText: "Hệ thống hiện không có đợt thi nào trong trạng thái hoạt động.",
            };
        }

        const start = dayjs(currentDotThi.thoi_gian_bat_dau);
        const end = dayjs(currentDotThi.thoi_gian_ket_thuc);
        const now = dayjs();
        const total = Math.max(end.diff(start, "minute"), 1);
        const passed = Math.max(now.diff(start, "minute"), 0);
        const progress = Math.min(Math.round((passed / total) * 100), 100);

        return {
            status: currentDotThi.ten,
            progress,
            durationText: `${start.format("DD/MM/YYYY HH:mm")} - ${end.format("DD/MM/YYYY HH:mm")}`,
        };
    }, [currentDotThi]);

    return (
        <div className="space-y-6">
            <section
                className="overflow-hidden rounded-[32px] border p-6 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8"
                style={{
                    borderColor: "rgba(var(--workspace-primary-rgb), 0.18)",
                    background: "#ffffff",
                }}
            >
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} xl={15}>
                        <Space orientation="vertical" size={14} className="w-full">
                            <Tag color="blue" className="!mr-0 w-fit !rounded-full !px-3 !py-1 !text-xs uppercase" style={{background: "rgba(var(--workspace-primary-rgb), 0.1)", color: token.colorPrimary, borderColor: "rgba(var(--workspace-primary-rgb), 0.2)"}}>
                                Trung tâm điều hành
                            </Tag>
                            <Title level={2} className="!mb-0 !text-slate-900">
                                Bảng điều khiển quản trị thi trực tuyến
                            </Title>
                            <Paragraph className="!mb-0 !text-base !text-slate-600">
                                Theo dõi nhanh tình hình tài khoản, cuộc thi, ngân hàng câu hỏi và đợt thi đang vận hành để xử lý kịp thời.
                            </Paragraph>
                            <Space wrap>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => router.push("/admin/cuoc-thi")}
                                >
                                    Quản lý cuộc thi
                                </Button>
                                <Button
                                    size="large"
                                    className="!border-slate-300 !text-slate-700"
                                    style={{borderColor: "rgba(var(--workspace-primary-rgb), 0.24)"}}
                                    icon={<ArrowRightOutlined/>}
                                    onClick={() => router.push("/admin/ket-qua-trac-nghiem")}
                                >
                                    Xem kết quả thi
                                </Button>
                            </Space>
                        </Space>
                    </Col>

                    <Col xs={24} xl={9}>
                        <Card
                            variant={'borderless'}
                            className="rounded-[28px] border border-slate-200 bg-white shadow-sm"
                            styles={{body: {padding: 24}}}
                        >
                            <Space orientation="vertical" size={16} className="w-full">
                                <div>
                                    <Text className="!text-xs uppercase tracking-[0.18em] !text-slate-400">
                                        Đợt thi hiện tại
                                    </Text>
                                    <Title level={4} className="!mb-1 !mt-2 !text-slate-900">
                                        {todaySummary.status}
                                    </Title>
                                    <Text className="!text-slate-500">{todaySummary.durationText}</Text>
                                </div>
                                <Progress
                                    percent={todaySummary.progress}
                                    strokeColor={token.colorPrimary}
                                    railColor="rgba(148,163,184,0.18)"
                                    format={(value) => <span className="text-slate-700">{value}%</span>}
                                />
                                {currentDotThi?.cuoc_thi?.ten && (
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                        <Text className="!text-xs uppercase tracking-[0.14em] !text-slate-400">
                                            Thuộc cuộc thi
                                        </Text>
                                        <div className="mt-1 font-semibold text-slate-900">{currentDotThi.cuoc_thi.ten}</div>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </section>

            {loading ? (
                <Card className="rounded-[28px] border-0 shadow-sm">
                    <Skeleton active paragraph={{rows: 10}}/>
                </Card>
            ) : (
                <>
                    <Row gutter={[20, 20]}>
                        <Col xs={24} md={12} xl={6}>
                            <Card className="rounded-[28px] border-0 shadow-sm">
                                <Statistic
                                    title="Tài khoản thí sinh"
                                    value={overview.users}
                                    prefix={<TeamOutlined style={{color: token.colorPrimary}}/>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Card className="rounded-[28px] border-0 shadow-sm">
                                <Statistic
                                    title="Cuộc thi"
                                    value={overview.contests}
                                    prefix={<BankOutlined style={{color: token.colorPrimary}}/>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Card className="rounded-[28px] border-0 shadow-sm">
                                <Statistic
                                    title="Cuộc thi đang mở"
                                    value={overview.activeContests}
                                    prefix={<NotificationOutlined style={{color: token.colorPrimary}}/>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Card className="rounded-[28px] border-0 shadow-sm">
                                <Statistic
                                    title="Câu hỏi trắc nghiệm"
                                    value={overview.questions}
                                    prefix={<FileTextOutlined style={{color: token.colorPrimary}}/>}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[20, 20]}>
                        <Col xs={24} xl={16}>
                            <Card
                                title="Cuộc thi cần theo dõi"
                                extra={<Link href="/admin/cuoc-thi">Xem tất cả</Link>}
                                className="h-full rounded-[28px] border-0 shadow-sm"
                            >
                                <Table
                                    rowKey="id"
                                    columns={contestColumns}
                                    dataSource={contestRows}
                                    pagination={false}
                                    scroll={{x: 820}}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} xl={8}>
                            <Card
                                title="Lối tắt quản trị"
                                className="h-full rounded-[28px] border-0 shadow-sm"
                            >
                                <div className="space-y-4">
                                    {quickActions.map((item) => (
                                        <div
                                            key={item.href}
                                            className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg text-slate-700">
                                                    {item.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-900">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="link"
                                                onClick={() => router.push(item.href)}
                                            >
                                                Mở
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[20, 20]}>
                        <Col xs={24} lg={12}>
                            <Card className="rounded-[28px] border-0 shadow-sm">
                                <Space orientation="vertical" size={10} className="w-full">
                                    <Text className="!text-xs uppercase tracking-[0.18em] !text-slate-400">
                                        Vận hành trong ngày
                                    </Text>
                                    <Title level={4} className="!mb-0">
                                        Trạng thái điều hành
                                    </Title>
                                    <Paragraph className="!mb-0 !text-slate-500">
                                        {currentDotThi
                                            ? "Đợt thi hiện tại đang được kích hoạt. Bạn có thể vào khu vực kết quả để theo dõi tiến độ nộp bài."
                                            : "Hiện chưa có đợt thi nào đang mở. Bạn nên kiểm tra lịch thi hoặc kích hoạt kỳ thi tiếp theo."}
                                    </Paragraph>
                                    <div className="rounded-3xl bg-slate-50 p-4">
                                        <Space align="start">
                                            <ClockCircleOutlined className="mt-1 text-lg" style={{color: token.colorPrimary}}/>
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {currentDotThi ? currentDotThi.ten : "Chưa có đợt thi hoạt động"}
                                                </div>
                                                <div className="text-sm text-slate-500">{todaySummary.durationText}</div>
                                            </div>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card className="rounded-[28px] border-0 shadow-sm">
                                <Space direction="vertical" size={12} className="w-full">
                                    <Text className="!text-xs uppercase tracking-[0.18em] !text-slate-400">
                                        Gợi ý điều hành
                                    </Text>
                                    <div className="rounded-3xl border border-slate-200 p-4">
                                        <div className="font-semibold text-slate-900">Ưu tiên nên làm</div>
                                        <ul className="mb-0 mt-3 space-y-2 pl-5 text-sm text-slate-600">
                                            <li>Kiểm tra trạng thái các cuộc thi đang mở và mốc thời gian kết thúc.</li>
                                            <li>Rà soát số lượng câu hỏi trước khi mở thêm đợt thi mới.</li>
                                            <li>Đảm bảo danh sách người dùng và đơn vị đã được cập nhật trước ngày thi.</li>
                                        </ul>
                                    </div>
                                    <Button
                                        size="large"
                                        type="primary"
                                        onClick={() => router.push("/admin/cai-dat-chung")}
                                    >
                                        Đi tới cài đặt chung
                                    </Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
