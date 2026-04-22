drop schema if exists file cascade;

create schema file;

create table file.file
(
    id            serial primary key,

    ten           varchar(500),

    ten_goc       varchar(500),

    duong_dan     varchar(1000),

    loai          varchar(100),

    kich_thuoc    integer,

    nguoi_tao     integer,

    thoi_gian_tao timestamp default now()
);