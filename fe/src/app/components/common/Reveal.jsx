'use client';

import {useEffect, useRef, useState} from "react";

export default function Reveal({
    children,
    className = "",
    animation = "up",
    delay = 0,
    once = true,
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);

                    if (once) {
                        observer.disconnect();
                    }
                } else if (!once) {
                    setVisible(false);
                }
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -8% 0px",
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [once]);

    const animationClass =
        animation === "soft"
            ? "reveal-soft-observe"
            : "reveal-up-observe";

    return (
        <div
            ref={ref}
            className={`${animationClass} ${visible ? "is-visible" : ""} ${className}`.trim()}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
