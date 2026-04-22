drop function if exists thi.lay_cau_hoi_tu_luan_de_thi;

create function thi.lay_cau_hoi_tu_luan_de_thi(
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
    from (select tldt.id,
                 tldt.cau_hoi,
                 tldt.dot_thi_id,
                 tldt.goi_y,
                 ct.dap_an,
                 ct.diem
          from thi.tu_luan_dot_thi tldt
                   left join thi.bai_thi_chi_tiet_tu_luan ct
                             on ct.cau_hoi_id = tldt.id
                                 and ct.bai_thi_id = p_bai_thi_id
          order by tldt.id) t;

    return coalesce(v_data, '[]'::jsonb);

end;
$$;


select thi.lay_cau_hoi_tu_luan_de_thi(34) as data;