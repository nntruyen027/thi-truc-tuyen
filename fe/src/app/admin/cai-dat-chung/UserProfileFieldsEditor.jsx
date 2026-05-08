'use client';

import {App, Button, Card, Checkbox, Space, Typography} from "antd";
import {useEffect, useMemo, useState} from "react";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {
    buildUserProfileFieldConfig,
    DEFAULT_USER_PROFILE_FIELDS,
    LOCKED_USER_PROFILE_FIELDS,
    parseUserProfileFieldConfig,
    USER_PROFILE_FIELD_OPTIONS,
} from "~/constants/userProfileFields";

const {Paragraph, Text, Title} = Typography;

export default function UserProfileFieldsEditor({workspaceId = null}) {
    const {message} = App.useApp();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [enabledFields, setEnabledFields] = useState(DEFAULT_USER_PROFILE_FIELDS);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                const res = await layCauHinh("user_profile_fields", {workspaceId});

                if (!active) {
                    return;
                }

                setEnabledFields(parseUserProfileFieldConfig(res?.data?.gia_tri));
            } catch {
                if (active) {
                    setEnabledFields([...DEFAULT_USER_PROFILE_FIELDS]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [workspaceId]);

    const selectedValues = useMemo(
        () => Array.from(new Set([...LOCKED_USER_PROFILE_FIELDS, ...enabledFields])),
        [enabledFields]
    );

    const handleChange = (values) => {
        setEnabledFields(
            DEFAULT_USER_PROFILE_FIELDS.filter((item) =>
                values.includes(item) || LOCKED_USER_PROFILE_FIELDS.includes(item)
            )
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await suaCauHinh(
                "user_profile_fields",
                buildUserProfileFieldConfig(selectedValues),
                {workspaceId}
            );
            message.success("Đã cập nhật cấu hình thông tin người dùng");
        } catch (error) {
            message.error(error?.message || "Không thể lưu cấu hình");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card
            loading={loading}
            className="rounded-[28px] border border-slate-200 shadow-sm"
            styles={{body: {padding: 24}}}
        >
            <div className="space-y-5">
                <div>
                    <Text className="!text-xs !font-semibold !uppercase !tracking-[0.22em] !text-slate-400">
                        Hồ sơ người dùng
                    </Text>
                    <Title level={4} className="!mb-0 !mt-1">
                        Trường thông tin theo workspace
                    </Title>
                    <Paragraph className="!mb-0 !mt-2 !text-sm !leading-7 !text-slate-500">
                        Tick các thông tin cần thu thập ở form đăng ký và hồ sơ người dùng. Họ tên và số điện thoại luôn bật vì đang là định danh cốt lõi của hệ thống.
                    </Paragraph>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-sm font-semibold text-slate-900">Thông tin luôn có</div>
                    <div className="mt-1 text-sm text-slate-500">
                        Hai trường này được giữ cố định vì đang là định danh gốc của tài khoản.
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {USER_PROFILE_FIELD_OPTIONS.filter((item) => item.disabled).map((item) => (
                            <div
                                key={item.value}
                                className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3"
                            >
                                <Checkbox checked disabled className="mt-1" />
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900">{item.label}</div>
                                    <div className="mt-1 text-xs text-slate-500">Bắt buộc luôn bật</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm font-semibold text-slate-900">Thông tin có thể bật theo workspace</div>
                    <div className="mt-1 text-sm text-slate-500">
                        Chỉ tick những trường mà tenant này thực sự cần thu thập khi đăng ký và cập nhật hồ sơ.
                    </div>

                    <Checkbox.Group value={selectedValues} onChange={handleChange} className="!mt-4 !w-full">
                        <div className="grid gap-3 md:grid-cols-2">
                            {USER_PROFILE_FIELD_OPTIONS.filter((item) => !item.disabled).map((item) => (
                                <label
                                    key={item.value}
                                    className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3"
                                >
                                    <Checkbox value={item.value} className="mt-1" />
                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-900">{item.label}</div>
                                        {item.value === "donViId" ? (
                                            <div className="mt-1 text-xs text-slate-500">
                                                Chọn từ danh mục đơn vị đang có trong hệ thống
                                            </div>
                                        ) : null}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </Checkbox.Group>
                </div>

                <Space>
                    <Button type="primary" onClick={handleSave} loading={saving}>
                        Cập nhật cấu hình
                    </Button>
                </Space>
            </div>
        </Card>
    );
}
