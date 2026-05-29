drop table if exists thi.trac_nghiem_dot_thi;

create table thi.trac_nghiem_dot_thi
(
    id          serial primary key,
    dot_thi_id  int references thi.dot_thi (id) on delete cascade,
    linh_vuc_id int references dm_chung.linh_vuc (id) on delete set null,
    nhom_id     int references dm_chung.nhom_cau_hoi (id) on delete set null,
    loai_cau_hoi varchar(50) default 'chon_mot',
    so_luong    int
);

create index trac_nghiem_dot_thi_dot_thi_id_idx
    on thi.trac_nghiem_dot_thi (dot_thi_id);
