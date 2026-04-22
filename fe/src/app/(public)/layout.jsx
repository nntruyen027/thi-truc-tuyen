'use client'

import {Layout, theme, Typography} from "antd";
import {Raleway} from 'next/font/google';
import Footer from "~/app/components/public/Footer";

const {Title} = Typography;

const raleway = Raleway({
    subsets: ['latin', 'vietnamese'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-raleway',
    display: 'swap',
});

export default function PublicLayout({children}) {
    const {token} = theme.useToken();




    return (

        <Layout
            className={raleway.className}
            style={{
                minHeight: "100vh"
            }}
        >

            <Layout.Content>
                {children}
            </Layout.Content>


            <Footer />
        </Layout>
    );
}