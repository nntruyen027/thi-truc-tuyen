alter table if exists auth.users
    add column if not exists dia_chi_dong_1 varchar(500),
    add column if not exists xa_phuong varchar(255),
    add column if not exists tinh_thanh varchar(255),
    add column if not exists nghe_nghiep varchar(100),
    add column if not exists doi_tuong varchar(100);
