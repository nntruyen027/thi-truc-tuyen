"use client"

import {useEffect, useRef, useState} from "react"
import {theme, Typography} from "antd"

const {Text} = Typography

export default function CountDown({seconds, onEnd, className = ""}) {
    const {token} = theme.useToken()

    const [t, setT] = useState(seconds ?? 0)
    const [seed] = useState(seconds ?? 0)
    const onEndRef = useRef(onEnd)

    useEffect(() => {
        onEndRef.current = onEnd
    }, [onEnd])


    useEffect(() => {
        if (seed == null) return

        const timer = setInterval(() => {
            setT(prev => {
                if (prev <= 0) {
                    clearInterval(timer)
                    onEndRef.current?.()
                    return 0
                }

                return prev - 1
            })

        }, 1000)

        return () => clearInterval(timer)

    }, [seed])


    const total =
        Math.max(0, t || 0)

    const gio = Math.floor(total / 3600)
    const phut = Math.floor((total % 3600) / 60)
    const giay = total % 60

    const items = [
        {label: "Giờ", value: gio},
        {label: "Phút", value: phut},
        {label: "Giây", value: giay},
    ]

    return (
        <div
            className={`grid h-full min-h-[8.75rem] grid-cols-3 gap-3 rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5faff_100%)] p-3 sm:min-w-[18rem] ${className}`.trim()}
            style={{
                boxShadow: "0 18px 40px rgba(37, 99, 235, 0.12)",
            }}
        >
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex min-h-[6.75rem] flex-col justify-center rounded-[22px] border border-white bg-white px-3 py-4 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                >
                    <div
                        className="text-[1.8rem] font-bold leading-none sm:text-[2rem]"
                        style={{color: token.colorPrimary}}
                    >
                        {String(item.value).padStart(2, "0")}
                    </div>
                    <Text className="!mt-3 !block !text-[11px] !font-semibold !uppercase !tracking-[0.22em] !text-slate-500">
                        {item.label}
                    </Text>
                </div>
            ))}
        </div>
    )

}
