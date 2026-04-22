drop function if exists thi.xoa_trac_nghiem;

create function thi.xoa_trac_nghiem(
    p_id integer
)
    returns boolean
as
$$
begin
    if not exists(select 1 from thi.trac_nghiem where id = p_id) then
        raise 'Không tồn tại câu hỏi';
    end if;

    delete from thi.trac_nghiem where id = p_id;

    return FOUND;

end;
$$ language plpgsql;