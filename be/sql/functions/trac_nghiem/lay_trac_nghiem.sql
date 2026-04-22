drop function if exists thi.lay_trac_nghiem;

create or replace function thi.lay_trac_nghiem(
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
    v_where  text;
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

    -------------------
    -- whitelist sort
    -------------------

    if p_sort not in (
                      'id',
                      'cau_hoi',
                      'diem'
        ) then
        p_sort := 'id';
    end if;

    if p_sort_type not in ('asc', 'desc') then
        p_sort_type := 'asc';
    end if;

    v_offset :=
            (p_page - 1) * p_size;

    -------------------
    -- where search
    -------------------

    if p_search is null or p_search = '' then
        v_where := '1=1';
    else
        v_where :=
                'tn.cau_hoi ilike ' ||
                quote_literal('%' || p_search || '%');
    end if;

    -------------------
    -- total
    -------------------

    select count(*)
    into v_total
    from thi.trac_nghiem tn
    where (
              p_search is null
                  or p_search = ''
                  or tn.cau_hoi ilike '%' || p_search || '%'
              );

    -------------------
    -- sql data (có JSON lĩnh vực + nhóm)
    -------------------

    v_sql :=
            'select coalesce(json_agg(t), ''[]''::json)
             from (

                select
                    tn.*,

                    (
                        select to_jsonb(lv)
                        from dm_chung.linh_vuc lv
                        where lv.id = tn.linh_vuc_id
                    ) as linh_vuc,

                    (
                        select to_jsonb(nh)
                        from dm_chung.nhom_cau_hoi nh
                        where nh.id = tn.nhom_id
                    ) as nhom

                from thi.trac_nghiem tn

                where ' || v_where || '

        order by ' || p_sort || ' ' || p_sort_type || '

        limit ' || p_size || '

        offset ' || v_offset || '

     ) t';

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