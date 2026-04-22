create or replace function auth.delete_expired_refresh()
returns json
language sql
as $$

delete from auth.refresh_tokens
where expire_at < now();

select json_build_object(
               'ok', true
       );

$$;
