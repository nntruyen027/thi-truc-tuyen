drop function if exists thi.xoa_dot_thi;

create function thi.xoa_dot_thi(
    p_id integer
)
    returns boolean
as
$$
begin
    if not exists(select 1 from thi.dot_thi where id = p_id) then
        raise 'Không tồn tại đợt thi';
    end if;

    delete from thi.dot_thi where id = p_id;

    return FOUND;

end;
$$ language plpgsql;