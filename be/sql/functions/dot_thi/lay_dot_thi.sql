drop function if exists thi.lay_dot_thi;

create or replace function thi.lay_dot_thi(
    p_cuoc_thi_id int,
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


    select count(*)
    into v_total
    from thi.dot_thi d
    where d.cuoc_thi_id = p_cuoc_thi_id
      and (
        p_search is null
            or p_search = ''
            or d.ten ilike '%' || p_search || '%'
        );


    v_sql :=
            'select json_agg(t) from (

                select
                    d.*,

                    (
                        select row_to_json(c)
                        from thi.cuoc_thi c
                        where c.id = d.cuoc_thi_id
                    ) as cuoc_thi

                from thi.dot_thi d

                where d.cuoc_thi_id = ' || p_cuoc_thi_id || ' and ' ||
            case
                when p_search is null or p_search = ''
                    then '1=1'
                else 'd.ten ilike ''%' || p_search || '%'''
                end ||
            ' order by ' || p_sort || ' ' || p_sort_type ||
            ' limit ' || p_size ||
            ' offset ' || v_offset ||
            ') t';

    execute v_sql into v_data;

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