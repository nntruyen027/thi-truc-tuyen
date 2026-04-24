const { and, asc, eq, ne } = require("drizzle-orm");
const db = require("../../db/client");
const { workspaceDomains, workspaceSettings, workspaces } = require("../../db/schema");

function mapWorkspace(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        code: row.code,
        ten: row.ten,
        slug: row.slug,
        status: row.status,
        is_default: row.is_default,
        created_at: row.created_at,
        updated_at: row.updated_at,
        primary_domain: row.primary_domain || null,
    };
}

exports.mapWorkspace = mapWorkspace;

exports.getDefaultWorkspace = async () => {
    const [row] = await db
        .select({
            id: workspaces.id,
            code: workspaces.code,
            ten: workspaces.ten,
            slug: workspaces.slug,
            status: workspaces.status,
            is_default: workspaces.isDefault,
            created_at: workspaces.createdAt,
            updated_at: workspaces.updatedAt,
        })
        .from(workspaces)
        .where(eq(workspaces.isDefault, true))
        .limit(1);

    return mapWorkspace(row);
};

exports.getWorkspaceById = async (id) => {
    const [row] = await db
        .select({
            id: workspaces.id,
            code: workspaces.code,
            ten: workspaces.ten,
            slug: workspaces.slug,
            status: workspaces.status,
            is_default: workspaces.isDefault,
            created_at: workspaces.createdAt,
            updated_at: workspaces.updatedAt,
        })
        .from(workspaces)
        .where(eq(workspaces.id, Number(id)))
        .limit(1);

    return mapWorkspace(row);
};

exports.getWorkspaceByCode = async (code) => {
    const [row] = await db
        .select({
            id: workspaces.id,
            code: workspaces.code,
            ten: workspaces.ten,
            slug: workspaces.slug,
            status: workspaces.status,
            is_default: workspaces.isDefault,
            created_at: workspaces.createdAt,
            updated_at: workspaces.updatedAt,
        })
        .from(workspaces)
        .where(eq(workspaces.code, code))
        .limit(1);

    return mapWorkspace(row);
};

exports.getWorkspaceByHost = async (host) => {
    const [row] = await db
        .select({
            id: workspaces.id,
            code: workspaces.code,
            ten: workspaces.ten,
            slug: workspaces.slug,
            status: workspaces.status,
            is_default: workspaces.isDefault,
            created_at: workspaces.createdAt,
            updated_at: workspaces.updatedAt,
            primary_domain: workspaceDomains.domain,
        })
        .from(workspaceDomains)
        .innerJoin(workspaces, eq(workspaceDomains.workspaceId, workspaces.id))
        .where(eq(workspaceDomains.domain, host))
        .limit(1);

    return mapWorkspace(row);
};

exports.ensureDomainAvailable = async (domain, excludeWorkspaceId = null) => {
    const conditions = [eq(workspaceDomains.domain, domain)];

    if (excludeWorkspaceId) {
        conditions.push(ne(workspaceDomains.workspaceId, Number(excludeWorkspaceId)));
    }

    const [row] = await db
        .select({ id: workspaceDomains.id })
        .from(workspaceDomains)
        .where(and(...conditions))
        .limit(1);

    return !row;
};

exports.ensureWorkspaceCodeAvailable = async (code, excludeId = null) => {
    const conditions = [eq(workspaces.code, code)];

    if (excludeId) {
        conditions.push(ne(workspaces.id, Number(excludeId)));
    }

    const [row] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(and(...conditions))
        .limit(1);

    return !row;
};

exports.ensureWorkspaceSlugAvailable = async (slug, excludeId = null) => {
    const conditions = [eq(workspaces.slug, slug)];

    if (excludeId) {
        conditions.push(ne(workspaces.id, Number(excludeId)));
    }

    const [row] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(and(...conditions))
        .limit(1);

    return !row;
};

exports.listWorkspaces = async () => {
    const rows = await db
        .select({
            id: workspaces.id,
            code: workspaces.code,
            ten: workspaces.ten,
            slug: workspaces.slug,
            status: workspaces.status,
            is_default: workspaces.isDefault,
            created_at: workspaces.createdAt,
            updated_at: workspaces.updatedAt,
            primary_domain: workspaceDomains.domain,
        })
        .from(workspaces)
        .leftJoin(workspaceDomains, and(
            eq(workspaceDomains.workspaceId, workspaces.id),
            eq(workspaceDomains.isPrimary, true)
        ))
        .orderBy(asc(workspaces.id));

    return rows.map(mapWorkspace);
};

exports.createWorkspace = async ({ code, ten, slug, domain, status = "active" }) => {
    const [workspace] = await db
        .insert(workspaces)
        .values({
            code,
            ten,
            slug,
            status,
            isDefault: false,
        })
        .returning({ id: workspaces.id });

    await db.insert(workspaceDomains).values({
        workspaceId: workspace.id,
        domain,
        isPrimary: true,
    });

    return exports.getWorkspaceById(workspace.id);
};

exports.updateWorkspace = async (id, { ten, slug, status, domain }) => {
    await db
        .update(workspaces)
        .set({
            ten,
            slug,
            status,
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, Number(id)));

    const [existingDomain] = await db
        .select({ id: workspaceDomains.id })
        .from(workspaceDomains)
        .where(and(
            eq(workspaceDomains.workspaceId, Number(id)),
            eq(workspaceDomains.isPrimary, true)
        ))
        .limit(1);

    if (existingDomain) {
        await db
            .update(workspaceDomains)
            .set({ domain })
            .where(eq(workspaceDomains.id, existingDomain.id));
    } else {
        await db.insert(workspaceDomains).values({
            workspaceId: Number(id),
            domain,
            isPrimary: true,
        });
    }

    return exports.getWorkspaceById(id);
};

exports.seedWorkspaceSetting = async (workspaceId, khoa, giaTri = null) => {
    await db.insert(workspaceSettings).values({
        workspaceId: Number(workspaceId),
        khoa,
        giaTri,
    });
};
