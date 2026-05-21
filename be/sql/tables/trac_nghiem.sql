drop table if exists thi.trac_nghiem;

create table thi.trac_nghiem
(
    id          serial primary key,
    workspace_id int not null,
    linh_vuc_id int  references dm_chung.linh_vuc (id) on delete set null,
    nhom_id     int  references dm_chung.nhom_cau_hoi (id) on delete set null,
    loai_cau_hoi varchar(50) default 'chon_mot',
    cau_hoi     text not null,
    cauA        text, --1
    cauB        text, --2
    cauC        text, --3
    cauD        text, --4
    dapAn       int,
    dap_an_nhieu text,
    dap_an_text text,
    diem        int
);

create index trac_nghiem_workspace_linh_vuc_nhom_idx
    on thi.trac_nghiem (workspace_id, linh_vuc_id, nhom_id);
