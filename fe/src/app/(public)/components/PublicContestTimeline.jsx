'use client';

import dayjs from "dayjs";
import {CheckCircleFilled, ClockCircleFilled} from "@ant-design/icons";
import {alphaColor} from "~/utils/workspaceTheme";

export default function PublicContestTimeline({items, colorPrimary}) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
            style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
        >
            {items.map((item, index) => {
                const isDone = item.tone === "done";
                const isCurrent = item.tone === "current";
                const accentColor = isDone ? "#94a3b8" : colorPrimary;

                return (
                    <div key={item.id} className="relative min-w-0">
                        {index > 0 ? (
                            <div
                                className="pointer-events-none absolute left-0 right-1/2 top-6 hidden h-[2px] xl:block"
                                style={{
                                    background: `linear-gradient(90deg, ${alphaColor(colorPrimary, 0.08)} 0%, ${alphaColor(accentColor, 0.24)} 100%)`,
                                }}
                            />
                        ) : null}

                        {index < items.length - 1 ? (
                            <div
                                className="pointer-events-none absolute left-1/2 right-0 top-6 hidden h-[2px] xl:block"
                                style={{
                                    background: `linear-gradient(90deg, ${alphaColor(accentColor, 0.24)} 0%, ${alphaColor(colorPrimary, 0.08)} 100%)`,
                                }}
                            />
                        ) : null}

                        <div className="flex items-start gap-3 sm:gap-4 xl:flex-col xl:items-stretch xl:gap-3">
                            <div className="relative z-[1] pt-1 xl:flex xl:w-full xl:justify-center xl:pt-0">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 bg-white text-base sm:h-12 sm:w-12 sm:text-lg"
                                    style={{
                                        borderColor: isDone ? "#cbd5e1" : isCurrent ? colorPrimary : alphaColor(colorPrimary, 0.22),
                                        color: isDone ? "#64748b" : colorPrimary,
                                        boxShadow: isCurrent ? `0 10px 24px ${alphaColor(colorPrimary, 0.16)}` : undefined,
                                    }}
                                >
                                    {isDone ? <CheckCircleFilled /> : <ClockCircleFilled />}
                                </div>
                            </div>

                            <div
                                className="relative min-w-0 flex-1 rounded-[24px] border bg-white px-4 py-4 transition-all duration-300 sm:px-5 xl:min-h-[170px]"
                                style={{
                                    borderColor: isCurrent ? alphaColor(colorPrimary, 0.34) : alphaColor(accentColor, 0.14),
                                    boxShadow: isCurrent ? `0 16px 32px ${alphaColor(colorPrimary, 0.12)}` : undefined,
                                }}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div
                                        className="text-base font-bold leading-7 sm:text-lg xl:text-xl"
                                        style={{color: isDone ? "#334155" : isCurrent ? colorPrimary : "#0f172a"}}
                                    >
                                        {item.ten}
                                    </div>
                                    <div
                                        className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                                        style={{
                                            background: isDone ? "rgba(148,163,184,0.12)" : alphaColor(colorPrimary, isCurrent ? 0.14 : 0.08),
                                            color: isDone ? "#64748b" : colorPrimary,
                                            border: `1px solid ${isDone ? "rgba(148,163,184,0.18)" : alphaColor(colorPrimary, isCurrent ? 0.2 : 0.12)}`,
                                        }}
                                    >
                                        {item.status}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="space-y-2 rounded-2xl border px-4 py-3 text-sm text-slate-600" style={{borderColor: alphaColor(accentColor, 0.12)}}>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                            <span className="font-medium text-slate-500">Bắt đầu</span>
                                            <span className="font-semibold text-slate-900">
                                                {dayjs(item.thoiGianBatDau).format("DD/MM/YYYY")}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                            <span className="font-medium text-slate-500">Kết thúc</span>
                                            <span className="font-semibold text-slate-900">
                                                {dayjs(item.thoiGianKetThuc).format("DD/MM/YYYY")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
