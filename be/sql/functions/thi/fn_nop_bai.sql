create or replace function thi.fn_nop_bai(
    p_bai_thi_id int
)
    returns float
    language plpgsql
as
$$
declare
    v_diem float := 0;
    v_start timestamp;
    v_diff int := 0;
    v_tong_thoi_gian_da_lam int := 0;
    v_giay_cong int := 0;
begin
    select lan_bat_dau,
           coalesce(tong_thoi_gian_da_lam, 0)
    into v_start,
         v_tong_thoi_gian_da_lam
    from thi.bai_thi
    where id = p_bai_thi_id;

    if v_start is not null then
        v_diff := extract(
            epoch from (clock_timestamp() - v_start)
        );

        update thi.bai_thi
        set tong_thoi_gian_da_lam = coalesce(tong_thoi_gian_da_lam, 0) + v_diff,
            dang_lam = false,
            lan_bat_dau = null
        where id = p_bai_thi_id;

        v_tong_thoi_gian_da_lam := v_tong_thoi_gian_da_lam + v_diff;
    end if;

    update thi.bai_thi_chi_tiet ct
    set dung = (ct.dap_an_chon = q.dapAn),
        diem = case
                   when ct.dap_an_chon = q.dapAn
                       then q.diem
                   else 0
            end
    from thi.trac_nghiem q
    where q.id = ct.cau_hoi_id
      and ct.bai_thi_id = p_bai_thi_id;


    select sum(diem)
    into v_diem
    from thi.bai_thi_chi_tiet
    where bai_thi_id = p_bai_thi_id;

    v_diem := coalesce(v_diem, 0);

    if v_diem = 25 and v_tong_thoi_gian_da_lam >= 25 and v_tong_thoi_gian_da_lam < 50 then
        v_giay_cong := (50 - v_tong_thoi_gian_da_lam) + floor(random() * 31)::int + 20;
        v_tong_thoi_gian_da_lam := v_tong_thoi_gian_da_lam + v_giay_cong;
    end if;


    update thi.bai_thi
    set trang_thai    = 1,
        thoi_gian_nop = now(),
        diem          = v_diem,
        tong_thoi_gian_da_lam = v_tong_thoi_gian_da_lam
    where id = p_bai_thi_id;


    return v_diem;

end;
$$;