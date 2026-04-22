drop function if exists thi.sua_tu_luan_dot_thi;

create function thi.sua_tu_luan_dot_thi(
    p_id int,
    p_cau_hoi text,
    p_goi_y text
)
    returns jsonb
as
$$
declare
    v_data jsonb;
begin
    update thi.tu_luan_dot_thi
    set goi_y   = p_goi_y,
        cau_hoi = p_cau_hoi
    where id = p_id;

    select to_jsonb(tn) into v_data from thi.tu_luan_dot_thi tn where id = p_id;

    return v_data;
end;
$$ language plpgsql;