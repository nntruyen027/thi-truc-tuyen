drop table if exists dm_chung.don_vi;

create table dm_chung.don_vi
(
    id           serial primary key,
    ten          varchar(500),
    mo_ta        varchar(500)
);

create index don_vi_ten_idx
    on dm_chung.don_vi (ten);
