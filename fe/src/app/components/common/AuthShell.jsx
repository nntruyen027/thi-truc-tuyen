'use client';

import Link from "next/link";

export default function AuthShell({title, subtitle, children}) {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 sm:px-6"
            style={{
                backgroundImage:
                    "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(var(--workspace-primary-rgb),0.72)), url('/bg_auth.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full max-w-xl rounded-[28px] border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur md:p-8">
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition"
                        style={{
                            borderColor: "rgba(var(--workspace-primary-rgb), 0.22)",
                            color: "var(--workspace-primary-color)",
                        }}
                    >
                        Về trang chủ
                    </Link>
                </div>
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-[0.08em] md:text-3xl" style={{color: "var(--workspace-primary-color)"}}>
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 md:text-base">
                            {subtitle}
                        </p>
                    )}
                </div>

                {children}
            </div>
        </div>
    );
}
