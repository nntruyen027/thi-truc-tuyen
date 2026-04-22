drop function if exists sua_cau_hinh;

create function sua_cau_hinh(
    p_khoa text,
    p_gia_tri text
)
    returns jsonb
as
$$
declare
    v_result jsonb;
begin

    insert into cau_hinh(khoa,
                         gia_tri)
    values (p_khoa,
            p_gia_tri)
    on conflict (khoa)
        do update
        set gia_tri = excluded.gia_tri;


    select to_jsonb(ch)
    into v_result
    from cau_hinh ch
    where ch.khoa = p_khoa;


    return v_result;

end;
$$ language plpgsql;