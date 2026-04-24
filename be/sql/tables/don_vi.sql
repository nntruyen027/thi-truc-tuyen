drop table if exists dm_chung.don_vi;

create table dm_chung.don_vi
(
    id           serial primary key,
    workspace_id int not null,
    ten          varchar(500),
    mo_ta        varchar(500)
);

create index don_vi_workspace_ten_idx
    on dm_chung.don_vi (workspace_id, ten);
