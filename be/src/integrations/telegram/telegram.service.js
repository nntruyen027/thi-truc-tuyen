const http = require("http");
const https = require("https");
const { URL } = require("url");

const systemAnalyticsService = require("../../domains/system-analytics/system_analytics.service");
const publicRankingsSnapshotService = require("../../domains/thi/public_rankings_snapshot.service");
const thiQuery = require("../../domains/thi/thi.query");
const dotThiQuery = require("../../domains/dot-thi/dot_thi.query");
const cauHinhQuery = require("../../domains/cau-hinh/cau-hinh.query");

const TELEGRAM_API_BASE = "https://api.telegram.org";
const DEFAULT_POLL_INTERVAL_MS = Number(process.env.TELEGRAM_BOT_POLL_INTERVAL_MS || 3000);
const DEFAULT_POLL_TIMEOUT_SECONDS = Number(process.env.TELEGRAM_BOT_POLL_TIMEOUT_SECONDS || 20);
const DEFAULT_TELEGRAM_REQUEST_TIMEOUT_MS = Number(process.env.TELEGRAM_BOT_REQUEST_TIMEOUT_MS || 15000);
const DEFAULT_HEALTH_INTERVAL_MS = Number(process.env.TELEGRAM_BOT_HEALTHCHECK_INTERVAL_MS || 60000);
const DEFAULT_HEALTH_TIMEOUT_MS = Number(process.env.TELEGRAM_BOT_HEALTHCHECK_TIMEOUT_MS || 8000);
const DEFAULT_PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || "";
const ALERT_RAM_USAGE_PERCENT = Number(process.env.TELEGRAM_BOT_ALERT_RAM_PERCENT || 85);
const ALERT_CPU_LOAD_PERCENT = Number(process.env.TELEGRAM_BOT_ALERT_CPU_PERCENT || 85);
const ALERT_SERVER_ERRORS_PER_MINUTE = Number(process.env.TELEGRAM_BOT_ALERT_5XX_PER_MINUTE || 10);
const ALERT_EVENT_LOOP_LAG_P95_MS = Number(process.env.TELEGRAM_BOT_ALERT_EVENT_LOOP_P95_MS || 150);
const ALERT_SNAPSHOT_STALE_MULTIPLIER = Number(process.env.TELEGRAM_BOT_ALERT_SNAPSHOT_STALE_MULTIPLIER || 2);
const DEFAULT_POLL_REQUEST_TIMEOUT_MS = Math.max(
    DEFAULT_TELEGRAM_REQUEST_TIMEOUT_MS,
    (DEFAULT_POLL_TIMEOUT_SECONDS * 1000) + 10000
);

function parseIdList(value) {
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseUrlList(value) {
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function safeJsonParse(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function formatBoolean(value) {
    return value ? "Bật" : "Tắt";
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: "Asia/Bangkok",
    }).format(date);
}

function formatNumber(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatDurationSeconds(value) {
    const normalized = Math.max(0, Number(value || 0));
    const hours = Math.floor(normalized / 3600);
    const minutes = Math.floor((normalized % 3600) / 60);
    const seconds = normalized % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

function escapeTelegramText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function buildTelegramApiUrl(token, method) {
    return `${TELEGRAM_API_BASE}/bot${token}/${method}`;
}

function requestJson(urlString, {
    method = "GET",
    body = null,
    timeoutMs = DEFAULT_HEALTH_TIMEOUT_MS,
} = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const transport = url.protocol === "https:" ? https : http;
        const payload = body ? Buffer.from(JSON.stringify(body)) : null;
        const req = transport.request({
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port || undefined,
            path: `${url.pathname}${url.search}`,
            method,
            headers: {
                "Content-Type": "application/json",
                ...(payload ? {"Content-Length": payload.length} : {}),
            },
        }, (res) => {
            let raw = "";

            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                raw += chunk;
            });
            res.on("end", () => {
                try {
                    const parsed = raw ? JSON.parse(raw) : {};
                    resolve({
                        statusCode: Number(res.statusCode || 0),
                        data: parsed,
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
        });
        req.on("error", reject);

        if (payload) {
            req.write(payload);
        }

        req.end();
    });
}

function requestProbe(urlString, timeoutMs = DEFAULT_HEALTH_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const transport = url.protocol === "https:" ? https : http;
        const startedAt = Date.now();
        const req = transport.request({
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port || undefined,
            path: `${url.pathname}${url.search}`,
            method: "GET",
        }, (res) => {
            res.resume();
            res.on("end", () => {
                resolve({
                    statusCode: Number(res.statusCode || 0),
                    durationMs: Date.now() - startedAt,
                });
            });
        });

        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`Health check timeout after ${timeoutMs}ms`));
        });
        req.on("error", reject);
        req.end();
    });
}

function parseCommand(text) {
    const normalized = String(text || "").trim();

    if (!normalized.startsWith("/")) {
        return null;
    }

    const [rawCommand, ...args] = normalized.split(/\s+/);
    const command = rawCommand.split("@")[0].toLowerCase();

    return {
        command,
        args,
    };
}

function buildHelpMessage() {
    return [
        "<b>Các lệnh Telegram hỗ trợ</b>",
        "",
        "/help - Xem danh sách lệnh",
        "/status - Tình trạng hệ thống, tài nguyên, lỗi gần đây",
        "/config - Thông số cấu hình public và cache hiện tại",
        "/contest - Cuộc thi và đợt thi đang đại diện ngoài public",
        "/report - Báo cáo nhanh của đợt/cuộc thi đang đại diện",
        "/health - Trạng thái các URL health-check đang giám sát",
        "/alerts - Xem toàn bộ ngưỡng cảnh báo hiện tại",
    ].join("\n");
}

async function buildStatusMessage() {
    const analytics = await systemAnalyticsService.getSystemAnalytics();
    const overview = analytics?.overview || {};

    return [
        "<b>Trạng thái hệ thống</b>",
        "",
        `Uptime: <b>${escapeTelegramText(formatDurationSeconds(overview.uptimeSeconds))}</b>`,
        `Tổng request: <b>${escapeTelegramText(formatNumber(overview.totalRequests))}</b>`,
        `Request/phút: <b>${escapeTelegramText(formatNumber(overview.requestsPerMinute))}</b>`,
        `Đang xử lý: <b>${escapeTelegramText(formatNumber(overview.currentInFlight))}</b>`,
        `Lỗi request: <b>${escapeTelegramText(formatNumber(overview.errorRequests))}</b>`,
        `Lỗi 5xx: <b>${escapeTelegramText(formatNumber(overview.serverErrors))}</b>`,
        `RAM: <b>${escapeTelegramText(formatNumber(overview.ramUsagePercent))}%</b>`,
        `Heap: <b>${escapeTelegramText(formatNumber(Math.round((Number(overview.heapUsedBytes || 0) / 1024 / 1024) * 100) / 100))} MB</b>`,
        `CPU tải 1m: <b>${escapeTelegramText(formatNumber(overview.cpuLoadPercent1m))}%</b>`,
        `Event loop p95: <b>${escapeTelegramText(formatNumber(Math.round(Number(overview.eventLoopLagP95Ms || 0))))} ms</b>`,
    ].join("\n");
}

async function buildConfigMessage() {
    const [homepageSettingsRow, bannerDesktopRow, bannerMobileRow] = await Promise.all([
        cauHinhQuery.layCauHinh("homepage_settings"),
        cauHinhQuery.layCauHinh("banner_desktop"),
        cauHinhQuery.layCauHinh("banner_mobile"),
    ]);
    const homepageSettings = safeJsonParse(homepageSettingsRow?.gia_tri, {});

    return [
        "<b>Thông số cấu hình</b>",
        "",
        `Demo đang chọn: <b>${escapeTelegramText(homepageSettings?.selectedDemo || "demo0")}</b>`,
        `Hiện tất cả demo: <b>${escapeTelegramText(formatBoolean(Boolean(homepageSettings?.showAllDemos)))}</b>`,
        `Banner desktop: <b>${escapeTelegramText(bannerDesktopRow?.gia_tri ? "Đã cấu hình" : "Chưa cấu hình")}</b>`,
        `Banner mobile: <b>${escapeTelegramText(bannerMobileRow?.gia_tri ? "Đã cấu hình" : "Chưa cấu hình")}</b>`,
        `Snapshot bảng vàng TTL: <b>${escapeTelegramText(formatDurationSeconds(Math.floor(publicRankingsSnapshotService.PUBLIC_RANKINGS_SNAPSHOT_TTL_MS / 1000)))}</b>`,
        `Health-check URL: <b>${escapeTelegramText(formatNumber(parseUrlList(process.env.TELEGRAM_BOT_HEALTHCHECK_URLS).length))}</b>`,
        `Public site URL: <b>${escapeTelegramText(DEFAULT_PUBLIC_SITE_URL || "-")}</b>`,
    ].join("\n");
}

async function getRepresentativeContestContext() {
    const dotThi = await dotThiQuery.layDotThiDaiDienChoBangVang();

    if (!dotThi?.id || !dotThi?.cuoc_thi_id) {
        return null;
    }

    return dotThi;
}

async function buildContestMessage() {
    const dotThi = await getRepresentativeContestContext();

    if (!dotThi) {
        return "Chưa có đợt thi phù hợp để hiển thị ngoài public.";
    }

    return [
        "<b>Cuộc thi và đợt thi đại diện</b>",
        "",
        `Cuộc thi: <b>${escapeTelegramText(dotThi?.cuoc_thi?.ten || "-")}</b>`,
        `Đợt thi: <b>${escapeTelegramText(dotThi?.ten || "-")}</b>`,
        `Mở cuộc thi: <b>${escapeTelegramText(formatBoolean(Boolean(dotThi?.cuoc_thi?.trang_thai)))}</b>`,
        `Mở đợt thi: <b>${escapeTelegramText(formatBoolean(Boolean(dotThi?.trang_thai)))}</b>`,
        `Bắt đầu: <b>${escapeTelegramText(formatDateTime(dotThi?.thoi_gian_bat_dau))}</b>`,
        `Kết thúc: <b>${escapeTelegramText(formatDateTime(dotThi?.thoi_gian_ket_thuc))}</b>`,
        `Công bố kết quả: <b>${escapeTelegramText(formatBoolean(Boolean(dotThi?.cuoc_thi?.cho_phep_xem_lich_su)))}</b>`,
        `Cho xem lại đáp án: <b>${escapeTelegramText(formatBoolean(Boolean(dotThi?.cuoc_thi?.cho_phep_xem_lai_dap_an)))}</b>`,
    ].join("\n");
}

async function buildReportMessage() {
    const dotThi = await getRepresentativeContestContext();

    if (!dotThi) {
        return "Chưa có dữ liệu đợt thi để lập báo cáo.";
    }

    const [snapshot, participationRows] = await Promise.all([
        publicRankingsSnapshotService.getPublicRankingsSnapshotOrRefresh(
            dotThi.id,
            dotThi.cuoc_thi_id
        ),
        thiQuery.thongKeThamGiaTheoDonVi({
            cuocThiId: dotThi.cuoc_thi_id,
        }),
    ]);
    const cuocThiAttemptRows = snapshot?.honorBoard?.["cuoc-thi"]?.["luot-thi"] || [];
    const topParticipants = snapshot?.rankings?.["dot-thi"] || [];
    const tongSoNguoiThamGia = participationRows.reduce(
        (total, item) => total + Number(item?.so_nguoi_tham_gia || 0),
        0
    );
    const tongSoLuotNopBai = participationRows.reduce(
        (total, item) => total + Number(item?.so_luot_nop_bai || 0),
        0
    );
    const topDonVi = cuocThiAttemptRows
        .slice(0, 3)
        .map((item, index) => `${index + 1}. ${item?.tenDonVi || item?.ten_don_vi || "-"} (${formatNumber(item?.soLuongThiSinh || item?.so_luong_thi_sinh || 0)})`);
    const topThiSinh = topParticipants
        .slice(0, 3)
        .map((item, index) => `${index + 1}. ${item?.thiSinh?.hoTen || item?.thi_sinh?.ho_ten || "-"} (${formatNumber(item?.diem || 0)})`);

    return [
        "<b>Báo cáo nhanh</b>",
        "",
        `Cuộc thi: <b>${escapeTelegramText(dotThi?.cuoc_thi?.ten || "-")}</b>`,
        `Đợt thi đại diện: <b>${escapeTelegramText(dotThi?.ten || "-")}</b>`,
        `Tổng người tham gia: <b>${escapeTelegramText(formatNumber(tongSoNguoiThamGia))}</b>`,
        `Tổng lượt nộp bài: <b>${escapeTelegramText(formatNumber(tongSoLuotNopBai))}</b>`,
        `Số đơn vị có dữ liệu: <b>${escapeTelegramText(formatNumber(participationRows.length))}</b>`,
        "",
        "<b>Top đơn vị</b>",
        ...(topDonVi.length ? topDonVi.map(escapeTelegramText) : ["Chưa có dữ liệu"]),
        "",
        "<b>Top thí sinh đợt thi hiện tại</b>",
        ...(topThiSinh.length ? topThiSinh.map(escapeTelegramText) : ["Chưa có dữ liệu"]),
    ].join("\n");
}

function buildHealthMessage(state) {
    const checks = state?.healthChecks || [];

    if (!checks.length) {
        return "Chưa cấu hình URL health-check cho Telegram bot.";
    }

    return [
        "<b>Health-check URL</b>",
        "",
        ...checks.map((item) => {
            const status = item.ok ? "OK" : "LỖI";
            const durationText = item.durationMs != null ? `${item.durationMs} ms` : "-";
            return `${escapeTelegramText(item.name)}: <b>${status}</b> | HTTP <b>${escapeTelegramText(item.statusCode ?? "-")}</b> | ${escapeTelegramText(durationText)}`;
        }),
    ].join("\n");
}

function buildAlertsMessage() {
    return [
        "<b>Ngưỡng cảnh báo hiện tại</b>",
        "",
        `RAM cao: <b>${escapeTelegramText(formatNumber(ALERT_RAM_USAGE_PERCENT))}%</b>`,
        `CPU tải cao: <b>${escapeTelegramText(formatNumber(ALERT_CPU_LOAD_PERCENT))}%</b>`,
        `5xx / phút: <b>${escapeTelegramText(formatNumber(ALERT_SERVER_ERRORS_PER_MINUTE))}</b>`,
        `Event loop lag p95: <b>${escapeTelegramText(formatNumber(ALERT_EVENT_LOOP_LAG_P95_MS))} ms</b>`,
        `Snapshot stale multiplier: <b>${escapeTelegramText(formatNumber(ALERT_SNAPSHOT_STALE_MULTIPLIER))}</b>`,
        `Health-check interval: <b>${escapeTelegramText(formatDurationSeconds(Math.floor(DEFAULT_HEALTH_INTERVAL_MS / 1000)))}</b>`,
        `Health-check timeout: <b>${escapeTelegramText(formatDurationSeconds(Math.floor(DEFAULT_HEALTH_TIMEOUT_MS / 1000)))}</b>`,
    ].join("\n");
}

function hasDotThiResultsPayload(payload) {
    return Boolean(payload)
        && Object.prototype.hasOwnProperty.call(payload, "dotThiResults")
        && payload.dotThiResults
        && typeof payload.dotThiResults === "object";
}

function createTelegramService() {
    const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
    const allowedChatIds = new Set(parseIdList(process.env.TELEGRAM_BOT_ALLOWED_CHAT_IDS));
    const alertChatIds = parseIdList(process.env.TELEGRAM_BOT_ALERT_CHAT_IDS || process.env.TELEGRAM_BOT_ALLOWED_CHAT_IDS);
    const healthUrls = parseUrlList(process.env.TELEGRAM_BOT_HEALTHCHECK_URLS);
    const state = {
        enabled: Boolean(token),
        polling: false,
        pollingTimer: null,
        healthTimer: null,
        monitorTimer: null,
        offset: 0,
        healthChecks: [],
        healthStatusByUrl: new Map(),
        alertChatIds,
        monitorStates: new Map(),
    };

    function isAuthorizedChat(chatId) {
        if (!allowedChatIds.size) {
            return false;
        }

        return allowedChatIds.has(String(chatId));
    }

    async function callTelegram(method, body, options = {}) {
        if (!state.enabled) {
            return null;
        }

        const timeoutMs = Number(options?.timeoutMs || DEFAULT_TELEGRAM_REQUEST_TIMEOUT_MS);

        const response = await requestJson(
            buildTelegramApiUrl(token, method),
            {
                method: "POST",
                body,
                timeoutMs,
            }
        );

        if (!response?.data?.ok) {
            throw new Error(response?.data?.description || `Telegram API ${method} failed`);
        }

        return response.data.result;
    }

    async function sendMessage(chatId, text) {
        return callTelegram("sendMessage", {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
    }

    async function broadcastAlert(text) {
        const uniqueChatIds = [...new Set(state.alertChatIds)];

        await Promise.allSettled(
            uniqueChatIds.map((chatId) => sendMessage(chatId, text))
        );
    }

    async function updateAlertState(key, isProblem, problemMessage, recoveryMessage) {
        const previous = state.monitorStates.get(key);

        if (isProblem) {
            if (!previous) {
                state.monitorStates.set(key, true);
                await broadcastAlert(problemMessage);
            }

            return;
        }

        if (previous) {
            state.monitorStates.set(key, false);
            await broadcastAlert(recoveryMessage);
        }
    }

    async function handleCommand(chatId, parsedCommand) {
        switch (parsedCommand.command) {
        case "/help":
        case "/start":
            return sendMessage(chatId, buildHelpMessage());
        case "/status":
            return sendMessage(chatId, await buildStatusMessage());
        case "/config":
            return sendMessage(chatId, await buildConfigMessage());
        case "/contest":
            return sendMessage(chatId, await buildContestMessage());
        case "/report":
            return sendMessage(chatId, await buildReportMessage());
        case "/health":
            return sendMessage(chatId, buildHealthMessage(state));
        case "/alerts":
            return sendMessage(chatId, buildAlertsMessage());
        default:
            return sendMessage(
                chatId,
                "Lệnh chưa được hỗ trợ. Gõ /help để xem danh sách lệnh."
            );
        }
    }

    async function pollUpdates() {
        if (!state.enabled || state.polling) {
            return;
        }

        state.polling = true;

        try {
            const updates = await callTelegram("getUpdates", {
                offset: state.offset,
                timeout: DEFAULT_POLL_TIMEOUT_SECONDS,
                allowed_updates: ["message"],
            }, {
                timeoutMs: DEFAULT_POLL_REQUEST_TIMEOUT_MS,
            });

            for (const update of updates || []) {
                state.offset = Number(update.update_id || 0) + 1;

                const message = update?.message;
                const chatId = message?.chat?.id;
                const parsedCommand = parseCommand(message?.text);

                if (!chatId || !parsedCommand) {
                    continue;
                }

                if (!isAuthorizedChat(chatId)) {
                    await sendMessage(
                        chatId,
                        `Chat này chưa được cấp quyền dùng bot Telegram của hệ thống.\nchat_id: <b>${escapeTelegramText(chatId)}</b>`
                    );
                    continue;
                }

                try {
                    await handleCommand(chatId, parsedCommand);
                } catch (error) {
                    await sendMessage(
                        chatId,
                        `Không xử lý được lệnh. Chi tiết: ${escapeTelegramText(error.message || "Lỗi không xác định")}`
                    );
                }
            }
        } catch (error) {
            console.error("[telegram-bot] Polling failed:", error.message || error);
        } finally {
            state.polling = false;
        }
    }

    function createHealthCheckName(urlString) {
        try {
            const url = new URL(urlString);
            return `${url.hostname}${url.pathname}`;
        } catch {
            return urlString;
        }
    }

    async function runHealthChecks() {
        if (!state.enabled || !healthUrls.length) {
            return;
        }

        const nextResults = await Promise.all(
            healthUrls.map(async (url) => {
                const name = createHealthCheckName(url);

                try {
                    const response = await requestProbe(url, DEFAULT_HEALTH_TIMEOUT_MS);
                    const ok = response.statusCode >= 200 && response.statusCode < 400;

                    return {
                        name,
                        url,
                        ok,
                        statusCode: response.statusCode,
                        durationMs: response.durationMs,
                        errorMessage: ok ? null : `HTTP ${response.statusCode}`,
                    };
                } catch (error) {
                    return {
                        name,
                        url,
                        ok: false,
                        statusCode: null,
                        durationMs: null,
                        errorMessage: error.message || "Không truy cập được",
                    };
                }
            })
        );

        state.healthChecks = nextResults;

        for (const result of nextResults) {
            const previous = state.healthStatusByUrl.get(result.url);
            const hasStateChanged = !previous || previous.ok !== result.ok;

            if (hasStateChanged) {
                const message = result.ok
                    ? [
                        "<b>Đã phục hồi site</b>",
                        `URL: <b>${escapeTelegramText(result.name)}</b>`,
                        `HTTP: <b>${escapeTelegramText(result.statusCode)}</b>`,
                        `Thời gian phản hồi: <b>${escapeTelegramText(result.durationMs)} ms</b>`,
                    ].join("\n")
                    : [
                        "<b>Cảnh báo site gặp vấn đề</b>",
                        `URL: <b>${escapeTelegramText(result.name)}</b>`,
                        `Chi tiết: <b>${escapeTelegramText(result.errorMessage || "Lỗi không xác định")}</b>`,
                    ].join("\n");

                await broadcastAlert(message);
            }

            state.healthStatusByUrl.set(result.url, result);
        }
    }

    async function runPerformanceMonitors() {
        if (!state.enabled) {
            return;
        }

        const analytics = await systemAnalyticsService.getSystemAnalytics();
        const overview = analytics?.overview || {};
        const recentRequests = analytics?.recentRequests || [];
        const nowMs = Date.now();
        const serverErrorsPerMinute = recentRequests.filter((item) => {
            const timeMs = new Date(item?.time).getTime();
            return Number.isFinite(timeMs)
                && (nowMs - timeMs) <= 60 * 1000
                && Number(item?.status || 0) >= 500;
        }).length;

        await updateAlertState(
            "ram-high",
            Number(overview.ramUsagePercent || 0) >= ALERT_RAM_USAGE_PERCENT,
            [
                "<b>Cảnh báo hiệu năng</b>",
                `RAM đang cao: <b>${escapeTelegramText(formatNumber(overview.ramUsagePercent))}%</b>`,
                `Heap đang dùng: <b>${escapeTelegramText(formatNumber(Math.round((Number(overview.heapUsedBytes || 0) / 1024 / 1024) * 100) / 100))} MB</b>`,
                `Đang xử lý: <b>${escapeTelegramText(formatNumber(overview.currentInFlight))}</b>`,
            ].join("\n"),
            [
                "<b>Đã phục hồi hiệu năng</b>",
                `RAM đã về mức bình thường: <b>${escapeTelegramText(formatNumber(overview.ramUsagePercent))}%</b>`,
            ].join("\n")
        );

        await updateAlertState(
            "cpu-high",
            Number(overview.cpuLoadPercent1m || 0) >= ALERT_CPU_LOAD_PERCENT,
            [
                "<b>Cảnh báo hiệu năng</b>",
                `CPU tải cao: <b>${escapeTelegramText(formatNumber(overview.cpuLoadPercent1m))}%</b>`,
                `Load average 1m: <b>${escapeTelegramText(formatNumber(overview.loadAverage1m))}</b>`,
                `Request/phút: <b>${escapeTelegramText(formatNumber(overview.requestsPerMinute))}</b>`,
            ].join("\n"),
            [
                "<b>Đã phục hồi hiệu năng</b>",
                `CPU tải đã về mức bình thường: <b>${escapeTelegramText(formatNumber(overview.cpuLoadPercent1m))}%</b>`,
            ].join("\n")
        );

        await updateAlertState(
            "server-errors-high",
            serverErrorsPerMinute >= ALERT_SERVER_ERRORS_PER_MINUTE,
            [
                "<b>Cảnh báo hiệu năng</b>",
                `Số lỗi 5xx trong 1 phút đang cao: <b>${escapeTelegramText(formatNumber(serverErrorsPerMinute))}</b>`,
                `Request/phút: <b>${escapeTelegramText(formatNumber(overview.requestsPerMinute))}</b>`,
                `Đang xử lý: <b>${escapeTelegramText(formatNumber(overview.currentInFlight))}</b>`,
            ].join("\n"),
            [
                "<b>Đã phục hồi hiệu năng</b>",
                `Số lỗi 5xx trong 1 phút đã về mức bình thường: <b>${escapeTelegramText(formatNumber(serverErrorsPerMinute))}</b>`,
            ].join("\n")
        );

        await updateAlertState(
            "event-loop-lag-high",
            Number(overview.eventLoopLagP95Ms || 0) >= ALERT_EVENT_LOOP_LAG_P95_MS,
            [
                "<b>Cảnh báo hiệu năng</b>",
                `Event loop lag p95 cao: <b>${escapeTelegramText(formatNumber(Math.round(Number(overview.eventLoopLagP95Ms || 0))))} ms</b>`,
                `Event loop lag max: <b>${escapeTelegramText(formatNumber(Math.round(Number(overview.eventLoopLagMaxMs || 0))))} ms</b>`,
                `Đang xử lý: <b>${escapeTelegramText(formatNumber(overview.currentInFlight))}</b>`,
            ].join("\n"),
            [
                "<b>Đã phục hồi hiệu năng</b>",
                `Event loop lag p95 đã về mức bình thường: <b>${escapeTelegramText(formatNumber(Math.round(Number(overview.eventLoopLagP95Ms || 0))))} ms</b>`,
            ].join("\n")
        );
    }

    async function runSnapshotMonitor() {
        if (!state.enabled) {
            return;
        }

        const dotThi = await getRepresentativeContestContext();

        if (!dotThi?.id || !dotThi?.cuoc_thi_id) {
            await updateAlertState(
                "snapshot-stale",
                false,
                "",
                "<b>Snapshot bảng vàng</b>\nĐã trở lại trạng thái bình thường."
            );
            return;
        }

        try {
            const snapshot = await thiQuery.layPublicRankingSnapshot(dotThi.id, dotThi.cuoc_thi_id);
            const createdAtMs = new Date(snapshot?.createdAt).getTime();
            const maxAgeMs =
                publicRankingsSnapshotService.PUBLIC_RANKINGS_SNAPSHOT_TTL_MS
                * Math.max(1, ALERT_SNAPSHOT_STALE_MULTIPLIER);
            const isMissing = !snapshot?.payload;
            const isLegacyPayload =
                snapshot?.payload && !hasDotThiResultsPayload(snapshot.payload);
            const isStale =
                !Number.isFinite(createdAtMs) || (Date.now() - createdAtMs) > maxAgeMs;
            const hasProblem = isMissing || isLegacyPayload || isStale;

            await updateAlertState(
                "snapshot-stale",
                hasProblem,
                [
                    "<b>Cảnh báo bảng vàng công khai</b>",
                    `Cuộc thi: <b>${escapeTelegramText(dotThi?.cuoc_thi?.ten || "-")}</b>`,
                    `Đợt thi: <b>${escapeTelegramText(dotThi?.ten || "-")}</b>`,
                    `Tình trạng: <b>${escapeTelegramText(
                        isMissing
                            ? "Chưa có snapshot"
                            : isLegacyPayload
                                ? "Snapshot thiếu dữ liệu kết quả đợt"
                                : "Snapshot quá hạn"
                    )}</b>`,
                    `Lần cập nhật gần nhất: <b>${escapeTelegramText(formatDateTime(snapshot?.createdAt))}</b>`,
                ].join("\n"),
                [
                    "<b>Snapshot bảng vàng đã phục hồi</b>",
                    `Cuộc thi: <b>${escapeTelegramText(dotThi?.cuoc_thi?.ten || "-")}</b>`,
                    `Đợt thi: <b>${escapeTelegramText(dotThi?.ten || "-")}</b>`,
                    `Lần cập nhật gần nhất: <b>${escapeTelegramText(formatDateTime(snapshot?.createdAt))}</b>`,
                ].join("\n")
            );
        } catch (error) {
            await updateAlertState(
                "snapshot-stale",
                true,
                [
                    "<b>Cảnh báo bảng vàng công khai</b>",
                    `Cuộc thi: <b>${escapeTelegramText(dotThi?.cuoc_thi?.ten || "-")}</b>`,
                    `Đợt thi: <b>${escapeTelegramText(dotThi?.ten || "-")}</b>`,
                    `Chi tiết lỗi: <b>${escapeTelegramText(error?.message || "Không xác định")}</b>`,
                ].join("\n"),
                "<b>Snapshot bảng vàng</b>\nĐã trở lại trạng thái bình thường."
            );
        }
    }

    async function runOperationalMonitors() {
        try {
            await Promise.all([
                runPerformanceMonitors(),
                runSnapshotMonitor(),
            ]);
        } catch (error) {
            console.error("[telegram-bot] Operational monitor failed:", error.message || error);
        }
    }

    function attachProcessAlerts() {
        process.on("unhandledRejection", (reason) => {
            void broadcastAlert(
                [
                    "<b>Cảnh báo backend</b>",
                    "Sự kiện: <b>unhandledRejection</b>",
                    `Chi tiết: <b>${escapeTelegramText(reason?.message || String(reason))}</b>`,
                ].join("\n")
            );
        });

        process.on("uncaughtExceptionMonitor", (error) => {
            void broadcastAlert(
                [
                    "<b>Cảnh báo backend</b>",
                    "Sự kiện: <b>uncaughtException</b>",
                    `Chi tiết: <b>${escapeTelegramText(error?.message || String(error))}</b>`,
                ].join("\n")
            );
        });
    }

    async function start() {
        if (!state.enabled) {
            console.log("[telegram-bot] Disabled because TELEGRAM_BOT_TOKEN is not configured.");
            return;
        }

        attachProcessAlerts();

        state.pollingTimer = setInterval(() => {
            void pollUpdates();
        }, DEFAULT_POLL_INTERVAL_MS);
        state.pollingTimer.unref?.();

        state.monitorTimer = setInterval(() => {
            void runOperationalMonitors();
        }, DEFAULT_HEALTH_INTERVAL_MS);
        state.monitorTimer.unref?.();

        if (healthUrls.length) {
            state.healthTimer = setInterval(() => {
                void runHealthChecks();
            }, DEFAULT_HEALTH_INTERVAL_MS);
            state.healthTimer.unref?.();

            await runHealthChecks();
        }

        await runOperationalMonitors();

        if (process.env.TELEGRAM_BOT_NOTIFY_ON_STARTUP === "1") {
            await broadcastAlert(
                [
                    "<b>Telegram bot đã khởi động</b>",
                    `Thời gian: <b>${escapeTelegramText(formatDateTime(new Date()))}</b>`,
                ].join("\n")
            );
        }

        console.log("[telegram-bot] Started.");
    }

    return {
        start,
    };
}

module.exports = {
    createTelegramService,
};
