drop table if exists thi.trac_nghiem_dot_thi;

create table thi.trac_nghiem_dot_thi
(
    id          serial primary key,
    workspace_id int not null,
    dot_thi_id  int references thi.dot_thi (id) on delete cascade,
    linh_vuc_id int references dm_chung.linh_vuc (id) on delete set null,
    nhom_id     int references dm_chung.nhom_cau_hoi (id) on delete set null,
    so_luong    int
);

create index trac_nghiem_dot_thi_workspace_dot_thi_id_idx
    on thi.trac_nghiem_dot_thi (workspace_id, dot_thi_id);
