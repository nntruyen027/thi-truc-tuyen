'use client';

import {useEffect, useState} from "react";

export default function UserInteractionGuard() {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

    useEffect(() => {
        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        const handleKeyDown = (event) => {
            const key =
                String(event.key || "").toLowerCase();

            const blocked =
                key === "f12"
                || (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key))
                || (event.ctrlKey && key === "u");

            if (blocked) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        const detectDevTools = () => {
            const widthGap =
                window.outerWidth - window.innerWidth;
            const heightGap =
                window.outerHeight - window.innerHeight;

            const opened =
                widthGap > 160 || heightGap > 160;

            setIsDevToolsOpen(opened);
            document.body.classList.toggle("devtools-open", opened);
        };

        window.addEventListener("contextmenu", handleContextMenu);
        window.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("resize", detectDevTools);

        const interval =
            window.setInterval(detectDevTools, 1200);

        detectDevTools();

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("resize", detectDevTools);
            window.clearInterval(interval);
            document.body.classList.remove("devtools-open");
        };
    }, []);

    if (!isDevToolsOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/95 px-6 text-center text-white">
            <div className="max-w-xl space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                    Chế độ bảo vệ
                </div>
                <div className="text-2xl font-bold md:text-3xl">
                    Khu vực này đang hạn chế công cụ kiểm tra trình duyệt
                </div>
                <div className="text-sm leading-7 text-slate-300 md:text-base">
                    Hãy đóng DevTools để tiếp tục. Lưu ý: với ứng dụng web, đây chỉ là lớp hạn chế ở giao diện, không phải cơ chế chặn tuyệt đối ở cấp trình duyệt.
                </div>
            </div>
        </div>
    );
}
