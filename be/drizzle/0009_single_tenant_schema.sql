begin;

alter table if exists auth.users
    alter column workspace_id set default 1;
alter table if exists auth.refresh_tokens
    alter column workspace_id set default 1;
alter table if exists dm_chung.don_vi
    alter column workspace_id set default 1;
alter table if exists dm_chung.linh_vuc
    alter column workspace_id set default 1;
alter table if exists dm_chung.nhom_cau_hoi
    alter column workspace_id set default 1;
alter table if exists public.bai_viet
    alter column workspace_id set default 1;
alter table if exists file.file
    alter column workspace_id set default 1;
alter table if exists thi.cuoc_thi
    alter column workspace_id set default 1;
alter table if exists thi.dot_thi
    alter column workspace_id set default 1;
alter table if exists thi.trac_nghiem
    alter column workspace_id set default 1;
alter table if exists thi.trac_nghiem_dot_thi
    alter column workspace_id set default 1;
alter table if exists thi.tu_luan_dot_thi
    alter column workspace_id set default 1;
alter table if exists thi.de_thi
    alter column workspace_id set default 1;
alter table if exists thi.bai_thi
    alter column workspace_id set default 1;

alter table if exists auth.users
    drop constraint if exists uq_auth_users_workspace_username;

create unique index if not exists uq_auth_users_username
    on auth.users (username);

drop table if exists platform.workspace_domains;
drop table if exists platform.workspace_settings;
drop table if exists platform.workspaces;
drop schema if exists platform;

commit;
