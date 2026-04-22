drop function if exists thi.them_tu_luan_dot_thi;

create function thi.them_tu_luan_dot_thi(
    p_dot_thi_id int,
    p_cau_hoi text,
    p_goi_y text
)
    returns jsonb
as
$$
declare
    v_data   jsonb;
    v_new_id int;
begin
    insert into thi.tu_luan_dot_thi(dot_thi_id, cau_hoi, goi_y)
    VALUES (p_dot_thi_id, p_cau_hoi, p_goi_y)
    returning id into v_new_id;

    select to_jsonb(tn) into v_data from thi.tu_luan_dot_thi tn where id = v_new_id;

    return v_data;
end;
$$ language plpgsql;