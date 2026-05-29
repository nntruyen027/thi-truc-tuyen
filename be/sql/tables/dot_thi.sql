drop table if exists thi.dot_thi;

create table thi.dot_thi
(
    id                     serial primary key,
    cuoc_thi_id            integer references thi.cuoc_thi (id) on delete cascade,
    ten                    varchar(500),
    mo_ta                  varchar(500),
    so_lan_tham_gia_toi_da integer,
    thoi_gian_thi          integer,
    ty_le_danh_gia_dat     float,
    thoi_gian_bat_dau      timestamp,
    thoi_gian_ket_thuc     timestamp,
    co_tron_cau_hoi        boolean   default false,
    cho_phep_luu_bai       boolean   default false,
    du_doan                boolean   default false,
    trang_thai             boolean   default false,
    created_at             timestamp default now()
);

create index dot_thi_cuoc_thi_id_idx
    on thi.dot_thi (cuoc_thi_id);

create index dot_thi_cuoc_thi_ten_idx
    on thi.dot_thi (cuoc_thi_id, ten);

create index dot_thi_thoi_gian_idx
    on thi.dot_thi (thoi_gian_bat_dau, thoi_gian_ket_thuc);
