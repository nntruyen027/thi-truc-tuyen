drop function if exists thi.fn_nop_du_doan_ket_qua;

create function thi.fn_nop_du_doan_ket_qua(
    p_bai_thi_id int,
    p_so_du_doan int
)
    returns boolean
as
$$
begin
    if not exists(select 1 from thi.bai_thi where id = p_bai_thi_id) then
        raise 'Bài thi không tồn tại';
    end if;

    update thi.bai_thi
    set so_du_doan = p_so_du_doan
    where id = p_bai_thi_id;

    return FOUND;
end;
$$ language plpgsql;