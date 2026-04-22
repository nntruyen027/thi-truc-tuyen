drop function if exists lay_cau_hinh;

create or replace function lay_cau_hinh(
    p_khoa text
)
    returns json
    language plpgsql
as
$$
declare
    v_data jsonb;
begin
    select to_jsonb(ch) into v_data from cau_hinh ch where khoa = p_khoa;

    return v_data;
end;
$$;