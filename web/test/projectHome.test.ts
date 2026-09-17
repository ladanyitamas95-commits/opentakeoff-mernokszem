// Project-home core: the Projects-root folder listing and the browser-local
// recents list, tested with fake collaborators (a plain-object drive, a
// plain-object Web Storage) — no network, no DOM, no real localStorage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createCloudStore } from "../src/lib/cloudStore.js";
import {
  browserStorage,
  createProjectDisabledReason,
  createProjectWithFoundation,
  createProjectWithFoundationAndOpen,
  createRecents,
  hasVisibleProjectNameDuplicate,
  listProjectFolders,
  projectHomeFolderId,
  projectHomeOpenUrl,
  reconcileVisibleRecentProjects,
} from "../src/lib/projectHome.js";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const JSON_MIME = "application/json";
const NOW = "2026-09-14T12:00:00.000Z";

test("projectHomeFolderId is empty (feature off) when import.meta.env is absent", () => {
  // Under node, import.meta.env is undefined — the guarded read must not throw.
  assert.equal(projectHomeFolderId(), "");
});

test("listProjectFolders asks Drive for folders only (server-side filter) and returns name-sorted {id, name}", async () => {
  // Recording fake drive: the mimeType option MUST reach listChildren — the
  // real client injects it into the q query, so filtering happens server-side.
  const calls: any[] = [];
  const drive = {
    async listChildren(folderId: string, opts: any) {
      calls.push([folderId, opts]);
      return [
        { id: "f2", name: "Zephyr Tower", mimeType: FOLDER_MIME, modifiedTime: "t" },
        { id: "f1", name: "Acme HQ", mimeType: FOLDER_MIME, modifiedTime: "t" },
      ];
    },
  };
  const folders = await listProjectFolders(drive as any, "root123");
  assert.deepEqual(calls, [["root123", { mimeType: FOLDER_MIME }]]);
  // sorted by name, and stripped to just {id, name}
  assert.deepEqual(folders, [
    { id: "f1", name: "Acme HQ" },
    { id: "f2", name: "Zephyr Tower" },
  ]);
});

function createFolderDrive({ fail = false } = {}) {
  const calls: any[] = [];
  return {
    calls,
    async createFolder(parentId: string, name: string) {
      calls.push([parentId, name]);
      if (fail) throw new Error("create folder boom");
      return { id: "folder-created", name };
    },
  };
}

function recordingCreateStore(saves: any[], { fail = false } = {}) {
  return (folderId: string, drive: any) => ({
    async saveAnnotations(payload: any) {
      if (fail) throw new Error("save annotations boom");
      saves.push({ folderId, drive, payload });
    },
  });
}

function idFactory() {
  let seq = 0;
  return (kind: string) => `${kind}-${++seq}`;
}

test("hasVisibleProjectNameDuplicate matches trimmed visible folder names before Drive calls", () => {
  const visible = [{ id: "p1", name: " Mintaprojekt " }];
  assert.equal(hasVisibleProjectNameDuplicate("mintaprojekt", visible), true);
  assert.equal(hasVisibleProjectNameDuplicate(" Másik projekt ", visible), false);
  assert.equal(hasVisibleProjectNameDuplicate(" ", visible), false);
});

test("createProjectDisabledReason blocks creation until the visible project list is authoritative", () => {
  assert.equal(createProjectDisabledReason({ projectName: "Minta", loading: true }), "loading");
  assert.equal(createProjectDisabledReason({ projectName: "Minta", loadError: "boom" }), "projects_unavailable");
  assert.equal(createProjectDisabledReason({ projectName: "   " }), "blank_name");
  assert.equal(
    createProjectDisabledReason({
      projectName: " Minta projekt ",
      visibleProjects: [{ id: "existing", name: "Minta Projekt" }],
    }),
    "duplicate_name",
  );
  assert.equal(
    createProjectDisabledReason({
      projectName: "Minta projekt",
      visibleProjects: [{ id: "existing", name: "Másik projekt" }],
    }),
    "",
  );
});

test("createProjectWithFoundation rejects an empty project name before Drive or annotation save", async () => {
  const drive = createFolderDrive();
  const saves: any[] = [];

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: "   ",
      createStore: recordingCreateStore(saves) as any,
    }),
    /projekt neve nem lehet üres/i,
  );

  assert.deepEqual(drive.calls, []);
  assert.deepEqual(saves, []);
});

test("createProjectWithFoundation rejects an obvious duplicate visible name before Drive or annotation save", async () => {
  const drive = createFolderDrive();
  const saves: any[] = [];

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: " minta projekt ",
      visibleProjects: [{ id: "existing", name: "Minta Projekt" }],
      createStore: recordingCreateStore(saves) as any,
    }),
    /már szerepel/,
  );

  assert.deepEqual(drive.calls, []);
  assert.deepEqual(saves, []);
});

test("createProjectWithFoundation creates the Drive folder and saves one sanitized foundation Project/AuditEvent payload", async () => {
  const drive = createFolderDrive();
  const saves: any[] = [];

  const created = await createProjectWithFoundation({
    drive: drive as any,
    rootFolderId: "projects-root",
    projectName: " Minta projekt ",
    visibleProjects: [{ id: "other", name: "Másik projekt" }],
    actor: "pilot@example.com",
    createStore: recordingCreateStore(saves) as any,
    idFactory: idFactory(),
    now: () => NOW,
    auditMetadata: {
      safe_note: "retained",
      accessToken: "drop",
      nested: { providerError: "drop", kept: true },
    },
  });

  assert.deepEqual(created, { id: "folder-created", name: "Minta projekt" });
  assert.deepEqual(drive.calls, [["projects-root", "Minta projekt"]]);
  assert.equal(saves.length, 1);
  assert.equal(saves[0].folderId, "folder-created");
  const payload = saves[0].payload;
  assert.equal(payload.projects.length, 1);
  assert.equal(payload.projects[0].id, "folder-created");
  assert.equal(payload.projects[0].name, "Minta projekt");
  assert.equal(payload.projects[0].status, "active");
  assert.equal(payload.projects[0].created_at, NOW);
  assert.deepEqual(payload.documents, []);
  assert.deepEqual(payload.document_versions, []);
  assert.deepEqual(payload.review_items, []);
  assert.equal(payload.audit_events.length, 1);
  assert.equal(payload.audit_events[0].action, "PROJECT_CREATED");
  assert.equal(payload.audit_events[0].actor, "pilot@example.com");
  assert.equal(payload.audit_events[0].entity_type, "project");
  assert.equal(payload.audit_events[0].entity_id, "folder-created");
  assert.equal(payload.audit_events[0].timestamp, NOW);
  assert.equal(payload.audit_events[0].metadata.safe_note, "retained");
  assert.equal(payload.audit_events[0].metadata.nested.kept, true);
  assert.equal("accessToken" in payload.audit_events[0].metadata, false);
  assert.equal("providerError" in payload.audit_events[0].metadata.nested, false);
});

function cloudDrive() {
  const byId = new Map<string, any>();
  let seq = 0;
  const newId = () => `id_${++seq}`;
  return {
    _byId: byId,
    async findChild(folderId: string, name: string) {
      for (const rec of byId.values()) {
        if (rec.parent === folderId && rec.name === name) {
          return { id: rec.id, name: rec.name, mimeType: rec.mimeType, modifiedTime: rec.modifiedTime ?? "t" };
        }
      }
      return null;
    },
    async createFolder(parentId: string, name: string) {
      const id = newId();
      byId.set(id, { id, parent: parentId, name, mimeType: FOLDER_MIME });
      return { id, name };
    },
    async getJson(fileId: string) {
      const rec = byId.get(fileId);
      return JSON.parse(new TextDecoder().decode(rec.bytes));
    },
    async putJson({ folderId, name, data, existingId }: any) {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      if (existingId) {
        const rec = byId.get(existingId);
        rec.bytes = bytes;
        rec.mimeType = JSON_MIME;
        return { id: existingId };
      }
      const id = newId();
      byId.set(id, { id, parent: folderId, name, mimeType: JSON_MIME, bytes });
      return { id };
    },
  };
}

test("createProjectWithFoundation can seed through the real createCloudStore annotation seam", async () => {
  const drive = cloudDrive();

  const created = await createProjectWithFoundation({
    drive: drive as any,
    rootFolderId: "projects-root",
    projectName: "Felülvizsgálati projekt",
    actor: "pilot@example.com",
    createStore: createCloudStore,
    idFactory: idFactory(),
    now: () => NOW,
    auditMetadata: { api_key: "drop", safe: "kept" },
  });

  assert.deepEqual(created, { id: "id_1", name: "Felülvizsgálati projekt" });
  const sidecar = [...drive._byId.values()].find((rec) => rec.parent === created.id && rec.name === ".opentakeoff");
  assert.ok(sidecar);
  const annotations = [...drive._byId.values()].find((rec) => rec.parent === sidecar.id && rec.name === "annotations.json");
  assert.ok(annotations);
  const stored = JSON.parse(new TextDecoder().decode(annotations.bytes));
  assert.equal(stored.projects.length, 1);
  assert.equal(stored.projects[0].id, created.id);
  assert.deepEqual(stored.documents, []);
  assert.deepEqual(stored.document_versions, []);
  assert.deepEqual(stored.review_items, []);
  assert.equal(stored.audit_events.length, 1);
  assert.equal(stored.audit_events[0].action, "PROJECT_CREATED");
  assert.equal(stored.audit_events[0].metadata.safe, "kept");
  assert.equal("api_key" in stored.audit_events[0].metadata, false);
});

test("createProjectWithFoundation does not save annotations when Drive folder creation fails", async () => {
  const drive = createFolderDrive({ fail: true });
  const saves: any[] = [];

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: "Minta projekt",
      createStore: recordingCreateStore(saves) as any,
    }),
    /create folder boom/,
  );

  assert.deepEqual(drive.calls, [["root", "Minta projekt"]]);
  assert.deepEqual(saves, []);
});

test("createProjectWithFoundationAndOpen remembers and navigates only after foundation save succeeds", async () => {
  const remembered: any[] = [];
  const navigated: string[] = [];

  const project = await createProjectWithFoundationAndOpen({
    drive: createFolderDrive() as any,
    rootFolderId: "root",
    projectName: "Minta projekt",
    createStore: recordingCreateStore([]) as any,
    idFactory: idFactory(),
    now: () => NOW,
    remember: (entry: any) => remembered.push(entry),
    navigate: (url: string) => navigated.push(url),
  });

  assert.deepEqual(project, { id: "folder-created", name: "Minta projekt" });
  assert.deepEqual(remembered, [project]);
  assert.deepEqual(navigated, ["/?project=folder-created"]);
  assert.equal(projectHomeOpenUrl("folder id"), "/?project=folder%20id");
});

test("createProjectWithFoundationAndOpen does not remember or navigate when foundation save fails", async () => {
  const remembered: any[] = [];
  const navigated: string[] = [];

  await assert.rejects(
    createProjectWithFoundationAndOpen({
      drive: createFolderDrive() as any,
      rootFolderId: "root",
      projectName: "Minta projekt",
      createStore: recordingCreateStore([], { fail: true }) as any,
      idFactory: idFactory(),
      now: () => NOW,
      remember: (entry: any) => remembered.push(entry),
      navigate: (url: string) => navigated.push(url),
    }),
    /inicializálás nem sikerült/,
  );

  assert.deepEqual(remembered, []);
  assert.deepEqual(navigated, []);
});

test("reconcileVisibleRecentProjects keeps only currently visible projects and refreshes their current names", () => {
  const recent = [
    { id: "p2", name: "Régi név" },
    { id: "gone", name: "Nem látható" },
    { id: "p2", name: "dupe" },
    { id: "p1", name: "Másik régi név" },
  ];
  const visible = [
    { id: "p1", name: "Alpha projekt" },
    { id: "p2", name: "Béta projekt" },
  ];
  assert.deepEqual(reconcileVisibleRecentProjects(recent, visible), [
    { id: "p2", name: "Béta projekt" },
    { id: "p1", name: "Alpha projekt" },
  ]);
});

// Web-Storage-like fake over a Map — just getItem/setItem, which is all the
// recents store may use (prod passes window.localStorage).
function fakeStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    _map: map,
    getItem(key: string) { return map.has(key) ? map.get(key)! : null; },
    setItem(key: string, value: string) { map.set(key, String(value)); },
  };
}

test("recents: fresh storage lists empty", () => {
  const recents = createRecents(fakeStorage());
  assert.deepEqual(recents.list(), []);
});

test("recents: remember persists the entry under the shared key and list returns it", () => {
  const storage = fakeStorage();
  createRecents(storage).remember({ id: "p1", name: "Acme HQ" });
  // a NEW instance over the same storage sees it — proof it went through
  // storage (under the stable key) and not module memory
  assert.deepEqual(createRecents(storage).list(), [{ id: "p1", name: "Acme HQ" }]);
  assert.deepEqual(JSON.parse(storage._map.get("opentakeoff_recent_projects")!), [{ id: "p1", name: "Acme HQ" }]);
});

test("recents: replace persists a reconciled visible subset", () => {
  const storage = fakeStorage();
  createRecents(storage).replace([
    { id: "p2", name: "Second" },
    { id: "p2", name: "Duplicate" },
    { id: "p1", name: "First" },
  ] as any);
  assert.deepEqual(createRecents(storage).list(), [
    { id: "p2", name: "Second" },
    { id: "p1", name: "First" },
  ]);
});

test("recents: list is most-recent-first", () => {
  const recents = createRecents(fakeStorage());
  recents.remember({ id: "p1", name: "First" });
  recents.remember({ id: "p2", name: "Second" });
  recents.remember({ id: "p3", name: "Third" });
  assert.deepEqual(recents.list().map((r) => r.id), ["p3", "p2", "p1"]);
});

test("recents: re-remembering an id moves it to the front (no duplicate) and takes the new name", () => {
  const recents = createRecents(fakeStorage());
  recents.remember({ id: "p1", name: "Old Name" });
  recents.remember({ id: "p2", name: "Other" });
  recents.remember({ id: "p1", name: "Renamed" }); // folder renamed in Drive
  assert.deepEqual(recents.list(), [
    { id: "p1", name: "Renamed" },
    { id: "p2", name: "Other" },
  ]);
});

test("recents: capped at 12, oldest dropped", () => {
  const recents = createRecents(fakeStorage());
  for (let i = 1; i <= 13; i++) recents.remember({ id: `p${i}`, name: `Project ${i}` });
  const ids = recents.list().map((r) => r.id);
  assert.equal(ids.length, 12);
  assert.equal(ids[0], "p13");        // newest kept, at the front
  assert.ok(!ids.includes("p1"));     // oldest fell off
});

test("recents: corrupt JSON reads as empty and the next remember overwrites it cleanly", () => {
  const storage = fakeStorage({ opentakeoff_recent_projects: "{not json" });
  const recents = createRecents(storage);
  assert.deepEqual(recents.list(), []);
  recents.remember({ id: "p1", name: "Fresh" });
  assert.deepEqual(recents.list(), [{ id: "p1", name: "Fresh" }]);
});

test("recents: storage that throws (Safari private mode) — list is [] and remember doesn't throw", () => {
  const recents = createRecents({
    getItem() { throw new Error("SecurityError"); },
    setItem() { throw new Error("QuotaExceededError"); },
  });
  assert.deepEqual(recents.list(), []);
  recents.remember({ id: "p1", name: "Acme HQ" }); // must not throw
  assert.deepEqual(recents.list(), []);            // best-effort: nothing stuck
});

test("recents: malformed entries in the stored array are filtered out of list", () => {
  const stored = [
    { id: "p1", name: "Good" },
    { name: "no id" },                 // missing id
    { id: 7, name: "numeric id" },     // non-string id
    { id: "p2" },                      // missing name
    { id: "p3", name: 3 },             // non-string name
    null,                              // not even an object
    "junk",
    { id: "p1", name: "duplicate" },
    { id: "p4", name: "Also good" },
  ];
  const recents = createRecents(fakeStorage({ opentakeoff_recent_projects: JSON.stringify(stored) }));
  assert.deepEqual(recents.list(), [
    { id: "p1", name: "Good" },
    { id: "p4", name: "Also good" },
  ]);
  // a top-level non-array (someone else's data under our key) reads as empty
  assert.deepEqual(createRecents(fakeStorage({ opentakeoff_recent_projects: '{"id":"x"}' })).list(), []);
});

test("browserStorage: without a usable localStorage it degrades to an inert storage — recents list empty, remember a no-op", () => {
  // Under node there is no window.localStorage; in a browser with site data
  // blocked, even ACCESSING window.localStorage throws. Both must degrade to
  // the same inert storage instead of crashing the home screen's render.
  const storage = browserStorage();
  const recents = createRecents(storage);
  assert.deepEqual(recents.list(), []);
  assert.doesNotThrow(() => recents.remember({ id: "p1", name: "Job" }));
  assert.deepEqual(recents.list(), []);
});
