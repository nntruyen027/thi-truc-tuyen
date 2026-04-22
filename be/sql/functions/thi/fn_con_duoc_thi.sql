create or replace function thi.fn_con_duoc_thi(
    p_dot_thi_id int,
    p_thi_sinh_id int
)
    returns boolean
    language plpgsql
as
$$
declare
    v_max    int;
    v_da_thi int;
begin
    select so_lan_tham_gia_toi_da
    into v_max
    from thi.dot_thi
    where id = p_dot_thi_id;


    select count(*)
    into v_da_thi
    from thi.bai_thi
    where thi_sinh_id = p_thi_sinh_id
      and de_thi_id in (select id
                        from thi.de_thi
                        where dot_thi_id = p_dot_thi_id)
      and trang_thai = 1;


    return v_da_thi < v_max;

end;
$$;