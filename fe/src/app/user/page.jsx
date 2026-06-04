'use client';

import {useEffect, useState} from "react";

import {
    App,
    Button,
    Card,
    Empty,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
    theme,
} from "antd";

import {useRouter} from "next/navigation";
import dayjs from "dayjs";

import {lichSuThi} from "~/services/thi/thi";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import Profile from "~/app/user/Profile";
import {useModal} from "~/store/modal";


const {Title, Text} = Typography;


export default function Page() {

    const router = useRouter();
    const {SetIsUpdatePassOpen} = useModal();
    const {message} = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dotThi, setDotThi] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
    });
    const {token} = theme.useToken();


    useEffect(() => {

        async function load() {

            try {

                const dot =
                    await layDotThiHienTai();

                setDotThi(dot.data || null);

                if (dot?.data?.id && !dot.data.la_sap_dien_ra) {
                    const ds =
                        await lichSuThi(
                            dot.data.id
                        );

                    setData(
                        [...(ds || [])].sort(
                            (a, b) => (Number(b?.lan_thi) || 0) - (Number(a?.lan_thi) || 0)
                        )
                    );
                }
            } catch (error) {
                setData([]);
                if (error?.status !== 401) {
                    message.error(error?.message || "Không thể tải lịch sử thi");
                }
            }
            finally {

                setLoading(false);

            }

        }

        void load();

    }, [message]);


    function trangThaiTag(v) {

        if (v === 0)
            return <Tag color="blue">Đang thi</Tag>;

        if (v === 1)
            return <Tag color="green">Đã nộp</Tag>;

        return <Tag>Chưa thi</Tag>;

    }


    function actionBtn(row) {
        if (!dotThi?.id || dotThi?.la_sap_dien_ra) {
            return null;
        }

        if (row.trang_thai === 0) {

            return (
                <Button
                    type="primary"
                    className="!rounded-xl"
                    onClick={() =>
                        router.push(
                            "/user/thi"
                        )
                    }
                >
                    Tiếp tục
                </Button>
            );

        }

        if (row.trang_thai === 1) {

            return null;

        }

        return (
            <Button
                type="primary"
                className="!rounded-xl"
                onClick={() =>
                    router.push(
                        "/user/thi"
                    )
                }
            >
                Bắt đầu
            </Button>
        );

    }


    const columns = [

        {
            title: "Đợt thi",
            dataIndex: "dot_thi",
            render: (text) =>
                text?.ten || "-"
        },

        {
            title: "Lần thi",
            dataIndex: "lan_thi",
            align: "center"
        },

        {
            title: "Trạng thái",
            align: "center",
            render: (_, r) =>
                trangThaiTag(
                    r.trang_thai
                )
        },

        {
            title: "Điểm trắc nghiệm",
            dataIndex: "diem",
            align: "center",
            render: (value) => value ?? "-"
        },
        {
            title: "Số dự đoán",
            dataIndex: "so_du_doan",
            align: "center",
            render: (value) => value ?? "-"
        },
        {
            title: "Thời gian làm bài",
            dataIndex: "thoi-gian-lam-bai",
            align: "center",
            render: (_, record) => {

                if (!record.thoi_gian_nop)
                    return "-";

                const diff =
                    Math.min(
                        record.tong_thoi_gian_da_lam,
                        (record?.dot_thi?.thoi_gian_thi || 0) * 60
                    );

                const m =
                    Math.floor(diff / 60);

                const s =
                    diff % 60;

                return `${m}:${s
                    .toString()
                    .padStart(2, "0")}`;

            }
        },

        {
            title: "Hành động",
            align: "center",
            render: (_, r) =>
                actionBtn(r)
        }

    ];

    const daNop =
        data.filter((item) => item.trang_thai === 1).length;

    const dangThi =
        data.filter((item) => item.trang_thai === 0).length;

    const diemCaoNhat =
        data.reduce((max, item) => {
            const diem =
                Number(item.diem) || 0;

            return Math.max(max, diem);
        }, 0);


    if (loading)
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Spin size="large"/>
            </div>
        );


    return (

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <section
                className="overflow-hidden rounded-[32px] border p-5 shadow-sm sm:p-6 lg:p-8"
                style={{
                    borderColor: "rgba(var(--workspace-primary-rgb), 0.18)",
                    background: "#ffffff",
                }}
            >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
                    <div className="space-y-4">
                        
                        <div className="space-y-2">
                            <Title className="!mb-0 !text-3xl !leading-tight !text-slate-900 md:!text-4xl">
                                Theo dõi cuộc thi và quản lý quá trình làm bài
                            </Title>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="primary"
                                size="large"
                                className="!h-12 !rounded-2xl !px-6 !font-semibold"
                                disabled={!dotThi?.id || dotThi?.la_sap_dien_ra}
                                onClick={() =>
                                    router.push(
                                        "/user/thi"
                                    )
                                }
                            >
                                Vào phòng thi
                            </Button>
                            <Button
                                size="large"
                                className="!h-12 !rounded-2xl !border-slate-200 !bg-white !px-6 !font-semibold !text-slate-700"
                                onClick={() =>
                                    document
                                        .getElementById("lich-su-thi")
                                        ?.scrollIntoView({behavior: "smooth", block: "start"})
                                }
                            >
                                Xem lịch sử thi
                            </Button>
                            <Button
                                size="large"
                                className="!h-12 !rounded-2xl !border-slate-200 !bg-white !px-6 !font-semibold !text-slate-700"
                                onClick={() => SetIsUpdatePassOpen()}
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </div>

                    <Card
                        className="rounded-[28px] border border-white/70 bg-white/90 shadow-sm backdrop-blur"
                        styles={{body: {padding: 24}}}
                    >
                        <div className="space-y-3">
                            <Text className="!text-xs !font-semibold !uppercase !tracking-[0.24em]" style={{color: token.colorPrimary}}>
                                {dotThi?.la_sap_dien_ra ? "Đợt thi sắp diễn ra" : "Đợt thi hiện tại"}
                            </Text>
                            <Title level={3} className="!mb-0 !text-slate-900">
                                {dotThi?.ten || "Chưa có đợt thi"}
                            </Title>
                            <Text className="!block !leading-7 !text-slate-600">
                                {dotThi?.thoi_gian_bat_dau
                                    ? `Từ ${dayjs(dotThi.thoi_gian_bat_dau).format("DD/MM/YYYY HH:mm")} đến ${dayjs(dotThi.thoi_gian_ket_thuc).format("DD/MM/YYYY HH:mm")}`
                                    : "Thông tin thời gian sẽ hiển thị khi có đợt thi đang diễn ra."}
                            </Text>
                        </div>
                    </Card>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="rounded-3xl border border-slate-200 shadow-sm">
                    <Statistic title="Tổng lượt thi" value={data.length}/>
                </Card>
                <Card className="rounded-3xl border border-slate-200 shadow-sm">
                    <Statistic title="Đã nộp bài" value={daNop}/>
                </Card>
                <Card className="rounded-3xl border border-slate-200 shadow-sm">
                    <Statistic title="Đang làm bài" value={dangThi}/>
                </Card>
                <Card className="rounded-3xl border border-slate-200 shadow-sm">
                    <Statistic title="Điểm cao nhất" value={diemCaoNhat}/>
                </Card>
            </section>

            <Profile/>

            <Card
                id="lich-su-thi"
                className="rounded-3xl border border-slate-200 shadow-sm"
                styles={{body: {padding: 24}}}
            >
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Text className="!text-xs !font-semibold !uppercase !tracking-[0.2em]" style={{color: token.colorPrimary}}>
                            Lịch sử làm bài
                        </Text>
                        
                    </div>

                    <Space wrap>
                        <Tag color="blue">Đang thi: {dangThi}</Tag>
                        <Tag color="green">Đã nộp: {daNop}</Tag>
                    </Space>
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    scroll={{x: 900}}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Chưa có lịch sử thi"
                            />
                        )
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: data.length,
                        showSizeChanger: true,
                        pageSizeOptions: ["6", "10", "15"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} lượt`,
                        onChange: (page, pageSize) => {
                            setPagination({
                                current: page,
                                pageSize,
                            });
                        },
                    }}
                />
            </Card>
        </div>

    );

}
