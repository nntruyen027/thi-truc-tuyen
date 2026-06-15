'use client';

import dayjs from "dayjs";
import {Button} from "antd";
import {CheckCircleFilled, ClockCircleFilled} from "@ant-design/icons";
import {alphaColor} from "~/utils/workspaceTheme";

export default function PublicContestTimeline({
    items,
    colorPrimary,
    onItemClick,
    onResultClick,
}) {
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
                const clickable = typeof onItemClick === "function";
                const canOpenResult = isDone && typeof onResultClick === "function";

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
                                className={`relative min-w-0 flex-1 rounded-[24px] border px-4 py-4 transition-all duration-300 sm:px-5 xl:min-h-[170px] ${clickable ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" : ""}`}
                                role={clickable ? "button" : undefined}
                                tabIndex={clickable ? 0 : undefined}
                                onClick={clickable ? () => onItemClick(item) : undefined}
                                onKeyDown={clickable ? (event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onItemClick(item);
                                    }
                                } : undefined}
                                style={{
                                    background: isCurrent
                                        ? `linear-gradient(180deg, ${alphaColor(colorPrimary, 0.1)} 0%, #ffffff 100%)`
                                        : "#ffffff",
                                    borderColor: isCurrent ? alphaColor(colorPrimary, 0.34) : alphaColor(accentColor, 0.14),
                                    boxShadow: isCurrent
                                        ? `0 18px 36px ${alphaColor(colorPrimary, 0.18)}`
                                        : undefined,
                                }}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div
                                            className="text-base font-bold leading-7 sm:text-lg xl:text-xl"
                                            style={{color: isDone ? "#334155" : isCurrent ? colorPrimary : "#0f172a"}}
                                        >
                                            {item.ten}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                        {canOpenResult ? (
                                            <Button
                                                type="default"
                                                size="middle"
                                                className="!rounded-xl !font-semibold"
                                                style={{
                                                    borderColor: alphaColor(colorPrimary, 0.18),
                                                    color: colorPrimary,
                                                }}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onResultClick(item);
                                                }}
                                            >
                                                Kết quả
                                            </Button>
                                        ) : null}
                                        <div
                                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                                            style={{
                                                background: isDone
                                                    ? "rgba(148,163,184,0.12)"
                                                    : isCurrent
                                                        ? colorPrimary
                                                        : alphaColor(colorPrimary, 0.08),
                                                color: isDone ? "#64748b" : isCurrent ? "#ffffff" : colorPrimary,
                                                border: `1px solid ${isDone ? "rgba(148,163,184,0.18)" : isCurrent ? colorPrimary : alphaColor(colorPrimary, 0.12)}`,
                                            }}
                                        >
                                            {item.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div
                                        className="space-y-2 rounded-2xl border px-4 py-3 text-sm text-slate-600"
                                        style={{
                                            borderColor: isCurrent ? alphaColor(colorPrimary, 0.24) : alphaColor(accentColor, 0.12),
                                            background: isCurrent ? alphaColor(colorPrimary, 0.05) : "#ffffff",
                                        }}
                                    >
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
