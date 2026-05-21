'use client'

import {ConfigProvider, Layout} from "antd";
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";
import {alphaColor, hexToRgbString} from "~/utils/workspaceTheme";

const DEMO3_PRIMARY_COLOR = "#c91f1f";

export default function Demo3Layout({children}) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: DEMO3_PRIMARY_COLOR,
                },
            }}
        >
            <div
                style={{
                    "--workspace-primary-color": DEMO3_PRIMARY_COLOR,
                    "--workspace-primary-rgb": hexToRgbString(DEMO3_PRIMARY_COLOR),
                    "--workspace-primary-soft": alphaColor(DEMO3_PRIMARY_COLOR, 0.08),
                    "--workspace-primary-soft-strong": alphaColor(DEMO3_PRIMARY_COLOR, 0.16),
                }}
            >
                <Layout
                    className="public-font bg-[#fff6e7] text-slate-900"
                    style={{minHeight: "100vh"}}
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
