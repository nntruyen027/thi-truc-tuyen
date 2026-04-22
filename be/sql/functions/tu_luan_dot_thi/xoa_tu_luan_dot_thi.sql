drop function if exists thi.xoa_tu_luan_dot_thi;

create function thi.xoa_tu_luan_dot_thi(
    p_id integer
)
    returns boolean
as
$$
begin

    delete from thi.tu_luan_dot_thi where id = p_id;

    return FOUND;

end;
$$ language plpgsql;