'use client'

import {ConfigProvider, Layout} from "antd";

import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";
import {alphaColor, hexToRgbString} from "~/utils/workspaceTheme";

const DEMO4_PRIMARY_COLOR = "#e53935";
const DEMO4_FOOTER_COLOR = "#b71c1c";
const DEMO4_FOOTER_BOTTOM_COLOR = "#7f1d1d";

export default function Demo4Layout({children}) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: DEMO4_PRIMARY_COLOR,
                },
            }}
        >
            <div
                style={{
                    "--workspace-primary-color": DEMO4_PRIMARY_COLOR,
                    "--workspace-primary-rgb": hexToRgbString(DEMO4_PRIMARY_COLOR),
                    "--workspace-primary-soft": alphaColor(DEMO4_PRIMARY_COLOR, 0.08),
                    "--workspace-primary-soft-strong": alphaColor(DEMO4_PRIMARY_COLOR, 0.16),
                }}
            >
                <Layout
                    className="public-font bg-[#fffaf5] text-slate-900"
                    style={{minHeight: "100vh", overflow: "visible"}}
                >
                    <UserInteractionGuard disableCopy />
                    <Layout.Content className="flex-1" style={{overflow: "visible"}}>
                        {children}
                    </Layout.Content>
                    <div
                        className="relative z-20"
                        style={{
                            background: DEMO4_FOOTER_COLOR,
                            isolation: "isolate",
                        }}
                    >
                        <Footer
                            backgroundColor={DEMO4_FOOTER_COLOR}
                            bottomBackgroundColor={DEMO4_FOOTER_BOTTOM_COLOR}
                        />
                    </div>
                </Layout>
                <style>{`
                    html {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(185, 28, 28, 0.92) rgba(255, 250, 245, 0.38);
                    }

                    html::-webkit-scrollbar,
                    body::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }

                    html::-webkit-scrollbar-thumb,
                    body::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, rgba(239, 68, 68, 0.96) 0%, rgba(185, 28, 28, 0.96) 100%);
                        border-radius: 999px;
                        border: 1px solid rgba(255, 250, 245, 0.75);
                    }

                    html::-webkit-scrollbar-track,
                    body::-webkit-scrollbar-track {
                        background: rgba(255, 250, 245, 0.28);
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
}
