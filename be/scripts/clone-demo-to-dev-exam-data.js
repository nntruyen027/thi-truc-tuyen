console.error(
    [
        "Script clone workspace cu da ngung ho tro.",
        "Du an da chuyen sang single-tenant va khong con platform.workspaces/workspace_id.",
        "Neu can nap du lieu mau, hay tao script moi theo mo hinh single-tenant hoac import truc tiep vao cac bang hien tai.",
    ].join(" ")
);

process.exitCode = 1;
