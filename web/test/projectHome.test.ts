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
  openProjectWithVerification,
  PROJECT_HOME_FOLDER_STATES,
  projectHomeFolderId,
  projectHomeOpenUrl,
  reconcileVisibleRecentProjects,
  verifyProjectFolderBeforeOpen,
} from "../src/lib/projectHome.js";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const JSON_MIME = "application/json";
const NOW = "2026-09-14T12:00:00.000Z";

test("projectHomeFolderId is empty (feature off) when import.meta.env is absent", () => {
  assert.equal(projectHomeFolderId(), "");
});

function foundationProject(folderId: string, name = "Projekt") {
  return {
    id: folderId,
    name,
    status: "active",
    created_at: NOW,
    updated_at: NOW,
  };
}

function foundationAudit(folderId: string, actor = "pilot@example.com") {
  return {
    id: `audit-${folderId}`,
    actor,
    action: "PROJECT_CREATED",
    entity_type: "project",
    entity_id: folderId,
    before_hash: null,
    after_hash: null,
    timestamp: NOW,
    correlation_id: `corr-${folderId}`,
  };
}

function createFolderDrive({ ids = ["folder-created"], fail = false } = {}) {
  const calls: any[] = [];
  let idx = 0;
  return {
    calls,
    async createFolder(parentId: string, name: string) {
      calls.push([parentId, name]);
      if (fail) throw new Error("create folder boom");
      const id = ids[Math.min(idx, ids.length - 1)];
      idx += 1;
      return { id, name };
    },
  };
}

function createStoreHarness({
  initialByFolder = {},
  loadErrors = {},
  failSaveCounts = {},
  persistOnSave = true,
}: any = {}) {
  const state = new Map(
    Object.entries(initialByFolder).map(([folderId, payload]) => [folderId, structuredClone(payload)]),
  );
  const saves: any[] = [];
  const loads: any[] = [];
  const saveCalls = new Map<string, number>();

  return {
    state,
    saves,
    loads,
    createStore(folderId: string, drive: any) {
      return {
        async loadAnnotations() {
          loads.push(folderId);
          const err = loadErrors[folderId];
          if (err) throw err;
          return structuredClone(state.get(folderId) ?? {});
        },
        async saveAnnotations(payload: any) {
          const count = (saveCalls.get(folderId) || 0) + 1;
          saveCalls.set(folderId, count);
          if (count <= (failSaveCounts[folderId] || 0)) throw new Error("save annotations boom");
          const cloned = structuredClone(payload);
          saves.push({ folderId, drive, payload: cloned });
          if (persistOnSave) state.set(folderId, cloned);
        },
      };
    },
  };
}

function cloudDrive() {
  const byId = new Map<string, any>();
  let seq = 0;
  const newId = () => `id_${++seq}`;
  return {
    _byId: byId,
    async listChildren(folderId: string, opts: any = {}) {
      return [...byId.values()]
        .filter((rec) => rec.parent === folderId)
        .filter((rec) => !opts.mimeType || rec.mimeType === opts.mimeType)
        .map((rec) => ({
          id: rec.id,
          name: rec.name,
          mimeType: rec.mimeType,
          modifiedTime: rec.modifiedTime ?? "t",
          size: rec.size,
        }));
    },
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
      if (!rec || rec.failRead) throw new Error(rec?.failRead || "missing");
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

test("listProjectFolders asks Drive for folders only and classifies initialized, incomplete and corrupt project folders", async () => {
  const harness = createStoreHarness({
    initialByFolder: {
      f1: { projects: [foundationProject("f1", "Acme HQ")], audit_events: [foundationAudit("f1")] },
      f2: { projects: [foundationProject("f2", "Beta")], audit_events: [] },
      f4: { projects: [foundationProject("other", "Foreign")], audit_events: [] },
    },
    loadErrors: {
      f3: Object.assign(new Error("bad json"), { name: "CloudLoadError" }),
    },
  });
  const calls: any[] = [];
  const drive = {
    async listChildren(folderId: string, opts: any) {
      calls.push([folderId, opts]);
      return [
        { id: "f3", name: "Corrupt", mimeType: FOLDER_MIME },
        { id: "f2", name: "Incomplete", mimeType: FOLDER_MIME },
        { id: "f1", name: "Acme HQ", mimeType: FOLDER_MIME },
        { id: "f4", name: "Foreign", mimeType: FOLDER_MIME },
      ];
    },
  };

  const folders = await listProjectFolders(drive as any, "root123", { createStore: harness.createStore as any });

  assert.deepEqual(calls, [["root123", { mimeType: FOLDER_MIME }]]);
  assert.deepEqual(folders.map((folder) => [folder.id, folder.state]), [
    ["f1", PROJECT_HOME_FOLDER_STATES.INITIALIZED],
    ["f3", PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE],
    ["f4", PROJECT_HOME_FOLDER_STATES.CORRUPT_UNREADABLE],
    ["f2", PROJECT_HOME_FOLDER_STATES.RECOVERABLE_INCOMPLETE],
  ]);
  assert.match(folders.find((folder) => folder.id === "f2")!.message, /PROJECT_CREATED/i);
  assert.match(folders.find((folder) => folder.id === "f3")!.message, /nem olvashatók/i);
  assert.match(folders.find((folder) => folder.id === "f4")!.message, /más projektazonosítót/i);
});

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

test("createProjectWithFoundation rejects a missing authenticated actor before Drive or annotation writes", async () => {
  const drive = createFolderDrive();
  const harness = createStoreHarness();

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: "Minta projekt",
      actor: "",
      createStore: harness.createStore as any,
    }),
    /hitelesített felhasználó azonosítója hiányzik/i,
  );

  assert.deepEqual(drive.calls, []);
  assert.deepEqual(harness.saves, []);
});

test("createProjectWithFoundation rejects an empty project name before Drive or annotation save", async () => {
  const drive = createFolderDrive();
  const harness = createStoreHarness();

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: "   ",
      actor: "pilot@example.com",
      createStore: harness.createStore as any,
    }),
    /projekt neve nem lehet üres/i,
  );

  assert.deepEqual(drive.calls, []);
  assert.deepEqual(harness.saves, []);
});

test("createProjectWithFoundation rejects an obvious duplicate visible name before Drive or annotation save", async () => {
  const drive = createFolderDrive();
  const harness = createStoreHarness();

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: " minta projekt ",
      visibleProjects: [{ id: "existing", name: "Minta Projekt" }],
      actor: "pilot@example.com",
      createStore: harness.createStore as any,
    }),
    /már szerepel/,
  );

  assert.deepEqual(drive.calls, []);
  assert.deepEqual(harness.saves, []);
});

test("createProjectWithFoundation preserves unrelated existing annotations and appends exactly one Project and PROJECT_CREATED event", async () => {
  const drive = createFolderDrive();
  const harness = createStoreHarness({
    initialByFolder: {
      "folder-existing": {
        schema: "kept",
        conditions: [{ id: "cond-1" }],
        shapes: [{ id: "shape-1" }],
        custom_safe: { keep: true },
        projects: [],
        audit_events: [],
      },
    },
  });

  const created = await createProjectWithFoundation({
    drive: drive as any,
    rootFolderId: "projects-root",
    folderId: "folder-existing",
    projectName: " Minta projekt ",
    visibleProjects: [{ id: "folder-existing", name: "Minta projekt" }],
    actor: "pilot@example.com",
    createStore: harness.createStore as any,
    idFactory: ((seq = 0) => (kind: string) => `${kind}-${++seq}`)(),
    now: () => NOW,
    auditMetadata: {
      safe_note: "retained",
      accessToken: "drop",
      nested: { providerError: "drop", kept: true },
    },
  });

  assert.deepEqual(created, { id: "folder-existing", name: "Minta projekt" });
  assert.deepEqual(drive.calls, []);
  assert.equal(harness.saves.length, 1);
  const payload: any = harness.state.get("folder-existing");
  assert.deepEqual(payload.conditions, [{ id: "cond-1" }]);
  assert.deepEqual(payload.shapes, [{ id: "shape-1" }]);
  assert.deepEqual(payload.custom_safe, { keep: true });
  assert.equal(payload.projects.length, 1);
  assert.equal(payload.projects[0].id, "folder-existing");
  assert.equal(payload.audit_events.length, 1);
  assert.equal(payload.audit_events[0].action, "PROJECT_CREATED");
  assert.equal(payload.audit_events[0].actor, "pilot@example.com");
  assert.equal(payload.audit_events[0].metadata.safe_note, "retained");
  assert.equal(payload.audit_events[0].metadata.nested.kept, true);
  assert.equal("accessToken" in payload.audit_events[0].metadata, false);
  assert.equal("providerError" in payload.audit_events[0].metadata.nested, false);
});

test("createProjectWithFoundation retries initialization on the same folder after a partial failure without creating a second folder, project or audit event", async () => {
  const drive = createFolderDrive({ ids: ["folder-1"] });
  const harness = createStoreHarness({
    initialByFolder: {
      "folder-1": {},
    },
    failSaveCounts: {
      "folder-1": 1,
    },
  });
  const ids = ((seq = 0) => (kind: string) => `${kind}-${++seq}`)();

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "projects-root",
      projectName: "Minta projekt",
      actor: "pilot@example.com",
      createStore: harness.createStore as any,
      idFactory: ids,
      now: () => NOW,
    }),
    /létrejött, de az inicializálás nem sikerült/i,
  );

  const created = await createProjectWithFoundation({
    drive: drive as any,
    rootFolderId: "projects-root",
    folderId: "folder-1",
    projectName: "Minta projekt",
    visibleProjects: [{ id: "folder-1", name: "Minta projekt" }],
    actor: "pilot@example.com",
    createStore: harness.createStore as any,
    idFactory: ids,
    now: () => NOW,
  });

  assert.deepEqual(created, { id: "folder-1", name: "Minta projekt" });
  assert.deepEqual(drive.calls, [["projects-root", "Minta projekt"]]);
  const payload: any = harness.state.get("folder-1");
  assert.equal(payload.projects.length, 1);
  assert.equal(payload.projects[0].id, "folder-1");
  assert.equal(payload.audit_events.length, 1);
  assert.equal(payload.audit_events[0].entity_id, "folder-1");
});

test("createProjectWithFoundation can recover an existing folder through the real createCloudStore seam", async () => {
  const drive = cloudDrive();
  const root = await drive.createFolder("workspace", "Projects");
  const existing = await drive.createFolder(root.id, "Felülvizsgálati projekt");
  const sidecar = await drive.createFolder(existing.id, ".opentakeoff");
  await drive.putJson({
    folderId: sidecar.id,
    name: "annotations.json",
    data: {
      schema: "legacy",
      conditions: [{ id: "cond-1" }],
      custom_safe: { keep: true },
    },
    existingId: null,
  });

  const created = await createProjectWithFoundation({
    drive: drive as any,
    rootFolderId: root.id,
    folderId: existing.id,
    projectName: "Felülvizsgálati projekt",
    visibleProjects: [{ id: existing.id, name: "Felülvizsgálati projekt" }],
    actor: "pilot@example.com",
    createStore: createCloudStore,
    idFactory: ((seq = 0) => (kind: string) => `${kind}-${++seq}`)(),
    now: () => NOW,
    auditMetadata: { api_key: "drop", safe: "kept" },
  });

  assert.deepEqual(created, { id: existing.id, name: "Felülvizsgálati projekt" });
  const annotations = await drive.findChild(sidecar.id, "annotations.json");
  assert.ok(annotations);
  const stored = await drive.getJson(annotations.id);
  assert.deepEqual(stored.conditions, [{ id: "cond-1" }]);
  assert.deepEqual(stored.custom_safe, { keep: true });
  assert.equal(stored.projects.length, 1);
  assert.equal(stored.projects[0].id, existing.id);
  assert.equal(stored.audit_events.length, 1);
  assert.equal(stored.audit_events[0].action, "PROJECT_CREATED");
  assert.equal(stored.audit_events[0].metadata.safe, "kept");
  assert.equal("api_key" in stored.audit_events[0].metadata, false);
});

test("createProjectWithFoundation does not save annotations when Drive folder creation fails", async () => {
  const drive = createFolderDrive({ fail: true });
  const harness = createStoreHarness();

  await assert.rejects(
    createProjectWithFoundation({
      drive: drive as any,
      rootFolderId: "root",
      projectName: "Minta projekt",
      actor: "pilot@example.com",
      createStore: harness.createStore as any,
    }),
    /create folder boom/,
  );

  assert.deepEqual(drive.calls, [["root", "Minta projekt"]]);
  assert.deepEqual(harness.saves, []);
});

test("verifyProjectFolderBeforeOpen accepts only a matching initialized Project foundation record", async () => {
  const harness = createStoreHarness({
    initialByFolder: {
      ok: { projects: [foundationProject("ok", "Nyitható")], audit_events: [foundationAudit("ok")] },
      missing: {},
      foreign: { projects: [foundationProject("other", "Másik")], audit_events: [foundationAudit("other")] },
    },
    loadErrors: {
      bad: Object.assign(new Error("bad json"), { name: "CloudLoadError" }),
    },
  });

  const project = await verifyProjectFolderBeforeOpen({
    folderId: "ok",
    projectName: "Nyitható",
    drive: {} as any,
    createStore: harness.createStore as any,
  });
  assert.equal(project.id, "ok");

  await assert.rejects(
    verifyProjectFolderBeforeOpen({
      folderId: "missing",
      projectName: "Hiányos",
      drive: {} as any,
      createStore: harness.createStore as any,
    }),
    /inicializálás/i,
  );
  await assert.rejects(
    verifyProjectFolderBeforeOpen({
      folderId: "foreign",
      projectName: "Idegen",
      drive: {} as any,
      createStore: harness.createStore as any,
    }),
    /más projektazonosítót/i,
  );
  await assert.rejects(
    verifyProjectFolderBeforeOpen({
      folderId: "bad",
      projectName: "Sérült",
      drive: {} as any,
      createStore: harness.createStore as any,
    }),
    /nem olvashatók/i,
  );
});

test("openProjectWithVerification does not create recents or navigate for missing, corrupt or foreign project state", async () => {
  const harness = createStoreHarness({
    initialByFolder: {
      missing: {},
      foreign: { projects: [foundationProject("other", "Másik")], audit_events: [foundationAudit("other")] },
    },
    loadErrors: {
      bad: Object.assign(new Error("bad json"), { name: "CloudLoadError" }),
    },
  });
  const remembered: any[] = [];
  const navigated: string[] = [];

  await assert.rejects(
    openProjectWithVerification({
      folderId: "missing",
      projectName: "Hiányos",
      drive: {} as any,
      createStore: harness.createStore as any,
      remember: (entry: any) => remembered.push(entry),
      navigate: (url: string) => navigated.push(url),
    }),
    /inicializálás/i,
  );
  await assert.rejects(
    openProjectWithVerification({
      folderId: "foreign",
      projectName: "Idegen",
      drive: {} as any,
      createStore: harness.createStore as any,
      remember: (entry: any) => remembered.push(entry),
      navigate: (url: string) => navigated.push(url),
    }),
    /más projektazonosítót/i,
  );
  await assert.rejects(
    openProjectWithVerification({
      folderId: "bad",
      projectName: "Sérült",
      drive: {} as any,
      createStore: harness.createStore as any,
      remember: (entry: any) => remembered.push(entry),
      navigate: (url: string) => navigated.push(url),
    }),
    /nem olvashatók/i,
  );

  assert.deepEqual(remembered, []);
  assert.deepEqual(navigated, []);
});

test("createProjectWithFoundationAndOpen remembers and navigates only after the reopened scoped store verifies the matching project record", async () => {
  const remembered: any[] = [];
  const navigated: string[] = [];
  const harness = createStoreHarness();

  const project = await createProjectWithFoundationAndOpen({
    drive: createFolderDrive() as any,
    rootFolderId: "root",
    projectName: "Minta projekt",
    actor: "pilot@example.com",
    createStore: harness.createStore as any,
    idFactory: ((seq = 0) => (kind: string) => `${kind}-${++seq}`)(),
    now: () => NOW,
    remember: (entry: any) => remembered.push(entry),
    navigate: (url: string) => navigated.push(url),
  });

  assert.deepEqual(project, { id: "folder-created", name: "Minta projekt" });
  assert.deepEqual(remembered, [project]);
  assert.deepEqual(navigated, ["/?project=folder-created"]);
  assert.equal(projectHomeOpenUrl("folder id"), "/?project=folder%20id");
});

test("createProjectWithFoundationAndOpen does not remember or navigate when reopened verification cannot find the saved project record", async () => {
  const remembered: any[] = [];
  const navigated: string[] = [];
  const harness = createStoreHarness({ persistOnSave: false });

  await assert.rejects(
    createProjectWithFoundationAndOpen({
      drive: createFolderDrive() as any,
      rootFolderId: "root",
      projectName: "Minta projekt",
      actor: "pilot@example.com",
      createStore: harness.createStore as any,
      idFactory: ((seq = 0) => (kind: string) => `${kind}-${++seq}`)(),
      now: () => NOW,
      remember: (entry: any) => remembered.push(entry),
      navigate: (url: string) => navigated.push(url),
    }),
    /inicializálás/i,
  );

  assert.deepEqual(remembered, []);
  assert.deepEqual(navigated, []);
});

test("reconcileVisibleRecentProjects keeps only currently visible initialized projects and refreshes their current names", () => {
  const recent = [
    { id: "p2", name: "Régi név" },
    { id: "gone", name: "Nem látható" },
    { id: "p2", name: "dupe" },
    { id: "p1", name: "Másik régi név" },
  ];
  const visible = [
    { id: "p1", name: "Alpha projekt", state: PROJECT_HOME_FOLDER_STATES.INITIALIZED },
    { id: "p2", name: "Béta projekt", state: PROJECT_HOME_FOLDER_STATES.RECOVERABLE_INCOMPLETE },
    { id: "p3", name: "Gamma projekt", state: PROJECT_HOME_FOLDER_STATES.INITIALIZED },
  ];
  assert.deepEqual(reconcileVisibleRecentProjects(recent, visible as any), [
    { id: "p1", name: "Alpha projekt" },
  ]);
});

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
  recents.remember({ id: "p1", name: "Renamed" });
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
  assert.equal(ids[0], "p13");
  assert.ok(!ids.includes("p1"));
});

test("recents: corrupt JSON reads as empty and the next remember overwrites it cleanly", () => {
  const storage = fakeStorage({ opentakeoff_recent_projects: "{not json" });
  const recents = createRecents(storage);
  assert.deepEqual(recents.list(), []);
  recents.remember({ id: "p1", name: "Fresh" });
  assert.deepEqual(recents.list(), [{ id: "p1", name: "Fresh" }]);
});

test("recents: storage that throws — list is [] and remember doesn't throw", () => {
  const recents = createRecents({
    getItem() { throw new Error("SecurityError"); },
    setItem() { throw new Error("QuotaExceededError"); },
  });
  assert.deepEqual(recents.list(), []);
  recents.remember({ id: "p1", name: "Acme HQ" });
  assert.deepEqual(recents.list(), []);
});

test("recents: malformed entries in the stored array are filtered out of list", () => {
  const stored = [
    { id: "p1", name: "Good" },
    { name: "no id" },
    { id: 7, name: "numeric id" },
    { id: "p2" },
    { id: "p3", name: 3 },
    null,
    "junk",
    { id: "p1", name: "duplicate" },
    { id: "p4", name: "Also good" },
  ];
  const recents = createRecents(fakeStorage({ opentakeoff_recent_projects: JSON.stringify(stored) }));
  assert.deepEqual(recents.list(), [
    { id: "p1", name: "Good" },
    { id: "p4", name: "Also good" },
  ]);
  assert.deepEqual(createRecents(fakeStorage({ opentakeoff_recent_projects: '{"id":"x"}' })).list(), []);
});

test("browserStorage: without a usable localStorage it degrades to an inert storage", () => {
  const storage = browserStorage();
  const recents = createRecents(storage);
  assert.deepEqual(recents.list(), []);
  assert.doesNotThrow(() => recents.remember({ id: "p1", name: "Job" }));
  assert.deepEqual(recents.list(), []);
});
