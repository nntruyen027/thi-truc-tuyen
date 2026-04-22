create or replace function file.fn_xoa_file(
    p_id int
)
    returns jsonb
    language plpgsql
as
$$
begin
    delete
    from file.file
    where id = p_id;

    return jsonb_build_object(
            'ok', true
           );

end;
$$;