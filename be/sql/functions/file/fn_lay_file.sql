create or replace function file.fn_lay_file(
    p_page int,
    p_size int,
    p_search varchar
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_result jsonb;
begin
    select jsonb_build_object(
                   'data',
                   (select jsonb_agg(t)
                    from (select *
                          from file.file f
                          where p_search is null
                             or f.ten ilike '%' || p_search || '%'
                          order by id desc
                          offset (p_page - 1) * p_size limit p_size) t),
                   'total',
                   (select count(*)
                    from file.file f
                    where p_search is null
                       or f.ten ilike '%' || p_search || '%')
           )
    into v_result;

    return v_result;

end;
$$;