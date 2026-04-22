create or replace function thi.fn_tao_de_thi(
    p_dot_thi_id int,
    p_thi_sinh_id int
)
    returns int
    language plpgsql
as
$$
declare
    v_de_thi_id int;
    v_lan_thi   int;
    r           record;
    v_cau_id    int;
    v_thu_tu    int := 0;
begin

    -- lần thi
    select coalesce(max(lan_thi), 0) + 1
    into v_lan_thi
    from thi.de_thi
    where dot_thi_id = p_dot_thi_id
      and thi_sinh_id = p_thi_sinh_id;

-- tạo đề
    insert into thi.de_thi(dot_thi_id, thi_sinh_id, lan_thi)
    values (p_dot_thi_id, p_thi_sinh_id, v_lan_thi)
    returning id into v_de_thi_id;


-- random theo cấu hình
    for r in
        select *
        from thi.trac_nghiem_dot_thi
        where dot_thi_id = p_dot_thi_id
        loop

            for v_cau_id in
                select id
                from thi.trac_nghiem
                where linh_vuc_id = r.linh_vuc_id
                  and nhom_id = r.nhom_id
                order by random()
                limit r.so_luong
                loop

                    v_thu_tu := v_thu_tu + 1;

                    insert into thi.de_thi_cau_hoi(de_thi_id,
                                                   cau_hoi_id,
                                                   thu_tu)
                    values (v_de_thi_id,
                            v_cau_id,
                            v_thu_tu);

                end loop;

        end loop;


    return v_de_thi_id;

end;
$$;