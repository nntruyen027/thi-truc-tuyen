drop function if exists thi.lay_cuoc_thi;

create or replace function thi.lay_cuoc_thi(
    p_size int,
    p_page int,
    p_search text,
    p_sort text,
    p_sort_type text
)
    returns json
    language plpgsql
as
$$
declare
    v_offset int;
    v_total  int;
    v_sql    text;
    v_data   json;

begin

    -------------------
    -- default
    -------------------

    if p_size is null or p_size <= 0 then
        p_size := 10;
    end if;

    if p_page is null or p_page <= 0 then
        p_page := 1;
    end if;

    if p_sort is null or p_sort = '' then
        p_sort := 'id';
    end if;

    if p_sort_type not in ('asc', 'desc') then
        p_sort_type := 'asc';
    end if;

    v_offset :=
            (p_page - 1) * p_size;

    -------------------
    -- total
    -------------------

    select count(*)
    into v_total
    from thi.cuoc_thi
    where p_search is null
       or p_search = ''
       or ten ilike '%' || p_search || '%';

    -------------------
-- sql data
-------------------

    v_sql :=
            'select * from thi.cuoc_thi
             where ' ||
            case
                when p_search is null or p_search = ''
                    then '1=1'
                else 'ten ilike ''%' || p_search || '%'''
                end ||
            ' order by ' || p_sort || ' ' || p_sort_type ||
            ' limit ' || p_size ||
            ' offset ' || v_offset;

    execute
        'select json_agg(t) from (' || v_sql || ') t'
        into v_data;

    -------------------
-- paging
-------------------

    return phan_trang(
            v_data,
            v_total,
            p_size,
            p_page
           );

end;
$$;