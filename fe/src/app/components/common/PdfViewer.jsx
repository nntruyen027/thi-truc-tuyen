'use client';

import {Document, Page, pdfjs} from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ url }) {

    return (

        <div>

            <Document file={url}>

                <Page pageNumber={1} />

            </Document>

        </div>

    );

}