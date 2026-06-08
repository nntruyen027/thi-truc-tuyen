const { parentPort, workerData } = require("worker_threads");
const { buildKetQuaTracNghiemExport } = require("./thi_export.service");

async function run() {
    try {
        const result = await buildKetQuaTracNghiemExport(workerData);
        parentPort.postMessage({
            ok: true,
            data: {
                fileName: result.fileName,
                buffer: Buffer.from(result.buffer),
            },
        });
    } catch (error) {
        parentPort.postMessage({
            ok: false,
            error: error?.message || String(error),
        });
    }
}

run();
