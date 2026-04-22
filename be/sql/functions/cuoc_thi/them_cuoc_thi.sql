drop function if exists thi.them_cuoc_thi;

create function thi.them_cuoc_thi(
    p_ten text,
    p_mota text,
    p_thoi_gian_bat_dau timestamp,
    p_thoi_gian_ket_thuc timestamp,
    p_trang_thai boolean,
    p_cho_phep_xem_lich_su boolean,
    p_cho_phep_xem_lai_dap_an boolean,
    p_co_tu_luan boolean
)
    returns jsonb
as
$$
declare
    v_result jsonb;
    new_id   integer;
begin
    if exists(select 1 from thi.cuoc_thi where ten = p_ten) then
        raise 'Cuộc thi % đã tồn tại', p_ten;
    end if;

    insert into thi.cuoc_thi(ten, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai, cho_phep_xem_lich_su,
                             cho_phep_xem_lai_dap_an, co_tu_luan)
    values (p_ten, p_mota, p_thoi_gian_bat_dau, p_thoi_gian_ket_thuc, p_trang_thai, p_cho_phep_xem_lich_su,
            p_cho_phep_xem_lai_dap_an, p_co_tu_luan)
    returning id into new_id;

    select to_jsonb(lv)
    into v_result
    from thi.cuoc_thi lv
    where id = new_id;

    return v_result;

end;
$$ language plpgsql;