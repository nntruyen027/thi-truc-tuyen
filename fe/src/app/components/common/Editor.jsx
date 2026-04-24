'use client';

import {useEffect, useRef} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {uploadFile} from "~/services/file";

const Font = Quill.import("formats/font");
Font.whitelist = [
    "sans",
    "serif",
    "mono",
    "roboto",
    "times",
];

const modules = {
    toolbar: {
        container: [
            [{font: Font.whitelist}],
            [{header: [1, 2, 3, false]}],
            ["bold", "italic", "underline", "strike"],
            [{list: "ordered"}, {list: "bullet"}],
            ["link", "image", "blockquote"],
            [{align: []}],
            ["clean"],
        ],
        handlers: {
            image: function () {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.click();

                input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;

                    const res = await uploadFile(file);
                    const url = res.url || res.duong_dan;

                    const quill = this.quill;
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", url);
                };
            },
        },
    },
};

export default function Editor({value, onChange}) {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;

        quillRef.current = new Quill(editorRef.current, {
            theme: "snow",
            modules,
        });

        quillRef.current.on("text-change", () => {
            onChangeRef.current?.(quillRef.current.root.innerHTML);
        });
    }, []);

    useEffect(() => {
        if (!quillRef.current) return;
        if (value !== quillRef.current.root.innerHTML) {
            quillRef.current.root.innerHTML = value || "";
        }
    }, [value]);

    return <div ref={editorRef}/>;
}
