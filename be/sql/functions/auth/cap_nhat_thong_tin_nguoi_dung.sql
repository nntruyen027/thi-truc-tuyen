drop function if exists auth.cap_nhat_thong_tin_nguoi_dung;

create function auth.cap_nhat_thong_tin_nguoi_dung(
    p_username text,
    p_ho_ten text,
    p_don_vi_id int
)
    returns jsonb
as
$$
begin
    update auth.users
    set ho_ten    = p_ho_ten,
        don_vi_id = p_don_vi_id
    where username = p_username;


    return auth.lay_user_by_username(p_username);
end;

$$ language plpgsql;