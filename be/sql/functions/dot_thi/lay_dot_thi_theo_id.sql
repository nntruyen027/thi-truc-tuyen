drop function if exists thi.lay_dot_thi_theo_id;

create function thi.lay_dot_thi_theo_id(
    p_id int
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
    from (select dt.*,

                 (select coalesce(
                                 jsonb_agg(to_jsonb(tn)),
                                 '[]'::jsonb
                         )
                  from thi.trac_nghiem_dot_thi tn
                  where tn.dot_thi_id = dt.id) as trac_nghiem,

                 (select coalesce(
                                 jsonb_agg(to_jsonb(tl)),
                                 '[]'::jsonb
                         )
                  from thi.tu_luan_dot_thi tl
                  where tl.dot_thi_id = dt.id) as tu_luan

          from thi.dot_thi dt
          where dt.id = p_id) t;

    return v_data;

end;
$$;