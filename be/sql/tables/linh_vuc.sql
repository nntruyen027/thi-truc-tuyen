drop table if exists dm_chung.linh_vuc;

create table dm_chung.linh_vuc
(
    id           serial primary key,
    workspace_id int not null,
    ten          varchar(500),
    mo_ta        varchar(500)
);

create index linh_vuc_workspace_ten_idx
    on dm_chung.linh_vuc (workspace_id, ten);
