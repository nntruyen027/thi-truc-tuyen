'use client';

import Reveal from "~/app/components/common/Reveal";
import {getPublicFileUrl} from "~/services/file";

export default function PublicPageBanner({
    image,
    positionX = 50,
    positionY = 50,
    isMobileViewport,
}) {
    return (
        <div className="w-full overflow-hidden">
            <Reveal animation="soft">
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
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: `${positionX}% ${positionY}%`,
                                position: "absolute",
                                inset: 0,
                            }}
                        />
                        ) : null}
                </div>
            </Reveal>
        </div>
    );
}
