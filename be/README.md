# Backend Architecture

Backend hiện được tổ chức theo 3 lớp thư mục chính:

## `src/app`
- `index.js`: khởi tạo Express app, middleware global, static files, error handler.
- `routes.js`: mount toàn bộ API route theo domain.

## `src/core`
- `config/`: cấu hình hạ tầng như kết nối DB.
- `middlewares/`: auth, role, workspace và các middleware dùng chung.
- `utils/`: helper dùng chung như `response`, `jwt`, `drizzle`, `upload`, `workspace-scope`.

## `src/domains`
- Mỗi domain giữ source nghiệp vụ riêng.
- Cấu trúc hiện tại vẫn bám theo file type cũ trong từng domain để tránh đổi logic:
  - `*.route.js`
  - `*.query.js`
  - `*.service.js`
  - `*.validation.js`

## Domains hiện có
- `auth`
- `bai-viet`
- `cau-hinh`
- `cuoc-thi`
- `danh-muc`
- `dot-thi`
- `file`
- `thi`
- `trac-nghiem`
- `trac-nghiem-dot-thi`
- `tu-luan-dot-thi`
- `user`
- `workspace`

## Nguyên tắc
- Không đổi API contract nếu chỉ đang refactor tổ chức thư mục.
- Route mỏng, nghiệp vụ nằm ở query/service/validation theo pattern hiện tại.
- Dùng `core/*` cho phần dùng chung, `domains/*` cho nghiệp vụ.
