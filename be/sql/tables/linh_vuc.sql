drop table if exists dm_chung.linh_vuc;

create table dm_chung.linh_vuc
(
    id    serial primary key,
    ten   varchar(500),
    mo_ta varchar(500)
)