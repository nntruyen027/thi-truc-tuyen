import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';


const cache = new Map();

export async function getPdfPreview(pdfUrl) {
    if (cache.has(pdfUrl)) return cache.get(pdfUrl);

    const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({scale: 1.2});
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({canvasContext: ctx, viewport}).promise;

    const img = canvas.toDataURL('image/png');
    cache.set(pdfUrl, img);
    return img;
}
