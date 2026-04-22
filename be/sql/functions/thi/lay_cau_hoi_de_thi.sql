drop function if exists thi.lay_cau_hoi_de_thi;

create function thi.lay_cau_hoi_de_thi(
    p_de_thi_id int,
    p_bai_thi_id int
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
    from (select q.id,
                 q.cau_hoi,
                 q.caua,
                 q.caub,
                 q.cauc,
                 q.caud,
                 q.diem,
                 dc.thu_tu,
                 ct.dap_an_chon
          from thi.de_thi_cau_hoi dc

                   join thi.trac_nghiem q
                        on q.id = dc.cau_hoi_id

                   left join thi.bai_thi_chi_tiet ct
                             on ct.cau_hoi_id = q.id
                                 and ct.bai_thi_id = p_bai_thi_id

          where dc.de_thi_id = p_de_thi_id

          order by dc.thu_tu) t;

    return coalesce(v_data, '[]'::jsonb);

end;
$$;