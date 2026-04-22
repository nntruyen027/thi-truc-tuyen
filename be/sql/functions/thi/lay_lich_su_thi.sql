drop function if exists thi.lay_lich_su_thi;

create function thi.lay_lich_su_thi(
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

    select jsonb_agg(t)
    into v_data
    from (select b.*,
                 (select to_jsonb(dt) from thi.dot_thi dt where id = d.dot_thi_id) as dot_thi
          from thi.bai_thi b
                   join thi.de_thi d on d.id = b.de_thi_id
          where b.thi_sinh_id = p_thi_sinh_id
            and d.dot_thi_id = p_dot_thi_id
          order by b.lan_thi) t;

    return coalesce(v_data, '[]'::jsonb);

end;
$$;