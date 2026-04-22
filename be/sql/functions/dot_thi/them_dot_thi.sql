drop function if exists thi.them_dot_thi;

create function thi.them_dot_thi(
    p_ten text,
    p_mota text,
    p_cuoc_thi_id integer,
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
    new_id   integer;
begin
    if exists(select 1 from thi.dot_thi where ten = p_ten) then
        raise 'Đợt thi % đã tồn tại', p_ten;
    end if;

    if not exists(select 1 from thi.cuoc_thi where id = p_cuoc_thi_id) then
        raise 'Cuộc thi không tồn tại';
    end if;

    insert into thi.dot_thi
    (cuoc_thi_id, ten, mo_ta, so_lan_tham_gia_toi_da, thoi_gian_thi,
     ty_le_danh_gia_dat, thoi_gian_bat_dau, thoi_gian_ket_thuc,
     co_tron_cau_hoi, cho_phep_luu_bai, du_doan, trang_thai)
    values (p_cuoc_thi_id, p_ten, p_mota, p_so_lan_tham_gia_toi_da, p_thoi_gian_thi,
            p_ty_le_danh_gia_dat, p_thoi_gian_bat_dau, p_thoi_gian_ket_thuc,
            p_co_tron_cau_hoi, p_cho_phep_luu_bai, p_du_doan, p_trang_thai)
    returning id into new_id;

    select to_jsonb(t)
    into v_result
    from (select d.*,

                 (select to_jsonb(c)
                  from thi.cuoc_thi c
                  where c.id = d.cuoc_thi_id) as cuoc_thi

          from thi.dot_thi d
          where d.id = new_id) t;

    return v_result;

end;
$$ language plpgsql;