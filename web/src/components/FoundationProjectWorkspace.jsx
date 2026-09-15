import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "./AppShell.jsx";
import { EmptyState } from "./ui/index.js";
import { getAccessToken } from "../lib/google/auth.js";
import { setActiveStore } from "../lib/store.js";

export default function FoundationProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [{ createDrive }, { createCloudStore }] = await Promise.all([
          import("../lib/google/drive.js"),
          import("../lib/cloudStore.js"),
        ]);
        if (!live) return;
        const store = createCloudStore(projectId, createDrive({ getToken: getAccessToken }));
        const annotations = await store.loadAnnotations();
        const found = (annotations.projects || []).find((item) => item?.id === projectId);
        if (!found) throw new Error("A projekt nem található.");
        setActiveStore(store);
        if (live) setProject(found);
      } catch (cause) {
        if (live) setError(`A projekt nem nyitható meg: ${cause?.message || cause}`);
      }
    })();
    return () => { live = false; setActiveStore(); };
  }, [projectId]);

  if (error) return <div role="alert" className="ms-error-state">{error}</div>;
  if (!project) return <div className="ms-muted-copy">Projekt megnyitása…</div>;
  return (
    <AppShell activeNav="documents" projectName={project.name} onNavigate={navigate}>
      <EmptyState title={project.name}>
        <span>Dokumentumok hozzáadása a következő, külön engedélyezett lépésben lesz elérhető.</span>
      </EmptyState>
    </AppShell>
  );
}
