create or replace function file.fn_them_file(
    p_ten varchar,
    p_ten_goc varchar,
    p_duong_dan varchar,
    p_loai varchar,
    p_kich_thuoc integer,
    p_nguoi_tao integer
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_data file.file;
begin

    insert into file.file(ten,
                          ten_goc,
                          duong_dan,
                          loai,
                          kich_thuoc,
                          nguoi_tao)
    values (p_ten,
            p_ten_goc,
            p_duong_dan,
            p_loai,
            p_kich_thuoc,
            p_nguoi_tao)
    returning *
        into v_data;


    return to_jsonb(v_data);

end;
$$;