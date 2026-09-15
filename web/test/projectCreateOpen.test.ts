import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createFoundationProject,
  listFoundationProjects,
  openFoundationProject,
  persistProjectRecord,
} from "../src/lib/projectCreateOpen.js";

const NOW = "2026-09-15T10:00:00.000Z";

function fakeStore(seed: any = {}) {
  let saved = structuredClone({ conditions: [{ id: "legacy-condition" }], custom_annotation_field: { keep: true }, projects: [], ...seed });
  return {
    async loadAnnotations() { return structuredClone(saved); },
    async saveAnnotations(next: any) { saved = structuredClone(next); },
    saved: () => structuredClone(saved),
  };
}

function fakeDrive() {
  const folders: any[] = [];
  return {
    folders,
    async createFolder(parentId: string, name: string) {
      const folder = { id: `project-${folders.length + 1}`, name, parentId };
      folders.push(folder);
      return folder;
    },
  };
}

test("fresh Project Home list has a valid empty state", async () => {
  assert.deepEqual(await listFoundationProjects({ folders: [], createStore: () => fakeStore() }), []);
});

test("empty project name is rejected before a folder is created", async () => {
  const drive = fakeDrive();
  await assert.rejects(
    createFoundationProject({ drive, rootFolderId: "root", createStore: () => fakeStore(), name: "  ", now: () => NOW }),
    /projekt neve kötelező/i,
  );
  assert.deepEqual(drive.folders, []);
});

test("valid project creation produces a valid persisted foundation Project record", async () => {
  const drive = fakeDrive();
  const stores = new Map<string, any>();
  const createStore = (id: string) => {
    if (!stores.has(id)) stores.set(id, fakeStore());
    return stores.get(id);
  };
  const result = await createFoundationProject({ drive, rootFolderId: "root", createStore, name: "  Irodaház A  ", now: () => NOW });
  assert.deepEqual(result.project, {
    id: "project-1", name: "Irodaház A", status: "active", created_at: NOW, updated_at: NOW,
  });
  assert.equal(result.path, "/app/projects/project-1");
  assert.deepEqual((await createStore("project-1").loadAnnotations()).projects, [result.project]);
});

test("project persistence preserves unrelated existing annotation fields", async () => {
  const store = fakeStore();
  await persistProjectRecord({ store, id: "project-a", name: "A projekt", now: () => NOW });
  const saved = store.saved();
  assert.deepEqual(saved.conditions, [{ id: "legacy-condition" }]);
  assert.deepEqual(saved.custom_annotation_field, { keep: true });
});

test("reload/list returns the created persisted project", async () => {
  const store = fakeStore();
  await persistProjectRecord({ store, id: "project-a", name: "A projekt", now: () => NOW });
  const found = await listFoundationProjects({ folders: [{ id: "project-a", name: "ignored folder label" }], createStore: () => store });
  assert.equal(found[0].name, "A projekt");
});

test("opening a project enters the protected project workspace route", () => {
  const navigations: string[] = [];
  assert.equal(openFoundationProject({ id: "project A" }, (path: string) => navigations.push(path)), "/app/projects/project%20A");
  assert.deepEqual(navigations, ["/app/projects/project%20A"]);
});

test("Project A and Project B persist in separate existing project-scoped stores", async () => {
  const stores = new Map<string, any>();
  const createStore = (id: string) => {
    if (!stores.has(id)) stores.set(id, fakeStore());
    return stores.get(id);
  };
  await persistProjectRecord({ store: createStore("A"), id: "A", name: "Projekt A", now: () => NOW });
  await persistProjectRecord({ store: createStore("B"), id: "B", name: "Projekt B", now: () => NOW });
  assert.deepEqual((await createStore("A").loadAnnotations()).projects.map((item: any) => item.id), ["A"]);
  assert.deepEqual((await createStore("B").loadAnnotations()).projects.map((item: any) => item.id), ["B"]);
});

test("persistence failure is returned for the Project Home visible error state", async () => {
  const failing = { async loadAnnotations() { return { projects: [] }; }, async saveAnnotations() { throw new Error("Drive write failed"); } };
  await assert.rejects(
    persistProjectRecord({ store: failing, id: "project-a", name: "Projekt A", now: () => NOW }),
    /Drive write failed/,
  );
});

test("project create/open adds no persistence mechanism beyond the injected annotation store", async () => {
  const calls: string[] = [];
  const store = {
    async loadAnnotations() { calls.push("loadAnnotations"); return { projects: [] }; },
    async saveAnnotations() { calls.push("saveAnnotations"); },
  };
  await persistProjectRecord({ store, id: "project-a", name: "Projekt A", now: () => NOW });
  assert.deepEqual(calls, ["loadAnnotations", "saveAnnotations"]);
});
