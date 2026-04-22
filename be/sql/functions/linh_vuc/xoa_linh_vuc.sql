drop function if exists dm_chung.xoa_linh_vuc;

create function dm_chung.xoa_linh_vuc(
    p_id integer
)
    returns boolean
as
$$
begin
    if not exists(select 1 from dm_chung.linh_vuc where id = p_id) then
        raise 'Không tồn tại lĩnh vực';
    end if;

    delete from dm_chung.linh_vuc where id = p_id;

    return FOUND;

end;
$$ language plpgsql;