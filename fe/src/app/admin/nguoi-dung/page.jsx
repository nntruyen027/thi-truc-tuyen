'use client'

import {useEffect, useState} from "react";
import {
    App,
    Button,
    Dropdown,
    Input,
    Modal,
    Select,
    Table,
    Tag,
    Typography
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    PlusOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    SearchOutlined
} from "@ant-design/icons";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";
import {useAuthStore} from "~/store/auth";
import {
    capNhatMatKhau,
    capNhatQuyenNguoiDung,
    layDsNguoiDung,
    xoaNguoiDung
} from "~/services/dm_chung/nguoi_dung";
import {layDanhSachWorkspace} from "~/services/workspace";
import UserModal from "./UserModal";

const {Text, Title} = Typography;

export default function NguoiDung() {
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);
    const user = useAuthStore((state) => state.user);
    const {message} = App.useApp();
    const isSuperAdmin = user?.role === "super_admin";

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    const [workspaceOptions, setWorkspaceOptions] = useState([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(undefined);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState("");
    const [editing, setEditing] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

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
                search,
                workspaceId: selectedWorkspaceId,
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

    const loadWorkspaces = async () => {
        if (!isSuperAdmin) {
            return;
        }

        setWorkspaceLoading(true);
        try {
            const rows = await layDanhSachWorkspace();

            setWorkspaceOptions(
                (rows || []).map((item) => ({
                    label: item.ten,
                    value: item.id,
                }))
            );
        } catch (e) {
            message.error(e.message || "Không thể tải danh sách workspace.");
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const reloadCurrentPage = async () => {
        await fetchData(
            pagination.current,
            pagination.pageSize,
            debouncedSearch
        );
    };

    const handleUpdatePass = async (record) => {
        try {
            await capNhatMatKhau(
                record.username,
                record.workspace?.id || record.workspace_id || selectedWorkspaceId
            );
            message.success("Đã đặt lại mật khẩu mặc định: Thitructuyen@2026");
        } catch (e) {
            message.error(e.message);
        }
    };

    const handleToggleAdmin = async (record) => {
        if (record.role === "super_admin") {
            message.warning("Tài khoản super admin được quản lý ở khu vực quản trị hệ thống.");
            return;
        }

        try {
            const nextRole =
                record.role === "admin"
                    ? "user"
                    : "admin";

            await capNhatQuyenNguoiDung(
                record.id,
                nextRole,
                record.workspace?.id || record.workspace_id || selectedWorkspaceId
            );

            message.success(
                nextRole === "admin"
                    ? "Đã gán quyền admin"
                    : "Đã thu hồi quyền admin"
            );

            await reloadCurrentPage();
        } catch (e) {
            message.error(e.message);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await xoaNguoiDung(deleteTarget.id);
            message.success("Đã xóa tài khoản");

            const nextPage =
                data.length === 1 && pagination.current > 1
                    ? pagination.current - 1
                    : pagination.current;

            await fetchData(
                nextPage,
                pagination.pageSize,
                debouncedSearch
            );
        } catch (e) {
            message.error(e.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    useEffect(() => {
        void fetchData(
            1,
            pagination.pageSize,
            debouncedSearch,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, selectedWorkspaceId]);

    useEffect(() => {
        void fetchData();
        void loadWorkspaces();

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
            render: (value) => value?.ten || <Tag>Chưa gán</Tag>
        },
        ...(isSuperAdmin
            ? [{
                title: "Workspace",
                dataIndex: "workspace",
                width: 220,
                render: (value) => value?.ten || <Tag>Chưa gán</Tag>
            }]
            : []),
        {
            title: "Quyền",
            dataIndex: "role",
            width: 140,
            render: (value) => (
                <Tag color={value === "super_admin" ? "gold" : value === "admin" ? "blue" : "default"}>
                    {value === "super_admin" ? "Super Admin" : value === "admin" ? "Admin" : "Người dùng"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            width: 140,
            render: (_, record) => {
                const items = [
                    {
                        key: "edit",
                        label: "Chỉnh sửa tài khoản",
                        icon: <EditOutlined />,
                        onClick: () => {
                            setEditing(record);
                            setModalOpen(true);
                        }
                    },
                    {
                        key: "reset-password",
                        label: "Đặt lại mật khẩu",
                        icon: <ReloadOutlined />,
                        onClick: () => {
                            void handleUpdatePass(record);
                        }
                    },
                    {
                        key: "delete",
                        label: "Xóa tài khoản",
                        danger: true,
                        icon: <DeleteOutlined />,
                        onClick: () => {
                            setDeleteTarget(record);
                        }
                    },
                ];

                if (record.role !== "super_admin") {
                    items.splice(1, 0, {
                        key: "toggle-admin",
                        label: record.role === "admin" ? "Thu hồi admin" : "Gán thành admin",
                        icon: <SafetyCertificateOutlined />,
                        onClick: () => {
                            void handleToggleAdmin(record);
                        }
                    });
                }

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
    
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-3 lg:max-w-4xl lg:flex-row">
                        <Input
                            prefix={<SearchOutlined className="text-slate-400" />}
                            placeholder="Tìm theo họ tên hoặc tên đăng nhập..."
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-xl"
                        />

                        {isSuperAdmin && (
                            <Select
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                placeholder="Lọc theo workspace"
                                loading={workspaceLoading}
                                value={selectedWorkspaceId}
                                options={workspaceOptions}
                                onChange={(value) => setSelectedWorkspaceId(value)}
                                className="w-full lg:max-w-xs"
                            />
                        )}
                    </div>

                     <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditing(null);
                                setModalOpen(true);
                            }}
                        >
                            Thêm tài khoản
                        </Button>
                </div>

                <Table
                    className="admin-table"
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    scroll={{x: 920}}
                    pagination={{
                        ...pagination,
                        responsive: true,
                        showSizeChanger: true,
                    }}
                    onChange={(p) => {
                        void fetchData(
                            p.current,
                            p.pageSize,
                            debouncedSearch
                        );
                    }}
                />

            <UserModal
                open={modalOpen}
                data={editing}
                isSuperAdmin={isSuperAdmin}
                selectedWorkspaceId={selectedWorkspaceId}
                workspaceOptions={workspaceOptions}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    setEditing(null);
                    void reloadCurrentPage();
                }}
            />

            <Modal
                title="Xác nhận xóa tài khoản"
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onOk={confirmDelete}
                okButtonProps={{danger: true}}
                okText="Xóa"
                cancelText="Thoát"
            >
                {deleteTarget
                    ? `Bạn có chắc muốn xóa tài khoản ${deleteTarget.username}?`
                    : ""}
            </Modal>
        </div>
    );
}
