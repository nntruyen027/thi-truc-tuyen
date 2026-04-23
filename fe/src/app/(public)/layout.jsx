'use client'

import {Layout} from "antd";
import {Raleway} from 'next/font/google';
import Footer from "~/app/components/public/Footer";
import UserInteractionGuard from "~/app/components/common/UserInteractionGuard";

const raleway = Raleway({
    subsets: ['latin', 'vietnamese'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-raleway',
    display: 'swap',
});

export default function PublicLayout({children}) {
    return (
        <Layout
            className={`${raleway.className} bg-slate-50 text-slate-900`}
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
