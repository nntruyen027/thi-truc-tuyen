create or replace function thi.fn_de_dang_lam(
    p_dot_thi_id int,
    p_thi_sinh_id int
)
    returns int
    language plpgsql
as
$$
declare
    v_de int;
begin
    select d.id
    into v_de
    from thi.de_thi d
             join thi.bai_thi b on b.de_thi_id = d.id
    where d.dot_thi_id = p_dot_thi_id
      and b.thi_sinh_id = p_thi_sinh_id
      and b.trang_thai = 0
    limit 1;

    return v_de;
end;
$$;