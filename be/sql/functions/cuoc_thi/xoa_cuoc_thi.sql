drop function if exists thi.xoa_cuoc_thi;

create function thi.xoa_cuoc_thi(
    p_id integer
)
    returns boolean
as
$$
begin
    if not exists(select 1 from thi.cuoc_thi where id = p_id) then
        raise 'Không tồn tại cuộc thi';
    end if;

    delete from thi.cuoc_thi where id = p_id;

    return FOUND;

end;
$$ language plpgsql;