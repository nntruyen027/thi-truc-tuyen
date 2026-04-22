drop function if exists thi.them_trac_nghiem;

create function thi.them_trac_nghiem(
    p_linh_vuc_id int,
    p_nhom_id int,
    p_cau_hoi text,
    p_cauA text,
    p_cauB text,
    p_cauC text,
    p_cauD text,
    p_dapAn int,
    p_diem int
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_result jsonb;
    new_id   int;
begin

    insert into thi.trac_nghiem
    (linh_vuc_id,
     nhom_id,
     cau_hoi,
     cauA,
     cauB,
     cauC,
     cauD,
     dapAn,
     diem)
    values (p_linh_vuc_id,
            p_nhom_id,
            p_cau_hoi,
            p_cauA,
            p_cauB,
            p_cauC,
            p_cauD,
            p_dapAn,
            p_diem)
    returning id into new_id;

    ---------------------------------
    -- trả về có lồng json
    ---------------------------------

    select to_jsonb(t)
    into v_result
    from (select tn.*,

                 (select to_jsonb(lv)
                  from dm_chung.linh_vuc lv
                  where lv.id = tn.linh_vuc_id) as linh_vuc,

                 (select to_jsonb(nh)
                  from dm_chung.nhom_cau_hoi nh
                  where nh.id = tn.nhom_id)     as nhom

          from thi.trac_nghiem tn
          where tn.id = new_id) t;

    return v_result;

end;
$$;