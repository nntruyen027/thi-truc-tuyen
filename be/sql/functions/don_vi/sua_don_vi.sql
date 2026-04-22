drop function if exists dm_chung.sua_don_vi;

create function dm_chung.sua_don_vi(
    p_id integer,
    p_ten text,
    p_mota text
)
    returns jsonb
as
$$
declare
    v_result jsonb;
begin
    if not exists(select 1 from dm_chung.don_vi where id = p_id) then
        raise 'Không tồn tại đơn vị';
    end if;

    update dm_chung.don_vi
    set ten   = p_ten,
        mo_ta = p_mota
    where id = p_id;

    select to_jsonb(lv)
    into v_result
    from dm_chung.don_vi lv
    where id = p_id;

    return v_result;
end;
$$ language plpgsql;