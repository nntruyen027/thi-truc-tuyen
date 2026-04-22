drop function if exists auth.save_refresh;

create function auth.save_refresh(
    p_id uuid,
    p_user_id int,
    p_token text,
    p_exp timestamp
)
    returns void
as
$$
begin

    insert into auth.refresh_tokens(id,
                                    user_id,
                                    token,
                                    expire_at)
    values (p_id,
            p_user_id,
            p_token,
            p_exp);

end
$$ language plpgsql;