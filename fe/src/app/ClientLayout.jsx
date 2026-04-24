"use client";

import {App, ConfigProvider} from "antd";
import {useEffect} from "react";
import InnerLayout from "./InnerLayout";
import DynamicFavicon from "~/app/components/common/DynamicFavicon";
import {layCauHinh} from "~/services/cau-hinh";
import {layWorkspaceHienTai} from "~/services/workspace";
import {useWorkspaceThemeStore} from "~/store/workspace-theme";
import {alphaColor, hexToRgbString, parseThemePayload} from "~/utils/workspaceTheme";

export default function ClientLayout({children}) {
    const primaryColor = useWorkspaceThemeStore((state) => state.primaryColor);
    const setPrimaryColor = useWorkspaceThemeStore((state) => state.setPrimaryColor);
    const setWorkspace = useWorkspaceThemeStore((state) => state.setWorkspace);

    useEffect(() => {
        let active = true;

        const loadTheme = async () => {
            try {
                const [workspace, themeConfig] = await Promise.all([
                    layWorkspaceHienTai().catch(() => null),
                    layCauHinh("theme_settings").catch(() => null),
                ]);

                if (!active) {
                    return;
                }

                setWorkspace(workspace);
                setPrimaryColor(parseThemePayload(themeConfig?.data).primaryColor);
            } catch {
                if (active) {
                    setPrimaryColor();
                }
            }
        };

        void loadTheme();

        return () => {
            active = false;
        };
    }, [setPrimaryColor, setWorkspace]);

    useEffect(() => {
        const root = document.documentElement;
        const rgb = hexToRgbString(primaryColor);

        root.style.setProperty("--workspace-primary-color", primaryColor);
        root.style.setProperty("--workspace-primary-rgb", rgb);
        root.style.setProperty("--workspace-primary-soft", alphaColor(primaryColor, 0.08));
        root.style.setProperty("--workspace-primary-soft-strong", alphaColor(primaryColor, 0.14));
    }, [primaryColor]);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: primaryColor,
                },
                components: {
                    Menu: {
                        itemHeight: 36,
                        fontSize: 14,
                        itemSelectedColor: primaryColor,
                        itemSelectedBg: alphaColor(primaryColor, 0.08),
                        itemHoverColor: primaryColor,
                        itemHoverBg: alphaColor(primaryColor, 0.08),
                    },
                    Table: {
                        headerBg: alphaColor(primaryColor, 0.1),
                        headerColor: "black",
                        headerSplitColor: "#ffffff30",
                        borderColor: "#f0f0f0",
                    },
                },
            }}
        >
            <App
                message={{
                    maxCount: 3,
                    duration: 3,
                    top: 70,
                }}
            >
                <DynamicFavicon />
                <InnerLayout>{children}</InnerLayout>
            </App>
        </ConfigProvider>

    );
}
