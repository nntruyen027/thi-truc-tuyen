drop table if exists thi.de_thi;

create table thi.de_thi
(
    id serial primary key,

    workspace_id int not null,

    dot_thi_id int references thi.dot_thi(id) on delete cascade,

    thi_sinh_id int,

    lan_thi int, -- lần thứ mấy

    thoi_gian_tao timestamp default now(),

    trang_thai int default 0
    --0 dang thi
    --1 da nop
    --2 huy
);

create index de_thi_workspace_dot_thi_thi_sinh_idx
    on thi.de_thi (workspace_id, dot_thi_id, thi_sinh_id);
