drop function if exists dm_chung.xoa_don_vi;

create function dm_chung.xoa_don_vi(
    p_id integer
)
    returns boolean
as
$$
begin
    if not exists(select 1 from dm_chung.don_vi where id = p_id) then
        raise 'Không tồn tại đơn vị';
    end if;

    delete from dm_chung.don_vi where id = p_id;

    return FOUND;

end;
$$ language plpgsql;