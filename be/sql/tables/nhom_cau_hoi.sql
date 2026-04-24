drop table if exists dm_chung.nhom_cau_hoi;

create table dm_chung.nhom_cau_hoi
(
    id           serial primary key,
    workspace_id int not null,
    ten          varchar(500),
    mo_ta        varchar(500)
);

create index nhom_cau_hoi_workspace_ten_idx
    on dm_chung.nhom_cau_hoi (workspace_id, ten);
