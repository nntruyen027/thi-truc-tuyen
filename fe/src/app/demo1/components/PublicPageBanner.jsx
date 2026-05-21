'use client';

import Image from "next/image";
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
                        <Image
                            src={getPublicFileUrl(image)}
                            alt=""
                            fill
                            unoptimized
                            style={{
                                width: `${100 * zoom}%`,
                                height: `${100 * zoom}%`,
                                objectFit: "cover",
                                objectPosition: `${positionX}% ${positionY}%`,
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                maxWidth: "none",
                                maxHeight: "none",
                            }}
                        />
                    ) : null}
                </div>
            </div>
        </Reveal>
    );
}
