alter table if exists thi.trac_nghiem
    add column if not exists loai_cau_hoi varchar(50) default 'chon_mot',
    add column if not exists dap_an_nhieu text,
    add column if not exists dap_an_text text;

update thi.trac_nghiem
set loai_cau_hoi = 'chon_mot'
where loai_cau_hoi is null;

alter table if exists thi.bai_thi_chi_tiet
    add column if not exists dap_an_chon_nhieu text,
    add column if not exists dap_an_tu_do text;
