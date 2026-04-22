drop function if exists dm_chung.xoa_nhom_cau_hoi;

create function dm_chung.xoa_nhom_cau_hoi(
    p_id integer
)
    returns boolean
as
$$
begin
    if not exists(select 1 from dm_chung.nhom_cau_hoi where id = p_id) then
        raise 'Không tồn tại nhóm câu hỏi';
    end if;

    delete from dm_chung.nhom_cau_hoi where id = p_id;

    return FOUND;

end;
$$ language plpgsql;