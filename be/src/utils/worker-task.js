const path = require("path");
const { Worker } = require("worker_threads");

const DEFAULT_TIMEOUT_MS = Number(process.env.WORKER_TASK_TIMEOUT_MS || 120000);

function runWorkerTask(workerRelativePath, payload, options = {}) {
    const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
    const workerPath = path.resolve(__dirname, "..", workerRelativePath);

    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, {
            workerData: payload,
        });

        let settled = false;
        let timeoutId = null;

        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        const finish = (handler) => (value) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            handler(value);
        };

        const resolveOnce = finish(resolve);
        const rejectOnce = finish((error) => {
            reject(error instanceof Error ? error : new Error(String(error)));
        });

        timeoutId = setTimeout(() => {
            worker.terminate().catch(() => null);
            rejectOnce(new Error("Tác vụ xử lý nền quá thời gian cho phép."));
        }, timeoutMs);

        worker.once("message", (message) => {
            if (message?.ok) {
                resolveOnce(message.data);
                return;
            }

            rejectOnce(message?.error || "Tác vụ xử lý nền thất bại.");
        });

        worker.once("error", rejectOnce);
        worker.once("exit", (code) => {
            if (!settled && code !== 0) {
                rejectOnce(new Error(`Worker dừng bất thường với mã ${code}.`));
            }
        });
    });
}

module.exports = {
    runWorkerTask,
};
