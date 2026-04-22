drop table if exists thi.bai_thi_chi_tiet_tu_luan;

create table thi.bai_thi_chi_tiet_tu_luan
(
    id         serial primary key,

    bai_thi_id int references thi.bai_thi (id) on delete cascade,

    cau_hoi_id int references thi.tu_luan_dot_thi (id),

    dap_an     text,

    diem       float
);

alter table thi.bai_thi_chi_tiet_tu_luan
    add constraint uq_bai_cau_tu_luan
        unique (bai_thi_id, cau_hoi_id);