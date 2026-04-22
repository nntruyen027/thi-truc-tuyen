create or replace function auth.revoke_refresh(
  p_token text
)
returns json
language sql
as $$

update auth.refresh_tokens
set revoked = true
where token = p_token;

select json_build_object(
               'ok', true
       );

$$;