drop function if exists thi.fn_dung_thi;

create function thi.fn_dung_thi(
    p_bai_thi_id int
)
    returns boolean
    language plpgsql
as
$$
declare
v_start timestamp;
    v_tong int;
    v_diff int;
begin

select lan_bat_dau,
       tong_thoi_gian_da_lam
into v_start,
    v_tong
from thi.bai_thi
where id = p_bai_thi_id;

if v_start is null then
        return false;
end if;


    v_diff :=
        extract(
            epoch from
            (clock_timestamp() - v_start)
        );


update thi.bai_thi
set tong_thoi_gian_da_lam =
        tong_thoi_gian_da_lam + v_diff,
    dang_lam = false,
    lan_bat_dau = null
where id = p_bai_thi_id;

return true;

end;
$$;