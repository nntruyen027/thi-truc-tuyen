drop function if exists thi.lay_thoi_gian_con_lai_cua_cuoc_thi;

create function thi.lay_thoi_gian_con_lai_cua_cuoc_thi()
    returns jsonb
    language plpgsql
as
$$
declare
    v_interval interval;
    v_seconds  bigint;
    v_thang    int;
    v_tuan     int;
    v_ngay     int;
    v_gio      int;
    v_phut     int;
    v_giay     int;

begin

    select thoi_gian_ket_thuc - now()
    into v_interval
    from thi.cuoc_thi
    where thoi_gian_bat_dau <= now()
      and thoi_gian_ket_thuc >= now()
    order by thoi_gian_ket_thuc
    limit 1;


    if v_interval is null then
        return null;
    end if;


    v_seconds :=
            extract(epoch from v_interval);


    v_thang :=
            v_seconds / (30 * 24 * 3600);

    v_seconds :=
            v_seconds % (30 * 24 * 3600);


    v_tuan :=
            v_seconds / (7 * 24 * 3600);

    v_seconds :=
            v_seconds % (7 * 24 * 3600);


    v_ngay :=
            v_seconds / (24 * 3600);

    v_seconds :=
            v_seconds % (24 * 3600);


    v_gio :=
            v_seconds / 3600;

    v_seconds :=
            v_seconds % 3600;


    v_phut :=
            v_seconds / 60;

    v_giay :=
            v_seconds % 60;


    return jsonb_build_object(
            'thang', v_thang,
            'tuan', v_tuan,
            'ngay', v_ngay,
            'gio', v_gio,
            'phut', v_phut,
            'giay', v_giay
           );

end;
$$;