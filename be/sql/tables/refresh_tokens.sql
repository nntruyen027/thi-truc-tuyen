create table auth.refresh_tokens (

        id uuid primary key,

        user_id int
            references auth.users(id),

        token text,

        expire_at timestamp,

        revoked boolean default false,

        created_at timestamp default now()

);