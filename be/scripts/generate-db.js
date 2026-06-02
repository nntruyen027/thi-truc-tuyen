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

    const child =
        process.platform === "win32"
            ? spawn(
                process.env.ComSpec || "cmd.exe",
                [
                    "/d",
                    "/s",
                    "/c",
                    `pnpm exec drizzle-kit generate ${process.argv.slice(2).join(" ")}`.trim(),
                ],
                {
                    stdio: "inherit",
                    shell: false,
                }
            )
            : spawn(
                "pnpm",
                ["exec", "drizzle-kit", "generate", ...process.argv.slice(2)],
                {
                    stdio: "inherit",
                    shell: false,
                }
            );

    child.on("error", (error) => {
        console.error("[db:generate] Failed to start drizzle-kit:", error.message);
        process.exitCode = 1;
    });

    child.on("exit", (code) => {
        process.exitCode = code ?? 1;
    });
}

run();
