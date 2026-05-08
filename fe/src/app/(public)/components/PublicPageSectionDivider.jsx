'use client';

import {alphaColor, lightenColor} from "~/utils/workspaceTheme";

export default function PublicPageSectionDivider({colorPrimary}) {
    return (
        <div className="flex items-center justify-center py-1 md:py-1.5" aria-hidden="true">
            <div className="flex w-full max-w-3xl items-center gap-4 md:gap-5">
                <div
                    className="h-px flex-1"
                    style={{
                        background: `linear-gradient(90deg, transparent 0%, ${alphaColor(colorPrimary, 0.24)} 100%)`,
                    }}
                />
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border"
                    style={{
                        borderColor: alphaColor(colorPrimary, 0.22),
                        background: `radial-gradient(circle, ${alphaColor(colorPrimary, 0.16)} 0%, ${alphaColor(colorPrimary, 0.06)} 55%, rgba(255,255,255,0.95) 100%)`,
                        boxShadow: `0 8px 20px ${alphaColor(colorPrimary, 0.1)}`,
                    }}
                >
                    <div
                        className="h-2.5 w-2.5 rotate-45 rounded-[4px]"
                        style={{
                            background: `linear-gradient(135deg, ${lightenColor(colorPrimary, 0.22)} 0%, ${colorPrimary} 100%)`,
                        }}
                    />
                </div>
                <div
                    className="h-px flex-1"
                    style={{
                        background: `linear-gradient(90deg, ${alphaColor(colorPrimary, 0.24)} 0%, transparent 100%)`,
                    }}
                />
            </div>
        </div>
    );
}
