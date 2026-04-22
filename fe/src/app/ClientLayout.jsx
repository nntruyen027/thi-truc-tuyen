"use client";

import {App, ConfigProvider} from "antd";
import InnerLayout from "./InnerLayout";
import DynamicFavicon from "~/app/components/common/DynamicFavicon";

export default function ClientLayout({children}) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1948be'
                },
                components: {
                    Menu: {
                        itemHeight: 36,
                        fontSize: 14,
                        itemSelectedColor: '#1948be',
                        itemSelectedBg: 'rgba(25,72,190,0.08)',

                        itemHoverColor: '#1948be',             // hover chữ
                        itemHoverBg: 'rgba(25,72,190,0.08)',   // hover nền
                    },
                    Table: {
                        headerBg: "rgba(25,72,190,0.1)",          // nền header
                        headerColor: "black",       // chữ header
                        headerSplitColor: "#ffffff30",
                        borderColor: "#f0f0f0",
                    }

                }
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
