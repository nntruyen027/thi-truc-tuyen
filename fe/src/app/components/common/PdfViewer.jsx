"use client"

import {useEffect, useRef, useState} from "react"
import {Alert, Empty, Spin} from "antd"
import {Document, Page, pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PdfViewer({url}) {
    if (!url) {
        return (
            <div className="flex min-h-[18rem] items-center justify-center rounded-[24px] bg-slate-50 p-6">
                <Empty description="Chưa có tài liệu PDF" />
            </div>
        )
    }

    return <PdfViewerDocument key={url} url={url} />
}

function PdfViewerDocument({url}) {
    const containerRef = useRef(null)

    const [numPages, setNumPages] = useState(0)
    const [width, setWidth] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const element = containerRef.current

        if (!element) {
            return
        }

        const updateWidth = () => {
            setWidth(Math.max(0, Math.floor(element.clientWidth)))
        }

        updateWidth()

        const observer = new ResizeObserver(() => {
            updateWidth()
        })

        observer.observe(element)
        window.addEventListener("resize", updateWidth)

        return () => {
            observer.disconnect()
            window.removeEventListener("resize", updateWidth)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="w-full rounded-[24px] bg-slate-50 p-3 sm:p-4"
        >
            {error && (
                <Alert
                    type="error"
                    showIcon
                    className="mb-4"
                    message="Không thể hiển thị tài liệu PDF"
                    description={error}
                />
            )}

            <Document
                file={url}
                loading={
                    <div className="flex min-h-[18rem] items-center justify-center">
                        <Spin size="large" />
                    </div>
                }
                error={null}
                onLoadSuccess={({numPages: totalPages}) => {
                    setNumPages(totalPages)
                    setLoading(false)
                    setError("")
                }}
                onLoadError={(loadError) => {
                    setLoading(false)
                    setError(loadError?.message || "Tài liệu không hợp lệ hoặc không thể tải.")
                }}
            >
                <div className="space-y-4">
                    {!error && loading && (
                        <div className="flex min-h-[18rem] items-center justify-center">
                            <Spin size="large" />
                        </div>
                    )}

                    {!error && width > 0 && numPages > 0 && Array.from({length: numPages}, (_, index) => (
                        <div
                            key={`pdf-page-${index + 1}`}
                            className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                        >
                            <Page
                                pageNumber={index + 1}
                                width={width - 24}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="[&>canvas]:!h-auto [&>canvas]:!max-w-full"
                            />
                        </div>
                    ))}
                </div>
            </Document>
        </div>
    )
}
