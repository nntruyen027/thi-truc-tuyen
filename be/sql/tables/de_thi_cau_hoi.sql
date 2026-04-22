drop table if exists thi.de_thi_cau_hoi;

create table thi.de_thi_cau_hoi
(
    id serial primary key,
    de_thi_id int references thi.de_thi(id) on delete cascade,
    cau_hoi_id int references thi.trac_nghiem(id),
    thu_tu int
);