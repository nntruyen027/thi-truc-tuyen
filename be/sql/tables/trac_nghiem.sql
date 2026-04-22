drop table if exists thi.trac_nghiem;

create table thi.trac_nghiem
(
    id          serial primary key,
    linh_vuc_id int  references dm_chung.linh_vuc (id) on delete set null,
    nhom_id     int  references dm_chung.nhom_cau_hoi (id) on delete set null,
    cau_hoi     text not null,
    cauA        text, --1
    cauB        text, --2
    cauC        text, --3
    cauD        text, --4
    dapAn       int,
    diem        int
)