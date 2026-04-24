'use client';

import {App, Button, Card, Form, Input} from "antd";
import {useEffect} from "react";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {useWorkspaceThemeStore} from "~/store/workspace-theme";
import {normalizePrimaryColor, parseThemePayload} from "~/utils/workspaceTheme";

export default function ColorThemeEditor({workspaceId = null}) {
    const [form] = Form.useForm();
    const {message} = App.useApp();
    const currentWorkspace = useWorkspaceThemeStore((state) => state.workspace);
    const setPrimaryColor = useWorkspaceThemeStore((state) => state.setPrimaryColor);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res = await layCauHinh("theme_settings", {workspaceId});

                if (!active) {
                    return;
                }

                const value = parseThemePayload(res?.data);
                form.setFieldsValue({
                    primaryColor: value.primaryColor,
                });
            } catch (error) {
                if (active) {
                    message.error(error?.message || "Không thể tải màu chủ đạo.");
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [form, message, workspaceId]);

    const handleColorChange = (event) => {
        form.setFieldValue("primaryColor", normalizePrimaryColor(event.target.value));
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            const primaryColor = normalizePrimaryColor(values.primaryColor);

            await suaCauHinh(
                "theme_settings",
                JSON.stringify({primaryColor}),
                {workspaceId}
            );

            if (!workspaceId || Number(currentWorkspace?.id) === Number(workspaceId)) {
                setPrimaryColor(primaryColor);
            }

            form.setFieldValue("primaryColor", primaryColor);
            message.success("Đã cập nhật màu chủ đạo");
        } catch (error) {
            if (error?.message) {
                message.error(error.message);
            }
        }
    };

    const primaryColor = normalizePrimaryColor(Form.useWatch("primaryColor", form));

    return (
        <Card title="Màu chủ đạo" className="rounded-[28px] border border-slate-200 shadow-sm">
            <Form form={form} layout="vertical">
                <Form.Item
                    name="primaryColor"
                    label="Mã màu hex"
                    rules={[{
                        required: true,
                        message: "Vui lòng nhập mã màu hex.",
                    }, {
                        pattern: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
                        message: "Màu phải theo định dạng #1948be hoặc #19b.",
                    }]}
                >
                    <Input placeholder="#1948be" />
                </Form.Item>

                <div className="mb-4 flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={handleColorChange}
                        className="h-14 w-20 cursor-pointer rounded-xl border-0 bg-transparent"
                    />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">Xem trước</div>
                        <div className="mt-2 flex flex-wrap gap-3">
                            <Button type="primary">Nút chính</Button>
                            <span
                                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white"
                                style={{backgroundColor: primaryColor}}
                            >
                                Nhãn thương hiệu
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="primary" onClick={save}>
                        Lưu màu chủ đạo
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
