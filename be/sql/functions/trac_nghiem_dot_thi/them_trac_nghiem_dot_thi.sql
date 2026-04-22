drop function if exists thi.them_trac_nghiem_dot_thi;

create function thi.them_trac_nghiem_dot_thi(
    p_dot_thi_id int,
    p_linh_vuc_id int,
    p_nhom_id int,
    p_so_luong int
)
    returns jsonb
as
$$
declare
    v_data   jsonb;
    v_new_id int;
begin
    insert into thi.trac_nghiem_dot_thi(dot_thi_id, linh_vuc_id, nhom_id, so_luong)
    VALUES (p_dot_thi_id, p_linh_vuc_id, p_nhom_id, p_so_luong)
    returning id into v_new_id;

    select to_jsonb(tn) into v_data from thi.trac_nghiem_dot_thi tn where id = v_new_id;

    return v_data;
end;
$$ language plpgsql;