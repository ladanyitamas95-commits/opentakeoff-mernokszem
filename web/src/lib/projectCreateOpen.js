import { createAuditEvent, createProject } from "./foundationModel.js";
import { mintUuid } from "./provenance.js";

export const PROJECT_WORKSPACE_PATH = "/app/projects";

function requiredProjectName(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A projekt neve kötelező.");
  }
  return value.trim();
}

export function auditActorFromUser(user) {
  const actor = typeof user?.email === "string" && user.email.trim()
    ? user.email.trim()
    : typeof user?.sub === "string" && user.sub.trim()
      ? user.sub.trim()
      : "";
  if (!actor) throw new Error("A hitelesített pilot felhasználó azonosítója hiányzik.");
  return actor;
}

function projectPath(id) {
  return `${PROJECT_WORKSPACE_PATH}/${encodeURIComponent(id)}`;
}

/**
 * Creates the one foundation Project record for an already-created project
 * folder. The existing annotations payload remains the persistence boundary.
 */
export async function persistProjectRecord({ store, id, name, actor, now = () => new Date().toISOString(), mintId = mintUuid }) {
  const projectName = requiredProjectName(name);
  const auditActor = auditActorFromUser(actor);
  const current = await store.loadAnnotations();
  const timestamp = now();
  const project = createProject({ id, name: projectName, created_at: timestamp });
  const auditEvent = createAuditEvent({
    id: `audit-${mintId()}`,
    actor: auditActor,
    action: "PROJECT_CREATED",
    entity_type: "project",
    entity_id: project.id,
    timestamp,
    correlation_id: `project-create-${mintId()}`,
  });
  const projects = Array.isArray(current.projects) ? current.projects : [];
  if (projects.some((item) => item?.id === project.id)) {
    throw new Error("Ez a projekt már létezik.");
  }
  const auditEvents = Array.isArray(current.audit_events) ? current.audit_events : [];
  await store.saveAnnotations({
    ...current,
    projects: [...projects, project],
    audit_events: [...auditEvents, auditEvent],
  });
  return project;
}

/**
 * Create a Drive project folder, then persist its foundation record through the
 * existing cloud annotations store. A failed persistence is deliberately
 * surfaced to the caller; it is never hidden behind a partial in-memory row.
 */
export async function createFoundationProject({ drive, rootFolderId, createStore, name, actor, now, mintId }) {
  const projectName = requiredProjectName(name);
  const folder = await drive.createFolder(rootFolderId, projectName);
  const project = await persistProjectRecord({
    store: createStore(folder.id), id: folder.id, name: projectName, actor, now, mintId,
  });
  return { folder, project, path: projectPath(project.id) };
}

/**
 * Read foundation Project records from the existing project-scoped annotation
 * stores. Folder names are only discovery handles; rendered data is always the
 * persisted Project record, so no second Project model is introduced.
 */
export async function listFoundationProjects({ folders, createStore }) {
  const entries = await Promise.all((folders || []).map(async (folder) => {
    const annotations = await createStore(folder.id).loadAnnotations();
    const project = (annotations.projects || []).find((item) => item?.id === folder.id);
    return project || null;
  }));
  return entries
    .filter(Boolean)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function openFoundationProject(project, navigate) {
  const path = projectPath(project.id);
  navigate(path);
  return path;
}
