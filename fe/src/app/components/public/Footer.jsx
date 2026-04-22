'use client';

import {Layout, Typography} from "antd";
import {EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined} from "@ant-design/icons";
import {useEffect, useMemo, useState} from "react";

import {layCauHinh} from "~/services/cau-hinh";

const {Text, Title} = Typography;

function parseJsonValue(value, fallback) {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export default function Footer() {
    const [leftFooter, setLeftFooter] = useState({
        tieuDe: "",
        noiDung: ""
    });
    const [rightFooter, setRightFooter] = useState({
        tieuDe: "",
        noiDung: ""
    });
    const [banQuyen, setBanQuyen] = useState("");
    const [footerMeta, setFooterMeta] = useState({});

    useEffect(() => {
        let active = true;

        const load = async () => {
            const [resBanQuyen, resLeftFooter, resRightFooter, resFooterMeta] = await Promise.all([
                layCauHinh("van-ban-ban-quyen"),
                layCauHinh("left_footer"),
                layCauHinh("right_footer"),
                layCauHinh("footer_meta"),
            ]);

            if (!active) {
                return;
            }

            const valLeftFooter =
                parseJsonValue(resLeftFooter?.data?.gia_tri, null);
            const valRightFooter =
                parseJsonValue(resRightFooter?.data?.gia_tri, null);
            const valFooterMeta =
                parseJsonValue(resFooterMeta?.data?.gia_tri, {});

            setBanQuyen(resBanQuyen?.data?.gia_tri || "");
            setFooterMeta(valFooterMeta || {});
            setLeftFooter({
                tieuDe: valLeftFooter?.tieuDe || "",
                noiDung: valLeftFooter?.noiDung || ""
            });
            setRightFooter({
                tieuDe: valRightFooter?.tieuDe || "",
                noiDung: valRightFooter?.noiDung || ""
            });
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    const contacts = useMemo(() => ([
        {
            key: "diaChi",
            icon: <EnvironmentOutlined />,
            label: "Địa chỉ",
            value: footerMeta?.diaChi
        },
        {
            key: "hotline",
            icon: <PhoneOutlined />,
            label: "Hotline",
            value: footerMeta?.hotline
        },
        {
            key: "email",
            icon: <MailOutlined />,
            label: "Email",
            value: footerMeta?.email
        },
        {
            key: "website",
            icon: <GlobalOutlined />,
            label: "Website",
            value: footerMeta?.website
        }
    ]).filter((item) => item.value), [footerMeta]);

    return (
        <Layout.Footer className="mt-14 overflow-hidden border-t border-slate-200 px-4 py-0 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <div className="grid gap-8 lg:grid-cols-[1.25fr_minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="space-y-4">
                        
                            <div>
                                <Title level={3} className="!mb-2 !text-slate-900">
                                    {footerMeta?.tenDonVi || "Hệ thống thi trực tuyến"}
                                </Title>
                                <Text className="!text-sm !leading-7 !text-slate-600 md:!text-base">
                                    {footerMeta?.moTaNgan || "Nền tảng phục vụ tổ chức thi trực tuyến, công bố kết quả và quản lý tài liệu một cách tập trung, rõ ràng và chuyên nghiệp."}
                                </Text>
                            </div>

                            {!!contacts.length && (
                                <div className="grid gap-3">
                                    {contacts.map((item) => (
                                        <div key={item.key} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <div className="mt-0.5 text-blue-700">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    {item.label}
                                                </div>
                                                <div className="mt-1 text-sm font-medium text-slate-700">
                                                    {item.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                {leftFooter.tieuDe || "Liên kết thông tin"}
                            </div>
                            <div
                                className="footer-rich text-sm leading-7 text-slate-600"
                                dangerouslySetInnerHTML={{
                                    __html: leftFooter.noiDung || "<p>Chưa cập nhật nội dung.</p>"
                                }}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                {rightFooter.tieuDe || "Hỗ trợ người dùng"}
                            </div>
                            <div
                                className="footer-rich text-sm leading-7 text-slate-600"
                                dangerouslySetInnerHTML={{
                                    __html: rightFooter.noiDung || "<p>Chưa cập nhật nội dung.</p>"
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-x border-b border-slate-200 px-5 py-4 text-center text-sm text-slate-300 sm:px-8 lg:px-10">
                    <div
                        className="footer-rich footer-rich--dark"
                        dangerouslySetInnerHTML={{
                            __html: banQuyen || "<p>Ban tổ chức quản lý và vận hành hệ thống thi trực tuyến.</p>"
                        }}
                    />
                </div>
            </div>
        </Layout.Footer>
    );
}
