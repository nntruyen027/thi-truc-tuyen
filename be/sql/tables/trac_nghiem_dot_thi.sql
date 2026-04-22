drop table if exists thi.trac_nghiem_dot_thi;

create table thi.trac_nghiem_dot_thi
(
    id          serial primary key,
    dot_thi_id  int references thi.dot_thi (id) on delete cascade,
    linh_vuc_id int references dm_chung.linh_vuc (id) on delete set null,
    nhom_id     int references dm_chung.nhom_cau_hoi (id) on delete set null,
    so_luong    int
)