drop table if exists thi.tu_luan_dot_thi;

create table thi.tu_luan_dot_thi
(
    id         serial primary key,
    workspace_id int not null,
    dot_thi_id int references thi.dot_thi (id) on delete cascade,
    cau_hoi    text,
    goi_y      text default ''
);

create index tu_luan_dot_thi_workspace_dot_thi_id_idx
    on thi.tu_luan_dot_thi (workspace_id, dot_thi_id);
