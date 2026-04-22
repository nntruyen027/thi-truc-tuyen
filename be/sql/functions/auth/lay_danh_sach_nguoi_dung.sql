drop function if exists auth.lay_danh_sach_nguoi_dung(text, int, int);

create function auth.lay_danh_sach_nguoi_dung(
    p_search text,
    p_page int default 1,
    p_size int default 10
)
    returns json
    language plpgsql
as
$$
declare
    v_count  int;
    v_offset int;
    v_data   json;
begin
    if p_page < 1 then
        p_page := 1;
    end if;

    if p_size < 1 then
        p_size := 1;
    end if;

    v_offset := (p_page - 1) * p_size;

    select count(id)
    into v_count
    from auth.users
    where p_search is null
       or p_search = ''
       or unaccent(lower(ho_ten)) like '%' || unaccent(lower(p_search)) || '%';

    select coalesce(json_agg(r), '[]'::json)
    into v_data
    from (select nd.*,
                 (select to_jsonb(dv)
                  from dm_chung.don_vi dv
                  where dv.id = nd.don_vi_id
                  limit 1) as don_vi
          from auth.users nd
          where p_search is null
             or p_search = ''
             or unaccent(lower(ho_ten)) like '%' || unaccent(lower(p_search)) || '%'
          limit p_size offset v_offset) r;

    return phan_trang(v_data, v_count, p_size, p_page);
end;
$$;