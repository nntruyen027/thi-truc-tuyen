create or replace function auth.check_refresh(
  p_token text
)
returns json
as $$
declare
      result json;
    begin

select row_to_json(t) into result
from (

         select
             id,
             user_id,
             expire_at,
             revoked

         from auth.refresh_tokens

         where token = p_token
           and revoked = false
           and expire_at > now()

     ) t;

    return result;
end;
$$ language plpgsql;