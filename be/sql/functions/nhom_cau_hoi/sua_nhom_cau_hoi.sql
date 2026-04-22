drop function if exists dm_chung.sua_nhom_cau_hoi;

create function dm_chung.sua_nhom_cau_hoi(
    p_id integer,
    p_ten text,
    p_mota text default ''
)
    returns jsonb
as
$$
declare
    v_result jsonb;
begin
    if not exists(select 1 from dm_chung.nhom_cau_hoi where id = p_id) then
        raise 'Không tồn tại nhóm câu hỏi';
    end if;

    update dm_chung.nhom_cau_hoi
    set ten   = p_ten,
        mo_ta = p_mota
    where id = p_id;

    select to_jsonb(lv)
    into v_result
    from dm_chung.nhom_cau_hoi lv
    where id = p_id;

    return v_result;
end;
$$ language plpgsql;