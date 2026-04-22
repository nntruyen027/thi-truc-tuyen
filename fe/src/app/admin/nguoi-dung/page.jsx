'use client'

import {useEffect, useState} from "react";
import {App, Button, Card, Dropdown, Input, Table, Tag, Typography} from "antd";
import {EditOutlined, EllipsisOutlined, ReloadOutlined, SearchOutlined, TeamOutlined} from "@ant-design/icons";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";
import {capNhatMatKhau, layDsNguoiDung} from "~/services/dm_chung/nguoi_dung";

const {Text, Title} = Typography;

export default function NguoiDung() {
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);
    const {message} = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const fetchData = async (
        page = 1,
        size = 10,
        search = "",
    ) => {
        setLoading(true);

        try {
            const res = await layDsNguoiDung({
                page,
                size,
                search
            });

            setData(res.data || []);
            setPagination({
                current: res.page,
                pageSize: res.size,
                total: res.total
            });
        } catch (e) {
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePass = async (username) => {
        try {
            await capNhatMatKhau(username);
            message.success("Đã đặt lại mật khẩu mặc định: Thitructuyen@2026");
        } catch (e) {
            message.error(e.message);
        }
    };

    useEffect(() => {
        void fetchData(
            1,
            pagination.pageSize,
            debouncedSearch,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        void fetchData();

        setPageInfo({
            title: "Người dùng"
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: "#",
            width: 60,
            align: "right",
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {
            title: "Người dùng",
            dataIndex: "ho_ten",
            width: 300,
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                        {record.ho_ten || "Chưa cập nhật"}
                    </div>
                    <div className="text-sm text-slate-500">
                        {record.username}
                    </div>
                </div>
            )
        },
        {
            title: "Đơn vị",
            dataIndex: "don_vi",
            render: (text) => text?.ten || <Tag>Chưa gán</Tag>,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            width: 120,
            render: (value) => (
                <Tag color={value === "admin" ? "blue" : "default"}>
                    {value || "user"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            width: 120,
            render: (_, record) => {
                const items = [
                    {
                        key: "reset-password",
                        label: "Đặt lại mật khẩu",
                        icon: <EditOutlined />,
                        onClick: () => {
                            void handleUpdatePass(record.username);
                        }
                    },
                ];

                return (
                    <Dropdown menu={{items}}>
                        <Button
                            type="text"
                            icon={<EllipsisOutlined />}
                        />
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <div className="space-y-5 p-4 md:p-5">
            <Card className="rounded-[28px] border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f8fbff_56%,_#e0ecff)] shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                            <TeamOutlined />
                            Tài khoản hệ thống
                        </div>
                        <Title level={3} className="!mb-0 !text-slate-900">
                            Quản trị người dùng
                        </Title>
                        <Text className="!text-sm !leading-7 !text-slate-600 md:!text-base">
                            Tra cứu danh sách tài khoản, rà đơn vị công tác và đặt lại mật khẩu mặc định ngay trong một màn hình quản trị.
                        </Text>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Tổng tài khoản
                            </div>
                            <div className="mt-1 text-2xl font-bold text-slate-900">
                                {pagination.total || 0}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Tác vụ nhanh
                            </div>
                            <div className="mt-2 text-sm text-slate-600">
                                Đặt lại mật khẩu mặc định cho tài khoản được chọn.
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="rounded-[28px] border border-slate-200 shadow-sm" styles={{body: {padding: 20}}}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Input
                        prefix={<SearchOutlined className="text-slate-400" />}
                        placeholder="Tìm theo họ tên hoặc tên đăng nhập..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-xl"
                    />

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() =>
                            void fetchData(
                                pagination.current,
                                pagination.pageSize,
                                debouncedSearch
                            )
                        }
                    >
                        Tải lại dữ liệu
                    </Button>
                </div>

                <Table
                    className="mt-5"
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    scroll={{x: 820}}
                    pagination={pagination}
                    onChange={(p) => {
                        void fetchData(
                            p.current,
                            p.pageSize,
                            debouncedSearch
                        );
                    }}
                />
            </Card>
        </div>
    );
}
