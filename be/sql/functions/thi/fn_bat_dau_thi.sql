create or replace function thi.fn_bat_dau_thi(
    p_de_thi_id int,
    p_thi_sinh_id int
)
    returns int
    language plpgsql
as
$$
declare
    v_bai_thi_id int;
    v_lan        int;
begin

    select lan_thi
    into v_lan
    from thi.de_thi
    where id = p_de_thi_id;

    insert into thi.bai_thi(de_thi_id,
                            thi_sinh_id,
                            lan_thi)
    values (p_de_thi_id,
            p_thi_sinh_id,
            v_lan)
    returning id into v_bai_thi_id;

    return v_bai_thi_id;

end;
$$;