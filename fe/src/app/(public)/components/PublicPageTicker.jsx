'use client';

import Image from "next/image";
import Reveal from "~/app/components/common/Reveal";
import {alphaColor} from "~/utils/workspaceTheme";

export default function PublicPageTicker({
    items,
    compactTicker,
    colorPrimary,
    activeSection,
    onSelect,
}) {
    return (
        <div
            className={`sticky z-30 border-b transition-all duration-300 ${
                compactTicker
                    ? "top-0 backdrop-blur-xl"
                    : "top-0"
            }`}
            style={{
                background: compactTicker
                    ? "rgba(255,255,255,0.92)"
                    : null,
                borderColor: alphaColor(colorPrimary, compactTicker ? 0.18 : 0),
                boxShadow: compactTicker
                    ? `0 14px 30px ${alphaColor(colorPrimary, 0.12)}`
                    : null,
            }}
        >
            <div className="mx-auto w-full px-4 sm:px-10 md:px-10 lg:px-30 xl:px-50 2xl:px-70">
                <Reveal delay={80} className="h-full w-full">
                    <div
                        className={`flex gap-3 overflow-x-auto py-2 transition-all duration-300 md:grid md:grid-cols-4 md:overflow-visible ${
                            compactTicker ? "md:py-1.5" : "md:py-2.5"
                        }`}
                    >
                        {items.map((item) => {
                            const isActive = activeSection === item.key;

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => onSelect(item.key)}
                                    className={`min-w-[9.5rem] shrink-0 flex flex-col gap-1 rounded-2xl border transition duration-300 hover:cursor-pointer md:min-w-0 ${
                                        compactTicker
                                            ? "min-h-0 items-center justify-center px-3 py-2 text-center"
                                            : "min-h-20 items-center justify-start px-4 py-3 text-left"
                                    } ${
                                        isActive
                                            ? "shadow-sm"
                                            : "md:hover:-translate-y-2 hover:shadow-sm"
                                    }`}
                                    style={isActive
                                        ? {
                                            borderColor: colorPrimary,
                                            backgroundColor: alphaColor(colorPrimary, 0.12),
                                            color: colorPrimary,
                                        }
                                        : {
                                            borderColor: alphaColor(colorPrimary, 0.16),
                                            backgroundColor: compactTicker ? "rgba(255,255,255,0.88)" : "#ffff",
                                            color: "#334155",
                                        }}
                                >
                                    <Image
                                        src={item.image}
                                        width={compactTicker ? 24 : 48}
                                        height={compactTicker ? 24 : 48}
                                        alt=""
                                    />
                                    {compactTicker ? (
                                        <span className="text-sm font-semibold">
                                            {item.title}
                                        </span>
                                    ) : (
                                        <span
                                            className="mt-1 text-xl! font-bold md:text-base"
                                            style={{color: isActive ? colorPrimary : "#000"}}
                                        >
                                            {item.title}
                                        </span>
                                           
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Reveal>
            </div>
        </div>
    );
}
