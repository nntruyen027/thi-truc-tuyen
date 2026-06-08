import "./globals.css";
import "antd/dist/reset.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
    title: 'Thi trực tuyến',
    other: {
        google: "notranslate",
    },
};

export default function RootLayout({children}) {


    return (
        <html lang="vi" translate="no" className="notranslate">
        <body className="notranslate min-h-screen bg-slate-50 p-0 m-0 overflow-x-hidden">
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}
