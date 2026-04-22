drop function if exists dm_chung.them_nhom_cau_hoi;

create function dm_chung.them_nhom_cau_hoi(
    p_ten text,
    p_mota text default ''
)
    returns jsonb
as
$$
declare
    v_result jsonb;
    new_id   integer;
begin
    if exists(select 1 from dm_chung.nhom_cau_hoi where ten = p_ten) then
        raise 'Nhóm câu hỏi % đã tồn tại', p_ten;
    end if;

    insert into dm_chung.nhom_cau_hoi(ten, mo_ta)
    values (p_ten, p_mota)
    returning id into new_id;

    select to_jsonb(lv)
    into v_result
    from dm_chung.nhom_cau_hoi lv
    where id = new_id;

    return v_result;

end;
$$ language plpgsql;