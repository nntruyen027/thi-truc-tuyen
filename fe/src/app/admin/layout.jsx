"use client";

import {Avatar, Breadcrumb, Button, ConfigProvider, Drawer, Dropdown, Grid, Layout, Menu, Typography} from "antd";
import {
    BankOutlined,
    BarChartOutlined,
    FundOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    SettingOutlined,
    TableOutlined,
    UserOutlined,
    UsergroupAddOutlined
} from "@ant-design/icons";
import {useEffect, useMemo, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {useModal} from "~/store/modal";
import {useAuthStore} from "~/store/auth";
import {usePageInfoStore} from "~/store/page-info";
import AccountProfileModal from "./AccountProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

const {Sider, Header, Content} = Layout;

const breadcrumbNameMap = {
    dashboard: "Dashboard",
    "nguoi-dung": "Người dùng",
    "cuoc-thi": "Cuộc thi",
    "dot-thi": "Đợt thi",
    "trac-nghiem": "Trắc nghiệm",
    "ket-qua-trac-nghiem": "Kết quả trắc nghiệm",
    "don-vi": "Đơn vị",
    "linh-vuc": "Lĩnh vực",
    "nhom-cau-hoi": "Nhóm câu hỏi",
    "cai-dat-chung": "Cài đặt chung",
    "tai-lieu-cong-khai": "Tài liệu công khai",
};

const menuConfig = [
    {
        key: "/admin/dashboard",
        label: "Dashboard",
        icon: <BarChartOutlined/>,
    },
    {
        key: "quan-ly",
        label: "Người dùng",
        icon: <UsergroupAddOutlined/>,
        children: [
            {
                key: "/admin/nguoi-dung",
                label: "Tài khoản",
            }
        ],
    },
    {
        key: "cuoc-thi",
        label: "Quản lý cuộc thi",
        icon: <BankOutlined/>,
        children: [
            {
                key: "/admin/cuoc-thi",
                label: "Cuộc thi",
            },
            {
                key: "/admin/trac-nghiem",
                label: "Trắc nghiệm",
            }
        ],
    },
    {
        key: "ket-qua",
        label: "Kết quả",
        icon: <FundOutlined/>,
        children: [
            {
                key: "/admin/ket-qua-trac-nghiem",
                label: "Trắc nghiệm",
            },
        ],
    },
    {
        key: "danh-muc",
        label: "Danh mục",
        icon: <TableOutlined/>,
        children: [
            {
                key: "/admin/don-vi",
                label: "Đơn vị",
            },
            {
                key: "/admin/linh-vuc",
                label: "Lĩnh vực",
            },
            {
                key: "/admin/nhom-cau-hoi",
                label: "Nhóm câu hỏi",
            },
        ],
    },
    {
        key: "cai-dat",
        label: "Cài đặt",
        icon: <SettingOutlined/>,
        children: [
            {
                key: "/admin/cai-dat-chung",
                label: "Chung",
            },
            {
                key: "/admin/tai-lieu-cong-khai",
                label: "Tài liệu công khai",
            },
        ],
    },
];

const normalizeMenu = (menus) =>
    menus.map((menu) => {
        if (menu.children?.length) {
            return {
                ...menu,
                children: normalizeMenu(menu.children),
            };
        }

        return menu;
    });

export default function RootLayout({children}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const title = usePageInfoStore((state) => state.title);

    const router = useRouter();
    const pathname = usePathname();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.lg;

    const {SetIsUpdatePassOpen, setIsEditOpen} = useModal();
    const {user, clearAuth} = useAuthStore();

    const normalizedMenu = useMemo(
        () => normalizeMenu(menuConfig),
        []
    );

    const menuItems = useMemo(() => {
        const filterMenu = (menus) =>
            menus.map((menu) => ({
                ...menu,
                children: menu.children ? filterMenu(menu.children) : undefined,
            }));

        return filterMenu(normalizedMenu);
    }, [normalizedMenu]);

    const breadcrumbItems = useMemo(() => {
        const parts =
            pathname
                .split("/")
                .filter(Boolean)
                .slice(1);

        const visibleParts =
            parts.filter((part) => !/^\d+$/.test(part));

        const items = [
            {
                title: <Link href="/admin/dashboard">Trang quản trị</Link>,
            },
        ];

        let href = "/admin";

        visibleParts.forEach((part, index) => {
            href += `/${part}`;

            const isLast =
                index === visibleParts.length - 1;

            const label =
                breadcrumbNameMap[part]
                || (isLast ? title : null)
                || part;

            items.push({
                title: isLast
                    ? <span>{label}</span>
                    : <Link href={href}>{label}</Link>,
            });
        });

        return items;
    }, [pathname, title]);

    useEffect(() => {
        if (user && user.role !== "admin") {
            router.replace("/");
        }
    }, [router, user]);

    if (!user || user.role !== "admin") {
        return null;
    }

    const handleLogout = () => {
        clearAuth();
        router.replace("/login");
    };

    const userMenuItems = [
        {
            key: "profile",
            label: "Thông tin tài khoản",
            icon: <UserOutlined/>,
            onClick: () => setIsEditOpen(),
        },
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <SafetyOutlined/>,
            onClick: () => SetIsUpdatePassOpen(),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined/>,
            onClick: handleLogout,
        },
    ];

    const selectedKeys = [pathname];
    const openKeys = normalizedMenu
        .filter((item) =>
            item.children?.some((child) => pathname.startsWith(child.key))
        )
        .map((item) => item.key);

    const handleMenuClick = ({key}) => {
        if (key.startsWith("/")) {
            router.push(key);
            setMobileMenuOpen(false);
        }
    };

    const menuNode = (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemBg: "transparent",
                        subMenuItemBg: "transparent",
                        popupBg: "#f8fbff",
                        itemColor: "#334155",
                        itemHoverColor: "#1948be",
                        itemHoverBg: "rgba(25,72,190,0.08)",
                        itemSelectedColor: "#1948be",
                        itemSelectedBg: "rgba(25,72,190,0.14)",
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
                theme="light"
                items={menuItems}
                selectedKeys={selectedKeys}
                defaultOpenKeys={openKeys}
                onClick={handleMenuClick}
                style={{borderInlineEnd: 0, background: "transparent"}}
            />
        </ConfigProvider>
    );

    return (
        <Layout className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
            {!isMobile && (
                <Sider
                    width={260}
                    collapsible
                    collapsed={collapsed}
                    trigger={null}
                    style={{
                        minHeight: "100vh",
                        background: "#f8fbff",
                        overflowY: "auto",
                        borderInlineEnd: "1px solid rgba(148,163,184,0.2)",
                    }}
                >
                    <div
                        className="border-b border-slate-200 px-5 py-5 text-slate-900"
                    >
                        <div className="flex items-center gap-3">
                
                            {!collapsed && (
                                <div className="min-w-0">
                                    <div className="truncate text-base font-semibold tracking-[0.08em]">
                                        Thi trực tuyến
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                        VNPT Admin
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-3 py-4">
                        {menuNode}
                    </div>
                </Sider>
            )}

            <Layout className="bg-transparent">
                <Header
                    className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-blue-900/10"
                    style={{background: "rgb(25, 72, 190)", padding: isMobile ? "0 16px" : "0 24px"}}
                >
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        {isMobile ? (
                            <Button
                                type="text"
                                icon={<MenuOutlined/>}
                                onClick={() => setMobileMenuOpen(true)}
                                className="!text-white"
                            />
                        ) : (
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                                onClick={() => setCollapsed(!collapsed)}
                                className="!text-white"
                            />
                        )}
                        <div className="min-w-0">
                            <h2 style={{margin: '0'}} className="truncate text-lg font-semibold leading-none text-white sm:text-[22px]">
                                {title || "Trang quản trị"}
                            </h2>
                        </div>
                    </div>

                    <Dropdown
                        menu={{items: userMenuItems}}
                        placement="bottomRight"
                    >
                        <div className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/10">
                            <Avatar
                                src={user?.avatar}
                                icon={<UserOutlined/>}
                                className="!bg-white/15"
                            />
                            <div className="hidden min-w-0 sm:block">
                                <Typography.Text className="block truncate font-medium !text-white">
                                    {user?.hoTen || "Người dùng"}
                                </Typography.Text>
                                <div className="text-xs uppercase tracking-[0.14em] text-blue-100/80">
                                    Quản trị viên
                                </div>
                            </div>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: isMobile ? "16px" : "24px",
                        padding: isMobile ? 16 : 24,
                    }}
                    className="min-h-[calc(100vh-112px)] rounded-[32px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                    <div className="mb-5 rounded-2xl border border-slate-200/80 bg-slate-50/85 px-4 py-3">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    {children}
                </Content>
            </Layout>

            <Drawer
                placement="left"
                open={isMobile && mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                title="Thi trực tuyến"
                styles={{
                    header: {
                        background: "#f8fbff",
                        color: "#0f172a",
                        borderBottom: "1px solid rgba(148,163,184,0.18)",
                    },
                    body: {
                        padding: 0,
                        background: "#f8fbff",
                    }
                }}
            >
                {menuNode}
            </Drawer>
            <AccountProfileModal />
            <ChangePasswordModal />
        </Layout>
    );
}
