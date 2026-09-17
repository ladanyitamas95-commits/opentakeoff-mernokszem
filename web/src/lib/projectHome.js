// Project home — the testable core of the `/` landing screen.
//
// Two concerns, both free of DOM/React so they run under node: listing the
// project folders inside the team's "Projects" Shared Drive root (the browse
// list), and a browser-local recents list so a returning estimator can jump
// straight back into the folders they had open. Recents are per-browser by
// design — they are a convenience pointer, not shared state. Accepted
// non-goal: two tabs remembering projects at once race on the single storage
// key and the last write wins; losing one recency bump is harmless.

import { createAuditEvent, createProject, hydrateFoundationCollections } from "./foundationModel.js";

export function projectHomeFolderId() {
  // Vite inlines this at build; empty string = project home off. Guarded read
  // because under node (tests) import.meta.env is undefined.
  return (import.meta.env && import.meta.env.VITE_DRIVE_ROOT_FOLDER_ID) || "";
}

const FOLDER_MIME = "application/vnd.google-apps.folder";
export const PROJECT_HOME_FOLDER_STATES = Object.freeze({
  INITIALIZED: "initialized",
  RECOVERABLE_INCOMPLETE: "recoverable_incomplete",
  CORRUPT_UNREADABLE: "corrupt_unreadable",
});

/**
 * List the project folders inside the Projects root, name-sorted. The mimeType
 * option makes the real drive client filter SERVER-side (injected into the q
 * query). Drive shortcuts to folders won't appear — a shortcut carries its own
 * shortcut mimeType, consistent with cloudStore.listFolder.
 * @param {ReturnType<import('./google/drive.js').createDrive>} drive
 * @param {string} folderId
 * @returns {Promise<{ id: string, name: string, state: string, detail: string, message: string }[]>}
 */
export async function listProjectFolders(drive, folderId, { createStore } = {}) {
  const children = await drive.listChildren(folderId, { mimeType: FOLDER_MIME });
  const folders = children
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (typeof createStore !== "function") {
   return folders.map((folder) => ({
     ...folder,
     state: PROJECT_HOME_FOLDER_STATES.INITIALIZED,
     detail: "unchecked",
     message: "",
   }));
  }
  return Promise.all(folders.map(async (folder) => {
   const inspection = await inspectProjectFolder({ folderId: folder.id, drive, createStore });
   return {
     ...folder,
     state: inspection.state,
     detail: inspection.detail,
     message: inspection.message,
   };
  }));
}

function trimProjectName(value) {
  return String(value || "").trim();
}

function comparableProjectName(value) {
  return trimProjectName(value).toLocaleLowerCase();
}

function projectHomeError(message, code, extra = {}) {
  return Object.assign(new Error(message), { code, ...extra });
}

function isProjectEntry(entry) {
  return entry && typeof entry.id === "string" && typeof entry.name === "string";
}

function normalizeProjectEntries(entries, { refreshNameById = null } = {}) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : [])
    .filter(isProjectEntry)
    .map((entry) => {
      const replacement = refreshNameById?.get(entry.id);
      return replacement ? { id: replacement.id, name: replacement.name } : { id: entry.id, name: entry.name };
    })
    .filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
}

function findVisibleProjectByName(projectName, visibleProjects = []) {
  const wanted = comparableProjectName(projectName);
  if (!wanted) return null;
  return (Array.isArray(visibleProjects) ? visibleProjects : []).find((project) =>
    comparableProjectName(project?.name) === wanted,
  ) || null;
}

export function hasVisibleProjectNameDuplicate(projectName, visibleProjects = []) {
  return !!findVisibleProjectByName(projectName, visibleProjects);
}

/**
 * @param {{ projectName?: string, visibleProjects?: { id: string, name: string }[], loading?: boolean, loadError?: string }} [options]
 * @returns {"" | "loading" | "projects_unavailable" | "blank_name" | "duplicate_name"}
 */
export function createProjectDisabledReason({
  projectName,
  visibleProjects = [],
  loading = false,
  loadError = "",
} = {}) {
  if (loading) return "loading";
  if (trimProjectName(loadError)) return "projects_unavailable";
  if (!trimProjectName(projectName)) return "blank_name";
  if (hasVisibleProjectNameDuplicate(projectName, visibleProjects)) return "duplicate_name";
  return "";
}

/**
 * @param {{ id: string, name: string }[]} recentProjects
 * @param {{ id: string, name: string }[]} visibleProjects
 * @returns {{ id: string, name: string }[]}
 */
export function reconcileVisibleRecentProjects(recentProjects = [], visibleProjects = []) {
  const visibleById = new Map(
    normalizeProjectEntries(
      (Array.isArray(visibleProjects) ? visibleProjects : [])
        .filter((project) => project?.state === PROJECT_HOME_FOLDER_STATES.INITIALIZED),
    ).map((project) => [project.id, project]),
  );
  return normalizeProjectEntries(recentProjects, { refreshNameById: visibleById })
    .filter((entry) => visibleById.has(entry.id))
    .slice(0, RECENTS_MAX);
}

function defaultIdFactory(kind) {
  return `${kind}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function defaultNow() {
  return new Date().toISOString();
}

function asIsoTimestamp(value) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function errorMessage(e) {
  return e?.message || String(e);
}

function requireProjectActor(actor) {
  const value = trimProjectName(actor);
  if (!value) throw projectHomeError("A hitelesített felhasználó azonosítója hiányzik.", "missing_actor");
  return value;
}

function creationAuditMessage(detail) {
  if (detail === "missing_project") {
    return "A projektmappa még nincs inicializálva — az alap Projekt rekord hiányzik.";
  }
  if (detail === "missing_audit") {
    return "A projektmappa részben inicializált — a PROJECT_CREATED audit esemény hiányzik.";
  }
  if (detail === "missing_project_and_audit") {
    return "A projektmappa létrejött, de az inicializálás nem fejeződött be.";
  }
  return "A projektmappa inicializálása hiányos.";
}

function inspectProjectFolderAnnotations(folderId, input) {
  const annotations = hydrateFoundationCollections(input);
  const rawProjects = Array.isArray(annotations.projects) ? annotations.projects : [];
  const rawAuditEvents = Array.isArray(annotations.audit_events) ? annotations.audit_events : [];
  const matchingProjects = [];
  let sawForeignProject = false;

  for (const rawProject of rawProjects) {
    let project;
    try {
      project = createProject(rawProject);
    } catch {
      return {
        state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
        detail: "invalid_project",
        message: "A projekt foundation rekordja sérült.",
        annotations,
      };
    }
    if (project.id === folderId) matchingProjects.push(project);
    else sawForeignProject = true;
  }
  if (matchingProjects.length > 1) {
    return {
      state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
      detail: "duplicate_project",
      message: "A projektmappához több Project rekord tartozik.",
      annotations,
    };
  }
  if (!matchingProjects.length && sawForeignProject) {
    return {
      state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
      detail: "foreign_project",
      message: "A projektmappa mentett foundation rekordja más projektazonosítót tartalmaz.",
      annotations,
    };
  }

  const matchingAuditEvents = [];
  let sawForeignProjectCreated = false;
  for (const rawEvent of rawAuditEvents) {
    if (!rawEvent || rawEvent.action !== "PROJECT_CREATED" || rawEvent.entity_type !== "project") continue;
    let event;
    try {
      event = createAuditEvent(rawEvent);
    } catch {
      return {
        state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
        detail: "invalid_project_created_audit",
        message: "A projekt létrehozási audit eseménye sérült.",
        annotations,
      };
    }
    if (event.entity_id === folderId) matchingAuditEvents.push(event);
    else sawForeignProjectCreated = true;
  }
  if (matchingAuditEvents.length > 1) {
    return {
      state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
      detail: "duplicate_project_created_audit",
      message: "A projektmappához több PROJECT_CREATED audit esemény tartozik.",
      annotations,
    };
  }
  if (!matchingProjects.length && sawForeignProjectCreated) {
    return {
      state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
      detail: "foreign_project_created_audit",
      message: "A projektmappa létrehozási auditja más projektazonosítóra mutat.",
      annotations,
    };
  }

  const project = matchingProjects[0] || null;
  const auditEvent = matchingAuditEvents[0] || null;
  if (project && auditEvent) {
    return {
      state: PROJECT_HOME_FOLDER_STATES.INITIALIZED,
      detail: "ready",
      message: "",
      annotations,
      project,
      auditEvent,
    };
  }
  const detail = !project && !auditEvent
    ? "missing_project_and_audit"
    : !project
      ? "missing_project"
      : "missing_audit";
  return {
    state: PROJECT_HOME_FOLDER_STATES.RECOVERABLE_INCOMPLETE,
    detail,
    message: creationAuditMessage(detail),
    annotations,
    project,
    auditEvent,
  };
}

function openProjectStore(folderId, drive, createStore) {
  if (typeof createStore !== "function") {
    throw projectHomeError("A projekt foundation mentése nem elérhető.", "missing_store_factory");
  }
  const store = createStore(folderId, drive);
  if (!store || typeof store.loadAnnotations !== "function" || typeof store.saveAnnotations !== "function") {
    throw projectHomeError("A projekt tárolója nem teljes.", "invalid_store");
  }
  return store;
}

async function inspectProjectFolder({ folderId, drive, createStore }) {
  const store = openProjectStore(folderId, drive, createStore);
  try {
    const loaded = await store.loadAnnotations();
    return { ...inspectProjectFolderAnnotations(folderId, loaded), store };
  } catch (e) {
    return {
      state: PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE,
      detail: e?.name === "CloudLoadError" ? "cloud_load_error" : "load_error",
      message: `A projekt mentett adatai nem olvashatók: ${errorMessage(e)}`,
      store,
    };
  }
}

function buildProjectInitializationPayload({
  annotations,
  folder,
  rootFolderId,
  actor,
  idFactory,
  timestamp,
  auditMetadata,
}) {
  const inspection = inspectProjectFolderAnnotations(folder.id, annotations);
  if (inspection.state === PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE) {
    throw projectHomeError(inspection.message, inspection.detail);
  }
  const nextProject = inspection.project || createProject({
    id: folder.id,
    name: folder.name,
    status: "active",
    created_at: timestamp,
    updated_at: timestamp,
  });
  const nextAuditEvent = inspection.auditEvent || createAuditEvent({
    id: idFactory("audit_event"),
    actor,
    action: "PROJECT_CREATED",
    entity_type: "project",
    entity_id: folder.id,
    before_hash: null,
    after_hash: null,
    timestamp,
    correlation_id: idFactory("correlation"),
    metadata: {
      root_folder_id: rootFolderId,
      project_folder_id: folder.id,
      project_name: folder.name,
      ...auditMetadata,
    },
  });

  return {
    ...inspection.annotations,
    projects: inspection.project ? inspection.annotations.projects : [...inspection.annotations.projects, nextProject],
    audit_events: inspection.auditEvent ? inspection.annotations.audit_events : [...inspection.annotations.audit_events, nextAuditEvent],
  };
}

export function projectHomeOpenUrl(projectId) {
  return `/?project=${encodeURIComponent(projectId)}`;
}

/**
 * @param {{
 *   drive: { createFolder(parentId: string, name: string): Promise<{ id: string, name?: string }> },
 *   rootFolderId: string,
 *   projectName: string,
 *   folderId?: string,
 *   visibleProjects?: { id: string, name: string }[],
 *   actor?: string,
 *   createStore: Function,
 *   idFactory?: (kind: string) => string,
 *   now?: () => string | Date,
 *   auditMetadata?: Record<string, unknown>,
 * }} options
 */
export async function createProjectWithFoundation({
  drive,
  rootFolderId,
  projectName,
 folderId = "",
 visibleProjects = [],
 actor,
 createStore,
 idFactory = defaultIdFactory,
 now = defaultNow,
 auditMetadata = {},
}) {
 const name = trimProjectName(projectName);
 const existingFolderId = trimProjectName(folderId);
 const resolvedActor = requireProjectActor(actor);
 if (!name) throw new Error("A projekt neve nem lehet üres.");
 if (!trimProjectName(rootFolderId)) throw new Error("A Projektek gyökérmappa nincs beállítva.");
 const duplicate = findVisibleProjectByName(name, visibleProjects);
 if (duplicate && duplicate.id !== existingFolderId) {
   throw new Error("Ilyen nevű projekt már szerepel a listában.");
 }
 if (!drive || typeof drive.createFolder !== "function") {
   throw new Error("A Drive projektmappa létrehozása nem elérhető.");
 }
 const folder = existingFolderId
   ? { id: existingFolderId, name: duplicate?.name || name }
   : await drive.createFolder(rootFolderId, name);
 const timestamp = asIsoTimestamp(now());
 const store = openProjectStore(folder.id, drive, createStore);

 try {
   const existingAnnotations = await store.loadAnnotations();
   const payload = buildProjectInitializationPayload({
     annotations: existingAnnotations,
     folder,
     rootFolderId,
     actor: resolvedActor,
     idFactory,
     timestamp,
     auditMetadata,
   });
   await store.saveAnnotations(payload);
 } catch (e) {
   if (!existingFolderId) {
     throw projectHomeError(
       `A projektmappa létrejött, de az inicializálás nem sikerült: ${errorMessage(e)}`,
       "project_initialization_failed",
       { folder },
     );
   }
   throw new Error(`A projektmappa inicializálása nem sikerült: ${errorMessage(e)}`);
 }

 return { id: folder.id, name: folder.name };
}

/**
 * @param {{ folderId: string, projectName: string, drive: any, createStore: Function }} options
 */
export async function verifyProjectFolderBeforeOpen({ folderId, projectName, drive, createStore }) {
 const inspection = await inspectProjectFolder({
   folderId: trimProjectName(folderId),
   drive,
   createStore,
 });
 if (inspection.state !== PROJECT_HOME_FOLDER_STATES.INITIALIZED) {
   throw new Error(inspection.message || `A projekt nem nyitható meg: ${projectName}`);
 }
 return inspection.project;
}

/**
 * @param {{ folderId: string, projectName: string, drive: any, createStore: Function, remember(project: { id: string, name: string }): void, navigate(url: string): void }} options
 */
export async function openProjectWithVerification({
 folderId,
 projectName,
 drive,
 createStore,
 remember,
 navigate,
}) {
 await verifyProjectFolderBeforeOpen({ folderId, projectName, drive, createStore });
 const project = { id: trimProjectName(folderId), name: projectName };
 remember(project);
 navigate(projectHomeOpenUrl(project.id));
 return project;
}

/**
 * @param {Parameters<typeof createProjectWithFoundation>[0] & {
 *   remember(project: { id: string, name: string }): void,
 *   navigate(url: string): void,
 * }} options
 */
export async function createProjectWithFoundationAndOpen(options) {
  const project = await createProjectWithFoundation(options);
  return openProjectWithVerification({
    folderId: project.id,
    projectName: project.name,
    drive: options.drive,
    createStore: options.createStore,
    remember: options.remember,
    navigate: options.navigate,
  });
}

// The storage to hand createRecents in a browser. Not just a null-check:
// with site data blocked, ACCESSING window.localStorage throws a
// SecurityError — before any getItem/setItem createRecents could guard.
// Degrade to an inert storage so the home screen still renders.
export function browserStorage() {
  try {
    if (globalThis.localStorage) return globalThis.localStorage;
  } catch { /* blocked site data — fall through */ }
  return { getItem: () => null, setItem: () => {} };
}

const RECENTS_KEY = "opentakeoff_recent_projects";
const RECENTS_MAX = 12;

/**
 * Browser-local recently-opened projects over an injected Web-Storage-like
 * object (prod passes localStorage). Entries are plain { id, name }.
 * @param {{ getItem(key: string): string | null, setItem(key: string, value: string): void }} storage
 */
export function createRecents(storage) {
  function persist(entries) {
    try {
      storage.setItem(RECENTS_KEY, JSON.stringify(normalizeProjectEntries(entries).slice(0, RECENTS_MAX)));
    } catch { /* noop */ }
  }

  return {
    /** @returns {{ id: string, name: string }[]} most-recent-first */
    list() {
      let parsed;
      try {
        parsed = JSON.parse(storage.getItem(RECENTS_KEY));
      } catch {
        return [];   // corrupt JSON, or getItem itself threw — treat as empty
      }
      if (!Array.isArray(parsed)) return [];
      // Only well-formed { id, name } entries survive — anything else under our
      // key (older shapes, hand edits) is dropped rather than crashing the UI.
      return normalizeProjectEntries(parsed);
    },
    /** @param {{ id: string, name: string }} entry */
    remember({ id, name }) {
      // Move-to-front on a repeat visit; the fresh name wins (folder renames).
      const rest = this.list().filter((e) => e.id !== id);
      const next = [{ id, name }, ...rest].slice(0, RECENTS_MAX);
      // Best-effort: setItem can throw (Safari private mode, quota) and losing
      // a recency bump must never break opening the project.
      persist(next);
    },
    /** @param {{ id: string, name: string }[]} entries */
    replace(entries) {
      persist(entries);
    },
  };
}
