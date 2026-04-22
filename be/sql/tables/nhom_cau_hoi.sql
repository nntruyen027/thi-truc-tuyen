drop table if exists dm_chung.nhom_cau_hoi;

create table dm_chung.nhom_cau_hoi
(
    id    serial primary key,
    ten   varchar(500),
    mo_ta varchar(500)
)