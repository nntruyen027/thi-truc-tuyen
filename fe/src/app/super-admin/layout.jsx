"use client";

import {Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, Typography} from "antd";
import {AppstoreOutlined, LogoutOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useMemo} from "react";
import {useAuthStore} from "~/store/auth";

const {Header, Sider, Content} = Layout;

const menuItems = [
    {
        key: "/super-admin",
        icon: <AppstoreOutlined />,
        label: "Workspace",
    },
];

export default function SuperAdminLayout({children}) {
    const router = useRouter();
    const pathname = usePathname();
    const {user, clearAuth} = useAuthStore();

    useEffect(() => {
        if (user && user.role !== "super_admin") {
            router.replace("/");
        }
    }, [router, user]);

    const selectedKeys = useMemo(() => [pathname], [pathname]);

    if (!user || user.role !== "super_admin") {
        return null;
    }

    const userMenu = [
        {
            key: "workspace-admin",
            label: "Vào workspace hiện tại",
            icon: <SettingOutlined />,
            onClick: () => router.push("/admin/dashboard"),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined />,
            onClick: () => {
                clearAuth();
                router.replace("/");
            },
        },
    ];

    return (
        <Layout className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
            <Sider
                width={260}
                theme="light"
                className="border-r border-slate-200"
                style={{
                    background: "#f8fbff",
                    borderInlineEnd: "1px solid rgba(148,163,184,0.2)",
                }}
            >
                <div className="border-b border-slate-200 px-5 py-5 text-slate-900">
                    <div className="truncate text-base font-semibold tracking-[0.08em]">
                        Thi trực tuyến
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Hệ thống
                    </div>
                </div>

                <div className="px-3 py-4">
                    <ConfigProvider
                        theme={{
                            components: {
                                Menu: {
                                    itemBg: "transparent",
                                    subMenuItemBg: "transparent",
                                    popupBg: "#f8fbff",
                                    itemColor: "#334155",
                                    itemHoverColor: "var(--workspace-primary-color)",
                                    itemHoverBg: "rgba(var(--workspace-primary-rgb),0.08)",
                                    itemSelectedColor: "var(--workspace-primary-color)",
                                    itemSelectedBg: "rgba(var(--workspace-primary-rgb),0.14)",
                                    groupTitleColor: "#64748b",
                                    itemBorderRadius: 16,
                                    itemHeight: 44,
                                    iconSize: 16,
                                    fontSize: 14,
                                },
                            },
                        }}
                    >
                        <Menu
                            mode="inline"
                            selectedKeys={selectedKeys}
                            items={menuItems}
                            onClick={({key}) => router.push(key)}
                            style={{borderInlineEnd: 0, background: "transparent"}}
                        />
                    </ConfigProvider>
                </div>
            </Sider>

            <Layout className="bg-transparent">
                <Header
                    className="flex items-center justify-between border-b border-blue-900/10 px-6"
                    style={{background: "var(--workspace-primary-color)"}}
                >
                    <Typography.Title level={4} className="!mb-0 !text-white">
                        Quản trị hệ thống
                    </Typography.Title>

                    <Dropdown menu={{items: userMenu}} placement="bottomRight">
                        <Button type="text" className="!h-auto !rounded-2xl !px-3 !py-2 !text-white hover:!bg-white/10">
                            <span className="flex items-center gap-3">
                                <Avatar size="small" icon={<UserOutlined/>} className="!bg-white/15" />
                                <span>{user?.hoTen || user?.ho_ten || user?.username || "Super Admin"}</span>
                            </span>
                        </Button>
                    </Dropdown>
                </Header>

                <Content className="p-6">
                    <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
