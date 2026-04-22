create or replace function thi.fn_nop_bai(
    p_bai_thi_id int
)
    returns float
    language plpgsql
as
$$
declare
    v_diem float := 0;
begin
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


    update thi.bai_thi
    set trang_thai    = 1,
        thoi_gian_nop = now(),
        diem          = v_diem
    where id = p_bai_thi_id;


    return v_diem;

end;
$$;