drop table if exists thi.cuoc_thi;

create table thi.cuoc_thi
(
    id                      serial primary key,
    ten                     varchar(500),
    mo_ta                   varchar(500),
    thoi_gian_bat_dau       timestamp,
    thoi_gian_ket_thuc      timestamp,
    trang_thai              boolean,
    cho_phep_xem_lich_su    boolean,
    cho_phep_xem_lai_dap_an boolean,
    co_tu_luan              boolean,
    created_at              timestamp default now()
)