drop function if exists auth.lay_user_by_username;

create function auth.lay_user_by_username(
    p_username text
)
    returns jsonb
as
$$
declare
    result jsonb;
begin

    select to_jsonb(r)
    into result
    from (select u.*,
                 to_jsonb(dv.*) as "don_vi"
          from auth.users u
                   left join dm_chung.don_vi dv on u.don_vi_id = dv.id
          where username = p_username
          limit 1) r;

    return result;

end
$$ language plpgsql;