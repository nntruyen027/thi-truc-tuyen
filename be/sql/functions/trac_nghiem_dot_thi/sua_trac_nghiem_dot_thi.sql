drop function if exists thi.sua_trac_nghiem_dot_thi;

create function thi.sua_trac_nghiem_dot_thi(
    p_id int,
    p_linh_vuc_id int,
    p_nhom_id int,
    p_loai_cau_hoi varchar(50),
    p_so_luong int
)
    returns jsonb
as
$$
declare
    v_data jsonb;
begin
    update thi.trac_nghiem_dot_thi
    set linh_vuc_id = p_linh_vuc_id,
        nhom_id     = p_nhom_id,
        loai_cau_hoi = coalesce(p_loai_cau_hoi, 'chon_mot'),
        so_luong    = p_so_luong
    where id = p_id;

    select to_jsonb(tn) into v_data from thi.trac_nghiem_dot_thi tn where id = p_id;

    return v_data;
end;
$$ language plpgsql;
