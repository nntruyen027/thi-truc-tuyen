begin;

create table if not exists "thi"."public_ranking_snapshot" (
    "id" serial primary key,
    "dot_thi_id" integer not null,
    "cuoc_thi_id" integer not null,
    "ranking_top" integer not null default 20,
    "honor_top" integer not null default 200,
    "payload" jsonb not null,
    "created_at" timestamp not null default now(),
    constraint "uq_public_ranking_snapshot_scope" unique ("dot_thi_id", "cuoc_thi_id")
);

create index if not exists "idx_public_ranking_snapshot_created_at"
    on "thi"."public_ranking_snapshot" ("created_at" desc);

commit;
