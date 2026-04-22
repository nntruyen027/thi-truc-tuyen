drop function if exists thi.lay_cuoc_thi_theo_id;

create function thi.lay_cuoc_thi_theo_id(
    p_id int
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_data jsonb;
begin

    select to_jsonb(ct)
    into v_data
    from thi.cuoc_thi ct
    where ct.id = p_id;

    return v_data;

end;
$$;