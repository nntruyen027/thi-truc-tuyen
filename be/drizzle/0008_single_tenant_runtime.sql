begin;

do $$
declare
    target_workspace_id integer := 1;
    source_workspace_id integer;
begin
    if exists (
        select 1
        from information_schema.tables
        where table_schema = 'platform'
          and table_name = 'workspaces'
    ) then
        select coalesce(
            (select id from platform.workspaces where is_default = true order by id limit 1),
            (select min(id) from platform.workspaces),
            1
        )
        into source_workspace_id;

        if source_workspace_id is null then
            insert into platform.workspaces (id, code, ten, slug, status, is_default)
            values (1, 'default', 'Đơn vị mặc định', 'default', 'active', true)
            on conflict (id) do nothing;
            source_workspace_id := 1;
        end if;

        update platform.workspaces
        set is_default = (id = target_workspace_id),
            status = 'active';

        if not exists (select 1 from platform.workspaces where id = target_workspace_id) then
            insert into platform.workspaces (id, code, ten, slug, status, is_default)
            select target_workspace_id,
                   coalesce(code, 'default'),
                   coalesce(ten, 'Đơn vị mặc định'),
                   coalesce(slug, 'default'),
                   'active',
                   true
            from platform.workspaces
            where id = source_workspace_id
            limit 1;
        end if;

        if exists (
            select 1
            from information_schema.tables
            where table_schema = 'platform'
              and table_name = 'workspace_settings'
        ) then
            insert into public.cau_hinh (khoa, gia_tri)
            select ws.khoa, ws.gia_tri
            from platform.workspace_settings ws
            where ws.workspace_id = source_workspace_id
            on conflict (khoa) do update
            set gia_tri = excluded.gia_tri;
        end if;
    end if;
end $$;

update auth.users
set role = 'admin'
where role = 'super_admin';

with ranked_users as (
    select id,
           username,
           row_number() over (partition by lower(username) order by id) as rn
    from auth.users
)
update auth.users u
set username = concat(u.username, '__', u.id)
from ranked_users r
where u.id = r.id
  and r.rn > 1;

update auth.users
set workspace_id = 1
where workspace_id is distinct from 1;

update auth.refresh_tokens
set workspace_id = 1
where workspace_id is distinct from 1;

update dm_chung.don_vi set workspace_id = 1 where workspace_id is distinct from 1;
update dm_chung.linh_vuc set workspace_id = 1 where workspace_id is distinct from 1;
update dm_chung.nhom_cau_hoi set workspace_id = 1 where workspace_id is distinct from 1;
update file.file set workspace_id = 1 where workspace_id is distinct from 1;

update thi.cuoc_thi set workspace_id = 1 where workspace_id is distinct from 1;
update thi.dot_thi set workspace_id = 1 where workspace_id is distinct from 1;
update thi.trac_nghiem set workspace_id = 1 where workspace_id is distinct from 1;
update thi.trac_nghiem_dot_thi set workspace_id = 1 where workspace_id is distinct from 1;
update thi.tu_luan_dot_thi set workspace_id = 1 where workspace_id is distinct from 1;
update thi.de_thi set workspace_id = 1 where workspace_id is distinct from 1;
update thi.bai_thi set workspace_id = 1 where workspace_id is distinct from 1;

commit;
