drop function if exists thi.sua_cuoc_thi;

create function thi.sua_cuoc_thi(
    p_id integer,
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
begin
    if not exists(select 1 from thi.cuoc_thi where id = p_id) then
        raise 'Không tồn tại cuộc thi';
    end if;

    update thi.cuoc_thi
    set ten                     = p_ten,
        mo_ta                   = p_mota,
        thoi_gian_bat_dau       = p_thoi_gian_bat_dau,
        thoi_gian_ket_thuc      = p_thoi_gian_ket_thuc,
        trang_thai              = p_trang_thai,
        cho_phep_xem_lich_su    = p_cho_phep_xem_lich_su,
        cho_phep_xem_lai_dap_an = p_cho_phep_xem_lai_dap_an,
        co_tu_luan              = p_co_tu_luan
    where id = p_id;

    select to_jsonb(lv)
    into v_result
    from thi.cuoc_thi lv
    where id = p_id;

    return v_result;
end;
$$ language plpgsql;