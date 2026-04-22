import "./globals.css";
import "antd/dist/reset.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
    title: 'Thi trực tuyến',
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    }
};

export default function RootLayout({children}) {


    return (
        <html lang="en">
        <body className="min-h-screen bg-slate-50 p-0 m-0 overflow-x-hidden">
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}
