drop table if exists thi.bai_thi_chi_tiet;

create table thi.bai_thi_chi_tiet
(
    id          serial primary key,

    bai_thi_id  int references thi.bai_thi (id) on delete cascade,

    cau_hoi_id  int references thi.trac_nghiem (id),

    dap_an_chon int,

    dung        boolean,

    diem        float
);

alter table thi.bai_thi_chi_tiet
    add constraint uq_bai_cau
        unique (bai_thi_id, cau_hoi_id);