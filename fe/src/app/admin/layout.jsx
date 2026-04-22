"use client";

import {Avatar, Button, Drawer, Dropdown, Grid, Layout, Menu, theme, Typography} from "antd";
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
import {useModal} from "~/store/modal";
import {useAuthStore} from "~/store/auth";
import {usePageInfoStore} from "~/store/page-info";

const {Sider, Header, Content} = Layout;

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

    const {
        token: {colorBgContainer, borderRadiusLG, colorPrimary},
    } = theme.useToken();

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
            onClick: setIsEditOpen,
        },
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <SafetyOutlined/>,
            onClick: SetIsUpdatePassOpen,
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
        <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            onClick={handleMenuClick}
            style={{borderInlineEnd: 0}}
        />
    );

    return (
        <Layout className="min-h-screen bg-slate-100">
            {!isMobile && (
                <Sider
                    width={260}
                    collapsible
                    collapsed={collapsed}
                    trigger={null}
                    style={{
                        minHeight: "100vh",
                        background: "white",
                        overflowY: "auto",
                        borderInlineEnd: "1px solid #e5e7eb",
                    }}
                >
                    <div
                        style={{background: colorPrimary}}
                        className="px-4 py-4 text-center text-lg font-semibold tracking-[0.08em] text-white"
                    >
                        {collapsed ? "TTT" : "Thi trực tuyến"}
                    </div>

                    {menuNode}
                </Sider>
            )}

            <Layout className="bg-transparent">
                <Header
                    className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-6"
                    style={{background: colorBgContainer}}
                >
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        {isMobile ? (
                            <Button
                                type="text"
                                icon={<MenuOutlined/>}
                                onClick={() => setMobileMenuOpen(true)}
                            />
                        ) : (
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                                onClick={() => setCollapsed(!collapsed)}
                            />
                        )}
                        <h2 className="m-0 truncate text-base font-semibold text-slate-900 sm:text-xl">
                            {title || "Trang quản trị"}
                        </h2>
                    </div>

                    <Dropdown
                        menu={{items: userMenuItems}}
                        placement="bottomRight"
                    >
                        <div className="flex cursor-pointer items-center gap-2">
                            <Avatar
                                src={user?.avatar}
                                icon={<UserOutlined/>}
                            />
                            <Typography.Text className="hidden font-medium sm:inline">
                                {user?.hoTen || "Người dùng"}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: isMobile ? "16px" : "24px",
                        padding: isMobile ? 16 : 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                    className="min-h-[calc(100vh-112px)]"
                >
                    {children}
                </Content>
            </Layout>

            <Drawer
                placement="left"
                open={isMobile && mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                title="Thi trực tuyến"
                styles={{body: {padding: 0}}}
            >
                {menuNode}
            </Drawer>
        </Layout>
    );
}
