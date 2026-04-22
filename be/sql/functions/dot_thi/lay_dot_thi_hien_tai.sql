drop function if exists thi.lay_dot_thi_hien_tai;

create function thi.lay_dot_thi_hien_tai()
    returns jsonb
    language plpgsql
as
$$
declare
    v_data jsonb;
begin

    select to_jsonb(r)
    into v_data
    from (select d.*,
                 (select to_jsonb(ct) from thi.cuoc_thi ct where ct.id = d.cuoc_thi_id limit 1) as "cuoc_thi"
          from thi.dot_thi d
          where d.thoi_gian_bat_dau <= now()
            and d.thoi_gian_ket_thuc >= now()
          order by d.thoi_gian_bat_dau desc
          limit 1) r;

    return v_data;

end;
$$;