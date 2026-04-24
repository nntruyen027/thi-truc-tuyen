'use client';

import {useEffect} from "react";

import {layCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl} from "~/services/file";
import {parseMediaConfig} from "~/utils/workspaceTheme";

const DEFAULT_FAVICON = "/favicon.png";

function applyFavicon(url) {
    const baseUrl =
        url
            ? getPublicFileUrl(url)
            : DEFAULT_FAVICON;

    const resolved =
        baseUrl
            ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}v=${Date.now()}`
            : "";

    const definitions = [
        {rel: "icon", type: "image/png"},
        {rel: "shortcut icon", type: "image/png"},
        {rel: "apple-touch-icon", type: "image/png"},
    ];

    definitions.forEach(({rel, type}) => {
        document.head
            .querySelectorAll(`link[rel="${rel}"]:not([data-dynamic-favicon])`)
            .forEach((node) => {
                node.setAttribute("href", resolved);
                node.setAttribute("type", type);
            });

        let link =
            document.head.querySelector(`link[data-dynamic-favicon="${rel}"]`);

        if (!link) {
            link = document.createElement("link");
            link.setAttribute("data-dynamic-favicon", rel);
        }

        link.setAttribute("rel", rel);
        link.setAttribute("href", resolved);
        link.setAttribute("type", type);
        document.head.appendChild(link);
    });
}

export default function DynamicFavicon() {
    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res =
                    await layCauHinh("favicon");

                if (!active) {
                    return;
                }

                const faviconUrl =
                    parseMediaConfig(res?.data?.gia_tri).duongDan;

                applyFavicon(faviconUrl);
            } catch {
                if (active) {
                    applyFavicon("");
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    return null;
}
