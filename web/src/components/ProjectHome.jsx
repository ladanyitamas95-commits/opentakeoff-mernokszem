// ProjectHome — the signed-in `/` screen on team-configured builds.
//
// A project IS a direct child of the "Projects" Shared Drive root, so this is a
// FLAT list of those child folders (no drilling — you never navigate above or
// below the project list here). Plus a browser-local recents list. Opening a
// project navigates to `/?project=<folderId>` — the exact same deep link Glide
// hands out, so ProjectGate does all the store work and lands the user in the
// project (empty → the PDF picker, otherwise the sheet gallery); nothing is
// opened here. The listing/recents logic lives in lib/projectHome.js
// (node-testable); this file is only the screen, mirroring PlanNavigator's idiom.
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthChip from "./AuthChip.jsx";
import {
  browserStorage,
  createProjectDisabledReason,
  createProjectWithFoundationAndOpen,
  createRecents,
  listProjectFolders,
  projectHomeFolderId,
  projectHomeOpenUrl,
  reconcileVisibleRecentProjects,
} from "../lib/projectHome.js";
import { getAccessToken, getUser } from "../lib/google/auth.js";

const rowBase = { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: "1px solid var(--ink-faint)", background: "var(--paper-bright)" };
const sectionHead = { padding: "10px 18px 6px", fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-muted)" };
const openBtn = { padding: "5px 10px", border: "1px solid var(--ink-faint)", background: "transparent", color: "var(--cobalt)", cursor: "pointer", fontSize: 12, fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" };
const createInput = { minWidth: 220, flex: "1 1 260px", padding: "7px 9px", border: "1px solid var(--ink-faint)", background: "var(--paper-bright)", color: "var(--ink)", fontSize: 13 };
const createBtn = { padding: "7px 12px", border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--paper-bright)", cursor: "pointer", fontSize: 12.5, fontWeight: 700 };

export default function ProjectHome() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [attempt, setAttempt] = useState(0);   // Retry bumps this to re-run the load
  const [recentsStore] = useState(() => createRecents(browserStorage()));
  const [recents, setRecents] = useState([]);
  const createDisabledReason = createProjectDisabledReason({
    projectName,
    visibleProjects: folders,
    loading,
    loadError: err,
  });
  const duplicateProjectName = createDisabledReason === "duplicate_name";
  const createDisabled = creating || !!createDisabledReason;

  useEffect(() => {
    // live flag (copied from PlanNavigator): StrictMode double-invokes effects, so
    // only the latest run commits state (a stale first run can't clobber it).
    let live = true;
    setLoading(true); setErr("");
    // drive.js must be a DYNAMIC import: this component is statically reachable
    // from main.jsx, and a static import here would drag the Drive client into
    // the anonymous bundle. (getAccessToken is fine to import statically —
    // auth.js already ships in that bundle via main.jsx.)
    import("../lib/google/drive.js")
      .then(({ createDrive }) => listProjectFolders(createDrive({ getToken: getAccessToken }), projectHomeFolderId()))
      .then((list) => { if (live) { setFolders(list); setLoading(false); } })
      .catch((e) => { if (live) { setErr(String(e?.message || e)); setLoading(false); } });
    return () => { live = false; };
  }, [attempt]);

  useEffect(() => {
    if (loading || err) { setRecents([]); return; }
    const next = reconcileVisibleRecentProjects(recentsStore.list(), folders);
    recentsStore.replace(next);
    setRecents(next);
  }, [folders, loading, err, recentsStore]);

  const open = ({ id, name }) => {
    // A project row passes the name Drive reports RIGHT NOW, so a renamed folder
    // self-heals in recents when opened from the list; a recents-row open
    // re-remembers its stored name and only bumps the ordering.
    createRecents(browserStorage()).remember({ id, name });
    navigate(projectHomeOpenUrl(id));
  };

  const createProject = async (event) => {
    event.preventDefault();
    if (creating) return;
    if (createDisabledReason === "loading") return;
    if (createDisabledReason === "projects_unavailable") {
      setCreateErr("A projektlista nélkül nem biztonságos új projektet létrehozni. Töltsd be újra a listát, majd próbáld újra.");
      return;
    }
    if (createDisabledReason) return;
    setCreateErr("");
    setCreating(true);
    try {
      const [{ createDrive }, { createCloudStore }] = await Promise.all([
        import("../lib/google/drive.js"),
        import("../lib/cloudStore.js"),
      ]);
      const drive = createDrive({ getToken: getAccessToken });
      const user = getUser();
      await createProjectWithFoundationAndOpen({
        drive,
        rootFolderId: projectHomeFolderId(),
        projectName,
        visibleProjects: folders,
        actor: user?.email || user?.sub || "signed-in-user",
        createStore: createCloudStore,
        remember: (project) => createRecents(browserStorage()).remember(project),
        navigate,
      });
    } catch (e) {
      setCreateErr(String(e?.message || e));
      setCreating(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--paper-cream)", color: "var(--ink)" }}>
      {/* header: brand + title + local-canvas escape hatch + signed-in chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid var(--ink)", background: "var(--paper-bright)", flexWrap: "wrap" }}>
        <strong style={{ fontFamily: "var(--f-display)", fontSize: 20, letterSpacing: "-0.02em" }}>
          MérnökSzem <span style={{ fontStyle: "italic", color: "var(--cobalt)" }}>TakeOff</span>
        </strong>
        <strong style={{ fontFamily: "var(--f-display)", fontSize: 16, color: "var(--ink)" }}>Projektek</strong>
        {/* Escape hatch sits WITH the title (top-left), matching PlanNavigator's
            back/up placement so the "get out of here" control is always in the
            same spot. client-side Link (not a plain anchor): a reload here would
            drop the in-memory Google token; App re-gates off the URL and keeps us
            signed in */}
        <Link to="/" style={{ fontSize: 12, color: "var(--cobalt)" }}>helyi tervmérés</Link>
        <div style={{ flex: 1 }} />
        <AuthChip />
      </div>

      <form onSubmit={createProject}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderBottom: "1px solid var(--ink-faint)", background: "var(--paper-bright)", flexWrap: "wrap" }}>
        <strong style={{ fontFamily: "var(--f-body)", fontSize: 13.5, color: "var(--ink)" }}>Új projekt létrehozása</strong>
        <input
          type="text"
          value={projectName}
          onChange={(e) => { setProjectName(e.target.value); setCreateErr(""); }}
          placeholder="Projekt neve"
          aria-label="Projekt neve"
          disabled={creating}
          style={createInput}
        />
        <button
          type="submit"
          disabled={createDisabled}
          style={{ ...createBtn, opacity: createDisabled ? 0.55 : 1, cursor: createDisabled ? "not-allowed" : "pointer" }}
        >
          {creating ? "Létrehozás…" : "Létrehozás"}
        </button>
        {createDisabledReason === "loading" && (
          <span style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>A létrehozás a projektlista beolvasása után érhető el.</span>
        )}
        {createDisabledReason === "projects_unavailable" && (
          <span style={{ color: "var(--c-danger)", fontSize: 12.5 }}>A létrehozás addig nem érhető el, amíg a projektlista nem tölthető be.</span>
        )}
        {duplicateProjectName && (
          <span style={{ color: "var(--c-danger)", fontSize: 12.5 }}>Ilyen nevű projekt már szerepel a listában.</span>
        )}
        {createErr && (
          <span role="alert" style={{ color: "var(--c-danger)", fontSize: 12.5 }}>{createErr}</span>
        )}
      </form>

      {/* recently opened — this browser only; hidden entirely when empty */}
      {recents.length > 0 && (
        <div>
          <div style={sectionHead}>Legutóbb megnyitva</div>
          {recents.map((r) => (
            // row and button both open — same action, the button is just an
            // explicit affordance mirroring the project rows below.
            <div key={r.id} onClick={() => open(r)} style={{ ...rowBase, cursor: "pointer" }}>
              <strong style={{ fontFamily: "var(--f-body)", fontSize: 13.5, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.name}>{r.name}</strong>
              <button type="button" onClick={(e) => { e.stopPropagation(); open(r); }} style={openBtn}>Megnyitás</button>
            </div>
          ))}
        </div>
      )}

      {/* the project list — flat: every folder here is one project */}
      {recents.length > 0 && <div style={sectionHead}>Összes projekt</div>}

      {/* folder listing */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)", fontSize: 13 }}>Projektek beolvasása…</div>
        ) : err ? (
          <div style={{ padding: 40, textAlign: "center", fontSize: 13 }}>
            <div style={{ color: "var(--c-danger)", marginBottom: 12 }}>A projektek nem tölthetők be: {err}</div>
            {/* Retry must be a BUTTON: the click is a user gesture, so if the
                token expired, the silent-refresh popup GIS may need to open
                isn't popup-blocked — an auto-retry's would be. */}
            <button type="button" onClick={() => setAttempt((n) => n + 1)}
              style={{ padding: "7px 14px", border: "1px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              Újra
            </button>
          </div>
        ) : folders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)", fontSize: 13 }}>
            Még nincs projekt — hozd létre fent az elsőt.
          </div>
        ) : (
          folders.map((f) => (
            // row and button both open the project — a project is exactly this
            // folder, so there's nothing to drill into; opening lands the user in
            // the project (empty → picker, otherwise the gallery). No leading
            // glyph: a drill triangle would misread as "expand," and this matches
            // the recents rows above.
            <div key={f.id} onClick={() => open(f)} style={{ ...rowBase, cursor: "pointer" }}>
              <strong style={{ fontFamily: "var(--f-body)", fontSize: 13.5, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.name}>{f.name}</strong>
              <button type="button" onClick={(e) => { e.stopPropagation(); open(f); }} style={openBtn}>Megnyitás</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
