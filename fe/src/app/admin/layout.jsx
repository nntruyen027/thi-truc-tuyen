"use client";

import {Avatar, Button, Dropdown, Layout, Menu, theme, Typography,} from "antd";

import {
    BankOutlined,
    BarChartOutlined,
    FundOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    SettingOutlined,
    TableOutlined,
    UsergroupAddOutlined,
    UserOutlined
} from "@ant-design/icons";

import {useEffect, useMemo, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useModal} from "~/store/modal";
import {useAuthStore} from "~/store/auth";
import {usePageInfoStore} from "~/store/page-info";

const {Sider, Header, Content} = Layout;

/* ================= MENU CONFIG ================= */

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
        icon: <BankOutlined />,
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
        icon: <FundOutlined />,
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
        icon: <SettingOutlined />,
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

/* ================= UTILS ================= */



const normalizeMenu = (menus) =>
    menus.map(m => {
        if (m.children?.length) {
            return {
                ...m,
                children: normalizeMenu(m.children),
            };
        }
        return m;
    });

/* ================= COMPONENT ================= */

export default function RootLayout({children}) {
    const [collapsed, setCollapsed] = useState(false);
    const [checked, setChecked] = useState(false);
    const title = usePageInfoStore((state) => state.title)

    const router = useRouter();
    const pathname = usePathname();

    const {
        token: {colorBgContainer, borderRadiusLG, colorPrimary},
    } = theme.useToken();

    const {SetIsUpdatePassOpen, setIsEditOpen} = useModal();
    const {user, clearAuth} = useAuthStore();

    /* ================= MENU SAU KHI CHUẨN HOÁ ================= */

    const normalizedMenu = useMemo(
        () => normalizeMenu(menuConfig),
        []
    );

    const menuItems = useMemo(() => {
        const filterMenu = (menus) =>
            menus
                .map(m => ({
                    ...m,
                    children: m.children ? filterMenu(m.children) : undefined,
                }));

        return filterMenu(normalizedMenu);
    }, [user]);

    /* ================= CHECK URL PERMISSION ================= */

    useEffect(() => {
        if (!user) return

        if (user.role !== "admin") {

            router.replace("/")

        }

        const allRoutes = [];
        const collectRoutes = (menus) => {
            menus.forEach(m => {
                if (m.key?.startsWith("/")) allRoutes.push(m);
                if (m.children) collectRoutes(m.children);
            });
        };

        collectRoutes(normalizedMenu);


        setChecked(true);
    }, [user, pathname]);


    if (!checked) return;

    /* ================= HANDLERS ================= */

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

    /* ================= RENDER ================= */

    return (
        <Layout>
            <Sider
                width={250}
                collapsible
                collapsed={collapsed}
                trigger={null}
                style={{
                    height: "100vh",
                    background: "white",
                    overflowY: "auto",
                }}
            >
                {!collapsed && (
                    <div style={{background: colorPrimary}}
                         className="font-['Times_New_Roman'] text-lg text-center p-2 text-white ">
                        Thi trực tuyến
                    </div>
                )}

                <Menu
                    mode="inline"
                    items={menuItems}
                    onClick={({key}) =>
                        key.startsWith("/") && router.push(key)
                    }
                />
            </Sider>

            <Layout>
                <Header
                    className="flex justify-between items-center"
                    style={{background: colorBgContainer, paddingLeft: 10}}
                >
                    <div className="flex items-center justify-between">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                        <h2 style={{margin: 0, fontSize: '20px', color: 'black'}}>{title}</h2>
                    </div>


                    <Dropdown
                        menu={{items: userMenuItems}}
                        placement="bottomRight"
                    >
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar
                                src={user?.avatar}
                                icon={<UserOutlined/>}
                            />
                            <Typography.Text className="font-medium">
                                {user?.hoTen || "Người dùng"}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}