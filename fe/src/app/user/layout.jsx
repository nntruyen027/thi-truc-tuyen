'use client'

import {Avatar, Button, Dropdown, Layout, theme} from 'antd'
import {useEffect, useState} from "react";
import {layDotThiHienTai} from "~/services/thi/dot-thi";
import {layThoiGianConLaiCuaCuocThi} from "~/services/thi/cuoc-thi";
import dayjs from "dayjs";
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";
import {LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import {useAuthStore} from "~/store/auth";
import {useRouter} from "next/navigation";
import {useModal} from "~/store/modal";
import ChangePasswordModal from "~/app/admin/ChangePasswordModal";
import PublicCountDown from "~/app/(public)/CountDown";

export default function UserLayout({children}) {
    const [dotThi, setDotThi] = useState(null);
    const [thoiGianCuocThi, setThoiGianCuocThi] = useState(null);
    const [loadingContestState, setLoadingContestState] = useState(true);
    const router = useRouter();
    const {user, clearAuth} = useAuthStore();
    const {SetIsUpdatePassOpen} = useModal();

    const {token} = theme.useToken()
    const {colorPrimary} = token

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const [resDotThi, resThoiGian] = await Promise.allSettled([
                    layDotThiHienTai(),
                    layThoiGianConLaiCuaCuocThi(),
                ]);

                if (!active) return;

                setDotThi(
                    resDotThi.status === "fulfilled"
                        ? resDotThi.value?.data || null
                        : null
                );
                setThoiGianCuocThi(
                    resThoiGian.status === "fulfilled"
                        ? resThoiGian.value?.data || null
                        : null
                );
            } finally {
                if (active) {
                    setLoadingContestState(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };

    }, []);

    const isContestLocked =
        !loadingContestState && (!dotThi || dotThi.la_sap_dien_ra);
    const isUpcomingContest = !!dotThi?.la_sap_dien_ra;

    const handleLogout = () => {
        clearAuth();
        router.replace("/");
    };

    const userMenuItems = isContestLocked
        ? [{
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined/>,
            onClick: handleLogout,
        }]
        : [
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
                            {isUpcomingContest ? "Cuộc thi sắp diễn ra" : "Cuộc thi hiện tại"}
                        </div>
                        <div
                            className="mt-1 text-lg font-bold md:text-2xl"
                        >
                            {dotThi?.cuoc_thi?.ten || "Hiện chưa có cuộc thi diễn ra"}
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
        <Layout.Content className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className={isContestLocked ? "pointer-events-none select-none opacity-25 blur-[2px]" : ""}>
                {children}
            </div>

            {isContestLocked ? (
                <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/70 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8">
                    <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:p-8">
                        <div className="space-y-3">
                            <div className="text-sm font-semibold uppercase tracking-[0.22em]" style={{color: colorPrimary}}>
                                {isUpcomingContest ? "Đợt thi sắp diễn ra" : "Khu vực thí sinh tạm khóa"}
                            </div>
                            <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                {isUpcomingContest
                                    ? (dotThi?.ten || "Đợt thi sắp bắt đầu")
                                    : "Hiện chưa có đợt thi nào đang diễn ra"}
                            </div>
                            <div className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
                                {isUpcomingContest
                                    ? "Thí sinh chỉ có thể thao tác khi đợt thi bắt đầu. Vui lòng theo dõi thời gian bên dưới và quay lại đúng giờ."
                                    : "Hiện tại hệ thống chưa mở đợt thi. Bạn có thể theo dõi thông báo từ ban tổ chức hoặc đăng xuất khỏi tài khoản."}
                            </div>
                        </div>

                        {isUpcomingContest && thoiGianCuocThi ? (
                            <div className="mx-auto mt-6 max-w-2xl">
                                <PublicCountDown time={thoiGianCuocThi} />
                            </div>
                        ) : null}

                        <div className="mt-6 flex justify-center">
                            <Button
                                type="primary"
                                size="large"
                                className="!h-12 !rounded-2xl !px-8 !font-semibold"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </Layout.Content>
        <Footer/>
        <ChangePasswordModal />
        </Layout>
}
