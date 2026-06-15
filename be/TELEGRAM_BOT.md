# Telegram Bot

Module bot Telegram được bật theo cơ chế opt-in, không cấu hình thì backend chạy như cũ.

## Biến môi trường

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_ALLOWED_CHAT_IDS=
TELEGRAM_BOT_ALERT_CHAT_IDS=
TELEGRAM_BOT_POLL_INTERVAL_MS=3000
TELEGRAM_BOT_NOTIFY_ON_STARTUP=1

TELEGRAM_BOT_HEALTHCHECK_URLS=
TELEGRAM_BOT_HEALTHCHECK_INTERVAL_MS=60000
TELEGRAM_BOT_HEALTHCHECK_TIMEOUT_MS=8000
TELEGRAM_BOT_ALERT_RAM_PERCENT=85
TELEGRAM_BOT_ALERT_CPU_PERCENT=85
TELEGRAM_BOT_ALERT_5XX_PER_MINUTE=10
TELEGRAM_BOT_ALERT_EVENT_LOOP_P95_MS=150
TELEGRAM_BOT_ALERT_SNAPSHOT_STALE_MULTIPLIER=2

PUBLIC_SITE_URL=
```

## Giải thích

- `TELEGRAM_BOT_TOKEN`: token bot từ BotFather.
- `TELEGRAM_BOT_ALLOWED_CHAT_IDS`: danh sách `chat_id` được phép dùng lệnh, ngăn cách bởi dấu phẩy.
- `TELEGRAM_BOT_ALERT_CHAT_IDS`: danh sách chat nhận cảnh báo. Nếu bỏ trống sẽ dùng danh sách trong `TELEGRAM_BOT_ALLOWED_CHAT_IDS`.
- `TELEGRAM_BOT_NOTIFY_ON_STARTUP`: đặt `1` nếu muốn bot gửi thông báo khi backend khởi động.
- `TELEGRAM_BOT_HEALTHCHECK_URLS`: danh sách URL cần kiểm tra định kỳ, ngăn cách bởi dấu phẩy.
- `TELEGRAM_BOT_ALERT_RAM_PERCENT`: ngưỡng % RAM để gửi cảnh báo hiệu năng.
- `TELEGRAM_BOT_ALERT_CPU_PERCENT`: ngưỡng % tải CPU 1 phút để gửi cảnh báo hiệu năng.
- `TELEGRAM_BOT_ALERT_5XX_PER_MINUTE`: ngưỡng số lỗi 5xx trong 1 phút để gửi cảnh báo.
- `TELEGRAM_BOT_ALERT_EVENT_LOOP_P95_MS`: ngưỡng event loop lag p95 để gửi cảnh báo hiệu năng.
- `TELEGRAM_BOT_ALERT_SNAPSHOT_STALE_MULTIPLIER`: hệ số quá hạn snapshot bảng vàng so với TTL hiện tại.
- `PUBLIC_SITE_URL`: URL site public để hiển thị trong lệnh `/config`.

## Cảnh báo tự động

Bot có thể tự gửi cảnh báo khi:

- URL health-check không truy cập được hoặc phục hồi lại
- RAM server vượt ngưỡng
- CPU tải cao
- số lỗi `5xx` trong 1 phút tăng cao
- event loop lag cao
- snapshot bảng vàng công khai bị thiếu, lỗi định dạng cũ hoặc quá hạn

## Lệnh hỗ trợ

- `/help`
- `/status`
- `/config`
- `/contest`
- `/report`
- `/health`
- `/alerts`

## Gợi ý health-check URL

```env
TELEGRAM_BOT_HEALTHCHECK_URLS=https://domain-public/,https://domain-public/api/thi/public-rankings?dotThiId=1&cuocThiId=1
```

Nên dùng ít URL, ưu tiên:

- trang public chính
- một API public quan trọng
- nếu có reverse proxy riêng thì có thể thêm URL health nội bộ
