drop function if exists thi.lay_bai_dang_lam;

create function thi.lay_bai_dang_lam(
    p_thi_sinh_id int,
    p_dot_thi_id int
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_data jsonb;
begin
    select to_jsonb(t)
    into v_data
    from (select b.*
          from thi.bai_thi b
                   join thi.de_thi d on d.id = b.de_thi_id
          where b.thi_sinh_id = p_thi_sinh_id
            and d.dot_thi_id = p_dot_thi_id
            and b.trang_thai = 0
          limit 1) t;

    return coalesce(v_data, '{}'::jsonb);

end;
$$;