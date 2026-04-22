create or replace function phan_trang(
    p_data json,
    p_total int,
    p_size int,
    p_page int
)
    returns json
    language plpgsql
as
$$
declare

    v_pageCount int;
    v_start     int;
    v_end       int;

begin

    if p_size <= 0 then
        p_size := 10;
    end if;

    if p_page <= 0 then
        p_page := 1;
    end if;

    v_pageCount :=
            ceil(p_total::numeric / p_size);

    v_start :=
            (p_page - 1) * p_size + 1;

    v_end :=
            v_start +
            json_array_length(
                    coalesce(p_data, '[]'::json)
            ) - 1;

    return json_build_object(
            'page', p_page,
            'size', p_size,
            'total', p_total,
            'pageCount', v_pageCount,
            'start', v_start,
            'end', v_end,
            'data',
            coalesce(p_data, '[]'::json)
           );

end;
$$;