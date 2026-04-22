drop table if exists thi.tu_luan_dot_thi;

create table thi.tu_luan_dot_thi
(
    id         serial primary key,
    dot_thi_id int references thi.dot_thi (id) on delete cascade,
    cau_hoi    text,
    goi_y      text default ''
);