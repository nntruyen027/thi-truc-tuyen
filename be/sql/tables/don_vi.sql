drop table if exists dm_chung.don_vi;

create table dm_chung.don_vi
(
    id    serial primary key,
    ten   varchar(500),
    mo_ta varchar(500)
)