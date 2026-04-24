drop table if exists thi.bai_thi;

create table thi.bai_thi
(
    id                serial primary key,
    workspace_id      int not null,

    de_thi_id         int references thi.de_thi (id) on delete cascade,

    thi_sinh_id       int,

    lan_thi           int,

    thoi_gian_bat_dau timestamp default now(),

    thoi_gian_nop     timestamp,

    trang_thai        int       default 0,

    diem              float     default 0
);

alter table thi.bai_thi
    add column tong_thoi_gian_da_lam int     default 0,
    add column lan_bat_dau           timestamp,
    add column dang_lam              boolean default false;


alter table thi.bai_thi
    add column so_du_doan int default null;

create index bai_thi_workspace_thi_sinh_trang_thai_de_thi_idx
    on thi.bai_thi (workspace_id, thi_sinh_id, trang_thai, de_thi_id);
