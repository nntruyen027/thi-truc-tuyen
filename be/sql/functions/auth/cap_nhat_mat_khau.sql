drop function if exists auth.cap_nhat_mat_khau;

create function auth.cap_nhat_mat_khau(
    p_username text,
    p_password text
)
    returns boolean
as
$$
begin
    update auth.users
    set password = p_password
    where username = p_username;

    return FOUND;
end;

$$ language plpgsql