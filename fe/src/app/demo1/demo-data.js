const now = new Date();

function addDays(baseDate, days) {
    return new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString();
}

export const DEMO_BANNER_CONFIG = {
    image: "/bg_auth.jpg",
    zoom: 1,
    positionX: 50,
    positionY: 36,
};

export const DEMO_CONTEST_META = {
    __type: "cuoc_thi_meta",
    mo_ta_tom_tat: "Sân chơi trực tuyến tìm hiểu kiến thức pháp luật và kỹ năng công dân số.",
    doi_tuong_tham_gia: "Cán bộ, công chức, viên chức, đoàn viên thanh niên và người dân trên địa bàn thành phố.",
    noi_dung_cuoc_thi: "Kiến thức pháp luật, chuyển đổi số, cải cách hành chính và các nội dung tuyên truyền trọng tâm năm 2026.",
    hinh_thuc_du_thi: "Thi trắc nghiệm trực tuyến theo từng đợt, có bảng xếp hạng và công bố kết quả theo thời gian thực.",
};

export const DEMO_DOT_THI = {
    id: 101,
    cuoc_thi_id: 12,
    ten: "Đợt thi tháng 6/2026",
    thoi_gian_thi: 30,
    cuoc_thi: {
        id: 12,
        ten: "Cuộc thi trực tuyến tìm hiểu pháp luật 2026",
        mo_ta: JSON.stringify(DEMO_CONTEST_META),
        thoi_gian_bat_dau: addDays(now, -5),
        thoi_gian_ket_thuc: addDays(now, 12),
        cho_phep_xem_lich_su: true,
    },
};

export const DEMO_TIME_LEFT = {
    dem_nguoc: true,
    thang: 0,
    tuan: 0,
    ngay: 10,
    gio: 1,
    phut: 58,
    giay: 12,
};

export const DEMO_TOTAL_ATTEMPTS = 24876;

export const DEMO_TIMELINE = [
    {
        id: 100,
        ten: "Đợt khởi động",
        thoi_gian_bat_dau: addDays(now, -40),
        thoi_gian_ket_thuc: addDays(now, -30),
    },
    {
        id: 101,
        ten: "Đợt thi tháng 6/2026",
        thoi_gian_bat_dau: addDays(now, -5),
        thoi_gian_ket_thuc: addDays(now, 12),
    },
    {
        id: 102,
        ten: "Đợt thi tháng 7/2026",
        thoi_gian_bat_dau: addDays(now, 20),
        thoi_gian_ket_thuc: addDays(now, 32),
    },
];

export const DEMO_HONOR_BOARD = {
    "dot-thi": {
        "luot-thi": [
            { donViId: 1, tenDonVi: "Phường Ninh Kiều", soLuongThiSinh: 1480, soNguoiThamGia: 1180, soDangVienThamGia: 612 },
            { donViId: 2, tenDonVi: "Phường Vị Tân", soLuongThiSinh: 1312, soNguoiThamGia: 1096, soDangVienThamGia: 575 },
            { donViId: 3, tenDonVi: "Phường Cái Răng", soLuongThiSinh: 1275, soNguoiThamGia: 1034, soDangVienThamGia: 542 },
            { donViId: 4, tenDonVi: "Xã Vĩnh Thạnh", soLuongThiSinh: 1194, soNguoiThamGia: 1018, soDangVienThamGia: 518 },
            { donViId: 5, tenDonVi: "Xã Liêu Tú", soLuongThiSinh: 1090, soNguoiThamGia: 952, soDangVienThamGia: 477 },
            { donViId: 6, tenDonVi: "Huyện Cờ Đỏ", soLuongThiSinh: 1014, soNguoiThamGia: 904, soDangVienThamGia: 448 },
            { donViId: 7, tenDonVi: "Quận Thốt Nốt", soLuongThiSinh: 1008, soNguoiThamGia: 889, soDangVienThamGia: 433 },
            { donViId: 8, tenDonVi: "Huyện Vĩnh Thạnh", soLuongThiSinh: 972, soNguoiThamGia: 870, soDangVienThamGia: 425 },
            { donViId: 9, tenDonVi: "Huyện Thới Lai", soLuongThiSinh: 972, soNguoiThamGia: 861, soDangVienThamGia: 419 },
            { donViId: 10, tenDonVi: "Quận Ninh Kiều - Khối trường", soLuongThiSinh: 944, soNguoiThamGia: 840, soDangVienThamGia: 401 },
        ],
        "nguoi-tham-gia": [
            { donViId: 1, tenDonVi: "Phường Ninh Kiều", soLuongThiSinh: 1480, soNguoiThamGia: 1180, soDangVienThamGia: 612 },
            { donViId: 2, tenDonVi: "Phường Vị Tân", soLuongThiSinh: 1312, soNguoiThamGia: 1096, soDangVienThamGia: 575 },
            { donViId: 3, tenDonVi: "Phường Cái Răng", soLuongThiSinh: 1275, soNguoiThamGia: 1034, soDangVienThamGia: 542 },
            { donViId: 4, tenDonVi: "Xã Vĩnh Thạnh", soLuongThiSinh: 1194, soNguoiThamGia: 1018, soDangVienThamGia: 518 },
            { donViId: 5, tenDonVi: "Xã Liêu Tú", soLuongThiSinh: 1090, soNguoiThamGia: 952, soDangVienThamGia: 477 },
            { donViId: 6, tenDonVi: "Huyện Cờ Đỏ", soLuongThiSinh: 1014, soNguoiThamGia: 904, soDangVienThamGia: 448 },
            { donViId: 7, tenDonVi: "Quận Thốt Nốt", soLuongThiSinh: 1008, soNguoiThamGia: 889, soDangVienThamGia: 433 },
            { donViId: 8, tenDonVi: "Huyện Vĩnh Thạnh", soLuongThiSinh: 972, soNguoiThamGia: 870, soDangVienThamGia: 425 },
            { donViId: 9, tenDonVi: "Huyện Thới Lai", soLuongThiSinh: 972, soNguoiThamGia: 861, soDangVienThamGia: 419 },
            { donViId: 10, tenDonVi: "Quận Ninh Kiều - Khối trường", soLuongThiSinh: 944, soNguoiThamGia: 840, soDangVienThamGia: 401 },
        ],
    },
    "cuoc-thi": {
        "luot-thi": [
            { donViId: 1, tenDonVi: "Phường Ninh Kiều", soLuongThiSinh: 3820, soNguoiThamGia: 3050, soDangVienThamGia: 1542 },
            { donViId: 2, tenDonVi: "Phường Vị Tân", soLuongThiSinh: 3542, soNguoiThamGia: 2928, soDangVienThamGia: 1480 },
            { donViId: 3, tenDonVi: "Phường Cái Răng", soLuongThiSinh: 3306, soNguoiThamGia: 2741, soDangVienThamGia: 1396 },
            { donViId: 4, tenDonVi: "Xã Vĩnh Thạnh", soLuongThiSinh: 3258, soNguoiThamGia: 2706, soDangVienThamGia: 1368 },
            { donViId: 5, tenDonVi: "Xã Liêu Tú", soLuongThiSinh: 3010, soNguoiThamGia: 2522, soDangVienThamGia: 1295 },
            { donViId: 6, tenDonVi: "Quận Thốt Nốt", soLuongThiSinh: 2876, soNguoiThamGia: 2480, soDangVienThamGia: 1264 },
            { donViId: 7, tenDonVi: "Huyện Cờ Đỏ", soLuongThiSinh: 2864, soNguoiThamGia: 2418, soDangVienThamGia: 1218 },
            { donViId: 8, tenDonVi: "Huyện Vĩnh Thạnh", soLuongThiSinh: 2778, soNguoiThamGia: 2364, soDangVienThamGia: 1184 },
            { donViId: 9, tenDonVi: "Huyện Thới Lai", soLuongThiSinh: 2778, soNguoiThamGia: 2310, soDangVienThamGia: 1159 },
            { donViId: 10, tenDonVi: "Khối các sở, ban, ngành", soLuongThiSinh: 2605, soNguoiThamGia: 2296, soDangVienThamGia: 1124 },
        ],
        "nguoi-tham-gia": [
            { donViId: 1, tenDonVi: "Phường Ninh Kiều", soLuongThiSinh: 3820, soNguoiThamGia: 3050, soDangVienThamGia: 1542 },
            { donViId: 2, tenDonVi: "Phường Vị Tân", soLuongThiSinh: 3542, soNguoiThamGia: 2928, soDangVienThamGia: 1480 },
            { donViId: 3, tenDonVi: "Phường Cái Răng", soLuongThiSinh: 3306, soNguoiThamGia: 2741, soDangVienThamGia: 1396 },
            { donViId: 4, tenDonVi: "Xã Vĩnh Thạnh", soLuongThiSinh: 3258, soNguoiThamGia: 2706, soDangVienThamGia: 1368 },
            { donViId: 5, tenDonVi: "Xã Liêu Tú", soLuongThiSinh: 3010, soNguoiThamGia: 2522, soDangVienThamGia: 1295 },
            { donViId: 6, tenDonVi: "Quận Thốt Nốt", soLuongThiSinh: 2876, soNguoiThamGia: 2480, soDangVienThamGia: 1264 },
            { donViId: 7, tenDonVi: "Huyện Cờ Đỏ", soLuongThiSinh: 2864, soNguoiThamGia: 2418, soDangVienThamGia: 1218 },
            { donViId: 8, tenDonVi: "Huyện Vĩnh Thạnh", soLuongThiSinh: 2778, soNguoiThamGia: 2364, soDangVienThamGia: 1184 },
            { donViId: 9, tenDonVi: "Huyện Thới Lai", soLuongThiSinh: 2778, soNguoiThamGia: 2310, soDangVienThamGia: 1159 },
            { donViId: 10, tenDonVi: "Khối các sở, ban, ngành", soLuongThiSinh: 2605, soNguoiThamGia: 2296, soDangVienThamGia: 1124 },
        ],
    },
};

export const DEMO_RANKINGS = {
    "dot-thi": [
        { baiThiId: 1, thiSinh: { id: 11, hoTen: "Nguyễn Thị Lan", username: "0901000001" }, diem: 30, thoiGian: 712 },
        { baiThiId: 2, thiSinh: { id: 12, hoTen: "Trần Quốc Bảo", username: "0901000002" }, diem: 30, thoiGian: 745 },
        { baiThiId: 3, thiSinh: { id: 13, hoTen: "Phạm Minh Tú", username: "0901000003" }, diem: 29, thoiGian: 690 },
        { baiThiId: 4, thiSinh: { id: 14, hoTen: "Lê Thanh Hương", username: "0901000004" }, diem: 29, thoiGian: 744 },
        { baiThiId: 5, thiSinh: { id: 15, hoTen: "Đỗ Hoàng Nam", username: "0901000005" }, diem: 28, thoiGian: 702 },
        { baiThiId: 6, thiSinh: { id: 16, hoTen: "Bùi Ngọc Trâm", username: "0901000006" }, diem: 28, thoiGian: 755 },
        { baiThiId: 7, thiSinh: { id: 17, hoTen: "Võ Quốc Huy", username: "0901000007" }, diem: 27, thoiGian: 688 },
        { baiThiId: 8, thiSinh: { id: 18, hoTen: "Huỳnh Bảo Vy", username: "0901000008" }, diem: 27, thoiGian: 790 },
        { baiThiId: 9, thiSinh: { id: 19, hoTen: "Ngô Tấn Phát", username: "0901000009" }, diem: 26, thoiGian: 721 },
        { baiThiId: 10, thiSinh: { id: 20, hoTen: "Mai Khánh Linh", username: "0901000010" }, diem: 26, thoiGian: 809 },
    ],
    "cuoc-thi": [
        { baiThiId: 21, thiSinh: { id: 31, hoTen: "Nguyễn Khánh Duy", username: "0912000001" }, diem: 60, thoiGian: 1432 },
        { baiThiId: 22, thiSinh: { id: 32, hoTen: "Lý Mỹ Duyên", username: "0912000002" }, diem: 59, thoiGian: 1390 },
        { baiThiId: 23, thiSinh: { id: 33, hoTen: "Trương Gia Hân", username: "0912000003" }, diem: 59, thoiGian: 1488 },
        { baiThiId: 24, thiSinh: { id: 34, hoTen: "Đặng Hoài Phúc", username: "0912000004" }, diem: 58, thoiGian: 1320 },
        { baiThiId: 25, thiSinh: { id: 35, hoTen: "Châu Minh Khoa", username: "0912000005" }, diem: 58, thoiGian: 1501 },
        { baiThiId: 26, thiSinh: { id: 36, hoTen: "Lâm Diễm Quỳnh", username: "0912000006" }, diem: 57, thoiGian: 1404 },
        { baiThiId: 27, thiSinh: { id: 37, hoTen: "Tạ Công Thành", username: "0912000007" }, diem: 57, thoiGian: 1540 },
        { baiThiId: 28, thiSinh: { id: 38, hoTen: "Phan Trúc Anh", username: "0912000008" }, diem: 56, thoiGian: 1441 },
        { baiThiId: 29, thiSinh: { id: 39, hoTen: "Nguyễn Hải Yến", username: "0912000009" }, diem: 56, thoiGian: 1588 },
        { baiThiId: 30, thiSinh: { id: 40, hoTen: "Lê Minh Toàn", username: "0912000010" }, diem: 55, thoiGian: 1495 },
    ],
};

export const DEMO_DOCUMENTS = [
    {
        id: "ke-hoach",
        tieuDe: "Kế hoạch tổ chức cuộc thi",
        moTa: "Các mốc thời gian, phạm vi triển khai và phân công thực hiện.",
        url: "/law.png",
    },
    {
        id: "the-le",
        tieuDe: "Thể lệ tham gia",
        moTa: "Quy định về đối tượng dự thi, cách tính điểm và trao giải.",
        url: "/documents.png",
    },
    {
        id: "tai-lieu-1",
        tieuDe: "Infographic tuyên truyền",
        moTa: "Bộ tài liệu trực quan dùng cho truyền thông tại đơn vị.",
        url: "/documentation.png",
    },
];

export const DEMO_PRIZES = {
    giaiCaNhan: [
        { id: "cn-1", tenGiai: "Giải Nhất", soLuong: 1, triGia: 10000000, ghiChu: "Trao cho thí sinh có điểm cao nhất toàn cuộc thi." },
        { id: "cn-2", tenGiai: "Giải Nhì", soLuong: 2, triGia: 5000000, ghiChu: "Dành cho các thí sinh đạt thành tích xuất sắc." },
        { id: "cn-3", tenGiai: "Giải Ba", soLuong: 3, triGia: 3000000, ghiChu: "Dành cho các thí sinh có kết quả nổi bật." },
        { id: "cn-4", tenGiai: "Khuyến khích", soLuong: 10, triGia: 1000000, ghiChu: "Dành cho các thí sinh có tinh thần tham gia tích cực." },
    ],
    giaiTapThe: [
        { id: "tt-1", tenGiai: "Giải Xuất sắc", soLuong: 1, triGia: 15000000, ghiChu: "Trao cho đơn vị có thành tích dẫn đầu toàn diện." },
        { id: "tt-2", tenGiai: "Giải Tích cực", soLuong: 3, triGia: 7000000, ghiChu: "Dành cho các đơn vị có số lượng tham gia cao." },
        { id: "tt-3", tenGiai: "Giải Lan tỏa", soLuong: 5, triGia: 3000000, ghiChu: "Ghi nhận các đơn vị có hoạt động truyền thông hiệu quả." },
    ],
};
