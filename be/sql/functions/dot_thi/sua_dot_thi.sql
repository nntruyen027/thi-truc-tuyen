drop function if exists thi.sua_dot_thi;

create function thi.sua_dot_thi(
    p_id int,
    p_ten text,
    p_mota text,
    p_so_lan_tham_gia_toi_da integer,
    p_thoi_gian_thi integer,
    p_ty_le_danh_gia_dat float,
    p_thoi_gian_bat_dau timestamp,
    p_thoi_gian_ket_thuc timestamp,
    p_co_tron_cau_hoi boolean default false,
    p_cho_phep_luu_bai boolean default false,
    p_du_doan boolean default false,
    p_trang_thai boolean default false
)
    returns jsonb
as
$$
declare
    v_result jsonb;
begin
    if not exists(select 1 from thi.dot_thi where id = p_id) then
        raise 'Đợt thi không tồn tại';
    end if;


    update thi.dot_thi
    set ten                    = p_ten,
        mo_ta                  = p_mota,
        so_lan_tham_gia_toi_da = p_so_lan_tham_gia_toi_da,
        thoi_gian_thi          = p_thoi_gian_thi,
        ty_le_danh_gia_dat     = p_ty_le_danh_gia_dat,
        thoi_gian_bat_dau      = p_thoi_gian_bat_dau,
        thoi_gian_ket_thuc     = p_thoi_gian_ket_thuc,
        co_tron_cau_hoi        = p_co_tron_cau_hoi,
        cho_phep_luu_bai       = p_cho_phep_luu_bai,
        du_doan                = p_du_doan,
        trang_thai             = p_trang_thai
    where id = p_id;

    select to_jsonb(t)
    into v_result
    from (select d.*,

                 (select to_jsonb(c)
                  from thi.cuoc_thi c
                  where c.id = d.cuoc_thi_id) as cuoc_thi

          from thi.dot_thi d
          where d.id = p_id) t;

    return v_result;

end;
$$ language plpgsql;