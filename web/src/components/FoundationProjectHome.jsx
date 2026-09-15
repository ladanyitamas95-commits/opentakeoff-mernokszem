import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "./AppShell.jsx";
import { Button, EmptyState, Input } from "./ui/index.js";
import { getAccessToken } from "../lib/google/auth.js";
import { useGoogleAuth } from "../lib/google/AuthContext.jsx";
import { projectHomeFolderId } from "../lib/projectHome.js";
import {
  createFoundationProject,
  listFoundationProjects,
  openFoundationProject,
} from "../lib/projectCreateOpen.js";

async function createProjectDrive() {
  const [{ createDrive }, { createCloudStore }] = await Promise.all([
    import("../lib/google/drive.js"),
    import("../lib/cloudStore.js"),
  ]);
  const drive = createDrive({ getToken: getAccessToken });
  return { drive, createStore: (id) => createCloudStore(id, drive) };
}

function formatDate(value) {
  return new Intl.DateTimeFormat("hu-HU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function FoundationProjectHome() {
  const navigate = useNavigate();
  const { user } = useGoogleAuth();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const rootFolderId = projectHomeFolderId();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { drive, createStore } = await createProjectDrive();
      const folders = await drive.listChildren(rootFolderId, { mimeType: "application/vnd.google-apps.folder" });
      setProjects(await listFoundationProjects({ folders, createStore }));
    } catch (cause) {
      setError(`A projektek nem tölthetők be: ${cause?.message || cause}`);
    } finally {
      setLoading(false);
    }
  }, [rootFolderId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { drive, createStore } = await createProjectDrive();
      const created = await createFoundationProject({ drive, rootFolderId, createStore, name, actor: user });
      setName("");
      openFoundationProject(created.project, navigate);
    } catch (cause) {
      setError(cause?.message || String(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activeNav="project" onNavigate={navigate} projectName="Projektlista">
      <section className="ms-card-stack" aria-labelledby="project-home-title">
        <div className="ms-section-heading">
          <div>
            <p className="ms-eyebrow">PILOT PROJEKTEK</p>
            <h1 id="project-home-title">Projektek</h1>
          </div>
          <Button variant="ghost" onClick={refresh} disabled={loading || saving}>Lista frissítése</Button>
        </div>

        <form className="ms-inline-form" onSubmit={create}>
          <Input label="Új projekt neve" value={name} onChange={(event) => setName(event.target.value)} />
          <Button variant="primary" type="submit" disabled={saving}>Új projekt</Button>
        </form>

        {error ? <div role="alert" className="ms-error-state">{error}</div> : null}
        {loading ? <p className="ms-muted-copy">Projektek betöltése…</p> : null}
        {!loading && !error && projects.length === 0 ? (
          <EmptyState title="Még nincs projekt">
            <span>Hozd létre az első pilot projektet az Új projekt művelettel.</span>
          </EmptyState>
        ) : null}
        {!loading && !error && projects.map((project) => (
          <article key={project.id} className="ms-project-row">
            <div>
              <strong>{project.name}</strong>
              <div className="ms-muted-copy">Létrehozva: {formatDate(project.created_at)}</div>
              <div className="ms-muted-copy">Utolsó módosítás: {formatDate(project.updated_at)}</div>
            </div>
            <div className="ms-project-row-actions">
              <span className="ms-status-badge">{project.status}</span>
              <Button variant="ghost" onClick={() => openFoundationProject(project, navigate)}>Megnyitás</Button>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
