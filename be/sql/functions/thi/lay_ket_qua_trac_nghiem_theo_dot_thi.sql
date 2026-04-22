drop function if exists thi.lay_giai_trac_nghiem_theo_dot_thi;

create function thi.lay_giai_trac_nghiem_theo_dot_thi(
    p_dot_thi_id int,
    p_top int
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_data jsonb;
begin

    with bt0 as (select bt.*
                 from thi.bai_thi bt
                          join thi.de_thi dt on dt.id = bt.de_thi_id
                 where dt.dot_thi_id = p_dot_thi_id),

         diem_ct as (select bt.id,
                            count(ct.*)                              as tong,
                            sum(case when ct.dung then 1 else 0 end) as dung
                     from bt0 bt
                              left join thi.bai_thi_chi_tiet ct
                                        on ct.bai_thi_id = bt.id
                     group by bt.id),

         so_nguoi_100 as (select count(*) as sl
                          from diem_ct
                          where dung = tong),

         best_each as (select bt.*,
                              to_jsonb(u) - 'password' - 'role' as thi_sinh,

                              row_number() over (
                                  partition by bt.thi_sinh_id
                                  order by
                                      bt.diem desc nulls last,
                                      bt.tong_thoi_gian_da_lam asc nulls last
                                  )                             as rn

                       from bt0 bt
                                join auth.users u
                                     on u.id = bt.thi_sinh_id),

         best as (select *
                  from best_each
                  where rn = 1),

         ranked as (select b.*,
                           coalesce(s.sl, 0)                                  as so_nguoi_100,
                           abs(coalesce(b.so_du_doan, 0) - coalesce(s.sl, 0)) as sai_so

                    from best b
                             left join so_nguoi_100 s on true

                    order by b.diem desc nulls last,
                             b.tong_thoi_gian_da_lam asc nulls last,
                             abs(coalesce(b.so_du_doan, 0) - coalesce(s.sl, 0)) asc

                    limit p_top)

    select jsonb_agg(
                   jsonb_build_object(
                           'bai_thi_id', id,
                           'thi_sinh', thi_sinh,
                           'diem', diem,
                           'thoi_gian', tong_thoi_gian_da_lam,
                           'so_du_doan', so_du_doan,
                           'so_nguoi_100', so_nguoi_100,
                           'sai_so', sai_so
                   )
           )
    into v_data
    from ranked;

    return v_data;

end;
$$;


select *
from thi.lay_giai_trac_nghiem_theo_dot_thi(2, 10);