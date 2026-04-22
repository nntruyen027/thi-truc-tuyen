drop function if exists thi.lay_trac_nghiem_dot_thi;

create or replace function thi.lay_trac_nghiem_dot_thi(
    p_dot_thi_id int
)
    returns jsonb
    language plpgsql
as
$$
declare
    v_data jsonb;
begin
    select coalesce(jsonb_agg(to_jsonb(tn)), '[]'::jsonb)
    into v_data
    from thi.trac_nghiem_dot_thi tn
    where dot_thi_id = p_dot_thi_id;

    return v_data;
end;
$$;