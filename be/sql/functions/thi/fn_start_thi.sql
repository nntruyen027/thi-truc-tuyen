drop function if exists thi.fn_start_thi;

create function thi.fn_start_thi(
    p_dot_thi_id int,
    p_thi_sinh_id int
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_de_thi_id     int;
    v_bai_thi_id    int;
    v_con_duoc      boolean;
    v_data          jsonb;
    v_thoi_gian_thi int;
    v_tong_da_lam   int;
    v_lan_bat_dau   timestamp;
    v_dang_lam      boolean;
    v_time_left     int;
    v_diff          int;

begin

    -------------------------
    -- check còn được thi
    -------------------------

    select thi.fn_con_duoc_thi(
                   p_dot_thi_id,
                   p_thi_sinh_id
           )
    into v_con_duoc;

    if not v_con_duoc then
        return jsonb_build_object(
                'error',
                'het_lan_thi'
               );
    end if;


    -------------------------
    -- tìm bài đang làm
    -------------------------

    select b.id,
           b.de_thi_id,
           dt.thoi_gian_thi,
           coalesce(b.tong_thoi_gian_da_lam, 0),
           b.lan_bat_dau,
           coalesce(b.dang_lam, false)
    into
        v_bai_thi_id,
        v_de_thi_id,
        v_thoi_gian_thi,
        v_tong_da_lam,
        v_lan_bat_dau,
        v_dang_lam
    from thi.bai_thi b
             join thi.de_thi d on d.id = b.de_thi_id
             join thi.dot_thi dt on dt.id = d.dot_thi_id
    where b.thi_sinh_id = p_thi_sinh_id
      and d.dot_thi_id = p_dot_thi_id
      and b.trang_thai = 0
    limit 1;


    -------------------------
    -- chưa có bài -> tạo mới
    -------------------------

    if v_bai_thi_id is null then

        select thi.fn_tao_de_thi(
                       p_dot_thi_id,
                       p_thi_sinh_id
               )
        into v_de_thi_id;


        select thi.fn_bat_dau_thi(
                       v_de_thi_id,
                       p_thi_sinh_id
               )
        into v_bai_thi_id;


        select dt.thoi_gian_thi
        into
            v_thoi_gian_thi
        from thi.de_thi d
                 join thi.dot_thi dt
                      on dt.id = d.dot_thi_id
        where d.id = v_de_thi_id;


        v_tong_da_lam := 0;

    end if;


    -------------------------
    -- nếu đang pause -> resume
    -------------------------

    if v_lan_bat_dau is null then

        update thi.bai_thi
        set lan_bat_dau = clock_timestamp(),
            dang_lam    = true
        where id = v_bai_thi_id;

        v_lan_bat_dau := clock_timestamp();

    end if;


    -------------------------
    -- tính time left
    -------------------------

    v_diff :=
            extract(
                    epoch from
                    (clock_timestamp() - v_lan_bat_dau)
            );


    v_time_left :=
            (v_thoi_gian_thi * 60)
                - (v_tong_da_lam + v_diff);


    if v_time_left < 0 then
        v_time_left := 0;
    end if;


    -------------------------
    -- trả dữ liệu
    -------------------------

    select jsonb_build_object(
                   'deThiId', v_de_thi_id,
                   'baiThiId', v_bai_thi_id,
                   'timeLeft', v_time_left,
                   'cauHoi',
                   thi.lay_cau_hoi_de_thi(
                           v_de_thi_id,
                           v_bai_thi_id
                   ),
                   'tuLuan',
                   thi.lay_cau_hoi_tu_luan_de_thi(v_bai_thi_id)
           )
    into v_data;


    return v_data;

end;
$$;