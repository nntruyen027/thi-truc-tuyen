drop function if exists auth.tao_nguoi_dung;

create function auth.tao_nguoi_dung(
    p_username text,
    p_ho_ten text,
    p_password text,
    p_don_vi_id int
)
    returns jsonb
as
$$
declare
    v_username text;
begin
    if exists(select 1 from auth.users where username = p_username) then
        raise 'Tài khoản % đã tồn tại', p_username;
    end if;

    insert into auth.users(username,
                           password, ho_ten, don_vi_id, role)
    values (p_username,
            p_password, p_ho_ten, p_don_vi_id, 'user')
    returning username into v_username;

    return auth.lay_user_by_username(v_username);
end
$$ language plpgsql;