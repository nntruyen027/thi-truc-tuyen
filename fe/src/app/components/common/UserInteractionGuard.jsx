"use client"

import {useEffect, useState} from "react"

function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    return Boolean(
        target.closest("input, textarea, [contenteditable='true'], .ql-editor")
    )
}

function isLikelyMobileBrowser() {
    if (typeof window === "undefined") {
        return false
    }

    const ua = window.navigator.userAgent || ""
    const touchPoints = window.navigator.maxTouchPoints || 0
    const hasCoarsePointer =
        typeof window.matchMedia === "function"
            ? window.matchMedia("(pointer: coarse)").matches
            : false

    return /android|iphone|ipad|ipod|mobile/i.test(ua)
        || touchPoints > 1
        || hasCoarsePointer
}

export default function UserInteractionGuard({
    blockDevTools = false,
    disableCopy = false,
}) {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)

    useEffect(() => {
        const mobileBrowser =
            isLikelyMobileBrowser()

        const shouldDetectDevTools =
            blockDevTools && !mobileBrowser

        const handleContextMenu = (event) => {
            if (!disableCopy && !shouldDetectDevTools) {
                return
            }

            if (isEditableTarget(event.target)) {
                return
            }

            event.preventDefault()
        }

        const handleCopyLike = (event) => {
            if (!disableCopy) {
                return
            }

            if (isEditableTarget(event.target)) {
                return
            }

            event.preventDefault()
            event.stopPropagation()
        }

        const handleKeyDown = (event) => {
            const key =
                String(event.key || "").toLowerCase()

            const isInspectShortcut =
                shouldDetectDevTools && (
                    key === "f12"
                    || ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].includes(key))
                    || ((event.ctrlKey || event.metaKey) && key === "u")
                )

            const isCopyShortcut =
                disableCopy
                && (event.ctrlKey || event.metaKey)
                && ["c", "x", "a", "s"].includes(key)
                && !isEditableTarget(event.target)

            if (!isInspectShortcut && !isCopyShortcut) {
                return
            }

            event.preventDefault()
            event.stopPropagation()
        }

        const detectDevTools = () => {
            if (!shouldDetectDevTools) {
                setIsDevToolsOpen(false)
                document.body.classList.remove("devtools-open")
                return
            }

            const widthGap =
                window.outerWidth - window.innerWidth
            const heightGap =
                window.outerHeight - window.innerHeight

            const opened =
                widthGap > 220 || heightGap > 220

            setIsDevToolsOpen(opened)
            document.body.classList.toggle("devtools-open", opened)
        }

        if (disableCopy) {
            document.body.classList.add("copy-guard")
        }

        window.addEventListener("contextmenu", handleContextMenu)
        window.addEventListener("copy", handleCopyLike, true)
        window.addEventListener("cut", handleCopyLike, true)
        window.addEventListener("dragstart", handleCopyLike, true)
        window.addEventListener("keydown", handleKeyDown, true)

        if (shouldDetectDevTools) {
            window.addEventListener("resize", detectDevTools)
        }

        const interval =
            shouldDetectDevTools
                ? window.setInterval(detectDevTools, 1200)
                : null

        detectDevTools()

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu)
            window.removeEventListener("copy", handleCopyLike, true)
            window.removeEventListener("cut", handleCopyLike, true)
            window.removeEventListener("dragstart", handleCopyLike, true)
            window.removeEventListener("keydown", handleKeyDown, true)

            if (shouldDetectDevTools) {
                window.removeEventListener("resize", detectDevTools)
            }

            if (interval) {
                window.clearInterval(interval)
            }

            document.body.classList.remove("devtools-open")
            document.body.classList.remove("copy-guard")
        }
    }, [blockDevTools, disableCopy])

    if (!blockDevTools || !isDevToolsOpen) {
        return null
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
    )
}
