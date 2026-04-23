'use client'

import {Layout} from "antd";
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";

export default function PublicLayout({children}) {
    return (
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
    );
}
