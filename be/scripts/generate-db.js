const { spawn } = require("child_process");

function run() {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        console.error(
            [
                "[db:generate] Drizzle can terminal tuong tac de xac nhan cac thay doi pha vo schema.",
                "Hay chay `pnpm db:generate` truc tiep trong terminal local co TTY.",
            ].join(" ")
        );
        process.exitCode = 1;
        return;
    }

    const child = spawn(
        process.platform === "win32" ? "pnpm.cmd" : "pnpm",
        ["exec", "drizzle-kit", "generate", ...process.argv.slice(2)],
        {
            stdio: "inherit",
            shell: false,
        }
    );

    child.on("exit", (code) => {
        process.exitCode = code ?? 1;
    });
}

run();
