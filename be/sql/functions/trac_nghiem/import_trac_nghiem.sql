create or replace function thi.fn_import_trac_nghiem(
    p_cau_hoi varchar,
    p_a varchar,
    p_b varchar,
    p_c varchar,
    p_d varchar,
    p_dap_an varchar,
    p_linh_vuc int,
    p_nhom int,
    p_diem numeric
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_dap int;
begin
    v_dap :=
            case upper(p_dap_an)
                when 'A' then 1
                when 'B' then 2
                when 'C' then 3
                when 'D' then 4
                end;

    insert into thi.trac_nghiem(linh_vuc_id,
                                nhom_id,
                                cau_hoi,
                                caua,
                                caub,
                                cauc,
                                caud,
                                dapan,
                                diem)
    values (p_linh_vuc,
            p_nhom,
            p_cau_hoi,
            p_a,
            p_b,
            p_c,
            p_d,
            v_dap,
            p_diem);

    return jsonb_build_object(
            'ok', true
           );

end;
$$;