create or replace function thi.fn_luu_cau_tra_loi(
    p_bai_thi_id int,
    p_cau_hoi_id int,
    p_dap_an int
)
    returns void
    language plpgsql
as
$$
begin
    insert into thi.bai_thi_chi_tiet(bai_thi_id,
                                     cau_hoi_id,
                                     dap_an_chon)
    values (p_bai_thi_id,
            p_cau_hoi_id,
            p_dap_an)
    on conflict (bai_thi_id, cau_hoi_id)
        do update
        set dap_an_chon = excluded.dap_an_chon;

end;
$$;