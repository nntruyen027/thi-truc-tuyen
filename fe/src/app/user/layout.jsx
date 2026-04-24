'use client'

import {Avatar, Button, Dropdown, Layout, theme} from 'antd'
import {useEffect, useState} from "react";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import dayjs from "dayjs";
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";
import {LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import {useAuthStore} from "~/store/auth";
import {useRouter} from "next/navigation";
import {useModal} from "~/store/modal";
import ChangePasswordModal from "~/app/admin/ChangePasswordModal";

export default function UserLayout({children}) {
    const [dotThi, setDotThi] = useState(null);
    const router = useRouter();
    const {user, clearAuth} = useAuthStore();
    const {SetIsUpdatePassOpen} = useModal();

    const {token} = theme.useToken()
    const {colorPrimary} = token

    useEffect(() => {
        let active = true;

        const load = async () => {
            const resDotThi = await layDotThiHienTai()

            if (!active || !resDotThi.data) return;

            setDotThi(resDotThi.data);
        };

        void load();

        return () => {
            active = false;
        };

    }, []);

    const handleLogout = () => {
        clearAuth();
        router.replace("/");
    };

    const userMenuItems = [
        ...(user?.role === "admin" || user?.role === "super_admin"
            ? [{
                key: "admin",
                label: "Khu vực quản trị",
                icon: <SettingOutlined/>,
                onClick: () => router.push("/admin/dashboard"),
            }]
            : []),
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <LockOutlined/>,
            onClick: () => SetIsUpdatePassOpen(),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined/>,
            onClick: handleLogout,
        },
    ];

    return <Layout className="min-h-screen bg-slate-50">
            <UserInteractionGuard blockDevTools disableCopy />
            <div
                style={{
                    color:'white',
                    background: colorPrimary,
                }}
                className="relative overflow-hidden px-4 py-5 shadow-sm sm:px-6 lg:px-8">
                    <div className="relative mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                            Cuộc thi hiện tại
                        </div>
                        <div
                            className="mt-1 text-lg font-bold md:text-2xl"
                        >
                            {dotThi?.cuoc_thi?.ten || "Chưa có cuộc thi diễn ra"}
                        </div>
                        <div className="mt-1 text-sm font-semibold md:text-base">
                            {dotThi?.cuoc_thi?.thoi_gian_bat_dau
                                ? `${dayjs(dotThi.cuoc_thi.thoi_gian_bat_dau).format("DD/MM/YYYY HH:mm:ss")} - ${dayjs(dotThi.cuoc_thi.thoi_gian_ket_thuc).format("DD/MM/YYYY HH:mm:ss")}`
                                : "Thông tin thời gian sẽ được cập nhật khi có đợt thi."}
                        </div>
                    </div>
                    <Dropdown
                        menu={{items: userMenuItems}}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            className="!h-auto !rounded-2xl !border !border-white/20 !bg-white/10 !px-3 !py-2 !text-white hover:!border-white/30 hover:!bg-white/15"
                        >
                            <span className="flex items-center gap-3">
                                <Avatar
                                    size="small"
                                    icon={<UserOutlined/>}
                                    className="!bg-white/15"
                                />
                                <span className="max-w-[180px] truncate text-left">
                                    {user?.hoTen || user?.ho_ten || user?.username || "Tài khoản"}
                                </span>
                            </span>
                        </Button>
                    </Dropdown>
                    </div>
                </div>
        <Layout.Content className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</Layout.Content>
        <Footer/>
        <ChangePasswordModal />
        </Layout>
}
