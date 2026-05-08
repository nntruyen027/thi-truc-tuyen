'use client';

import Reveal from "~/app/components/common/Reveal";
import {getPublicFileUrl} from "~/services/file";

export default function PublicPageBanner({
    image,
    zoom,
    positionX = 50,
    positionY = 50,
    isMobileViewport,
}) {
    return (
        <Reveal animation="soft">
            <div className="w-full">
                <div
                    className="relative w-full overflow-hidden bg-[#fdf7df] shadow-sm"
                    style={{
                        aspectRatio: isMobileViewport ? "16/9" : "16/4",
                    }}
                >
                    {image ? (
                        <img
                            src={getPublicFileUrl(image)}
                            alt=""
                            style={{
                                width: `${100 * zoom}%`,
                                height: `${100 * zoom}%`,
                                objectFit: "cover",
                                objectPosition: `${positionX}% ${positionY}%`,
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                    ) : null}

                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.22)_100%)]" />
                </div>
            </div>
        </Reveal>
    );
}
