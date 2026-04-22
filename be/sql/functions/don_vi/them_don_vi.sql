drop function if exists dm_chung.them_don_vi;

create function dm_chung.them_don_vi(
    p_ten text,
    p_mota text
)
    returns jsonb
as
$$
declare
    v_result jsonb;
    new_id   integer;
begin
    if exists(select 1 from dm_chung.don_vi where ten = p_ten) then
        raise 'Đơn vị % đã tồn tại', p_ten;
    end if;

    insert into dm_chung.don_vi(ten, mo_ta)
    values (p_ten, p_mota)
    returning id into new_id;

    select to_jsonb(lv)
    into v_result
    from dm_chung.don_vi lv
    where id = new_id;

    return v_result;

end;
$$ language plpgsql;