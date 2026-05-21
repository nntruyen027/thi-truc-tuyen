'use client'

import {ConfigProvider, Layout} from "antd";
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";
import {alphaColor, hexToRgbString} from "~/utils/workspaceTheme";

const DEMO_PRIMARY_COLOR = "#d63232";

export default function Demo1Layout({children}) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: DEMO_PRIMARY_COLOR,
                },
            }}
        >
            <div
                style={{
                    "--workspace-primary-color": DEMO_PRIMARY_COLOR,
                    "--workspace-primary-rgb": hexToRgbString(DEMO_PRIMARY_COLOR),
                    "--workspace-primary-soft": alphaColor(DEMO_PRIMARY_COLOR, 0.08),
                    "--workspace-primary-soft-strong": alphaColor(DEMO_PRIMARY_COLOR, 0.14),
                }}
            >
                <Layout
                    className="public-font bg-slate-50 text-slate-900"
                    style={{
                        minHeight: "100vh"
                    }}
                >
                    <UserInteractionGuard disableCopy />
                    <Layout.Content className="flex-1">
                        {children}
                    </Layout.Content>

                    <Footer />
                </Layout>
            </div>
        </ConfigProvider>
    );
}
