drop function if exists thi.sua_trac_nghiem;

create function thi.sua_trac_nghiem(
    p_id integer,
    p_linh_vuc_id int,
    p_nhom_id int,
    p_cau_hoi text,
    p_cauA text, --1
    p_cauB text, --2
    p_cauC text, --3
    p_cauD text, --4
    p_dapAn int,
    p_diem int
)
    returns jsonb
as
$$
declare
    v_result jsonb;
begin
    if not exists(select 1 from thi.trac_nghiem where id = p_id) then
        raise 'Không tồn tại câu hỏi';
    end if;

    update thi.trac_nghiem
    set linh_vuc_id = p_linh_vuc_id,
        nhom_id     = p_nhom_id,
        cau_hoi     = p_cau_hoi,
        cauA        = p_cauA, --1
        cauB        = p_cauB, --2
        cauC        = p_cauC, --3
        cauD        = p_cauD, --4
        dapAn       = p_dapAn,
        diem        = p_diem
    where id = p_id;

    select to_jsonb(t)
    into v_result
    from (select tn.*,

                 (select to_jsonb(lv)
                  from dm_chung.linh_vuc lv
                  where lv.id = tn.linh_vuc_id) as linh_vuc,

                 (select to_jsonb(nh)
                  from dm_chung.nhom_cau_hoi nh
                  where nh.id = tn.nhom_id)     as nhom

          from thi.trac_nghiem tn
          where tn.id = p_id) t;

    return v_result;
end;
$$ language plpgsql;