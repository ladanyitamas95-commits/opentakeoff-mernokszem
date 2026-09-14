import React, { useState } from "react";
import {
  Button,
  IconButton,
  Input,
  Select,
  SystemStatusBadge,
  Tabs,
} from "./ui/index.js";
import { PILOT_APP_ROUTES } from "../lib/pilotAccess.js";

const NAV_ITEMS = [
  { id: "project", label: "Projekt", icon: "P", target: PILOT_APP_ROUTES.projects },
  { id: "documents", label: "Dokumentumok", icon: "D", target: PILOT_APP_ROUTES.app },
  { id: "takeoff", label: "Mennyiségfelmérés", icon: "M", target: PILOT_APP_ROUTES.local },
  { id: "boq", label: "Költségvetés", icon: "K" },
  { id: "review", label: "Ellenőrzés", icon: "E" },
  { id: "export", label: "Export", icon: "X" },
];

export const FOUNDATION_NAV_TARGETS = Object.freeze(Object.fromEntries(
  NAV_ITEMS.filter((item) => item.target).map((item) => [item.id, item.target]),
));

const CONTEXT_TABS = [
  { id: "chat", label: "Chat" },
  { id: "findings", label: "Megállapítások" },
  { id: "context", label: "Kontextus" },
];

export default function AppShell({
  children,
  activeNav = "takeoff",
  projectName = "MérnökSzem pilot projekt",
  status = "READY",
  rightPanelDefaultOpen = true,
  onNavigate,
}) {
  const [rightOpen, setRightOpen] = useState(rightPanelDefaultOpen);
  const [contextTab, setContextTab] = useState("chat");
  const shellClass = `ms-app-shell${rightOpen ? "" : " is-context-collapsed"}`;

  return (
    <div className={shellClass}>
      <aside className="ms-sidebar" aria-label="Fő navigáció">
        <div>
          <div className="ms-brand-lockup">
            <span className="ms-brand-mark" aria-hidden="true">MS</span>
            <span>MérnökSzem</span>
          </div>
          <div className="ms-brand-subtitle">Mérnöki pontosság. Okosabb döntések.</div>
        </div>

        <nav className="ms-sidebar-nav" aria-label="Modulok">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ms-nav-item"
              aria-current={item.id === activeNav ? "page" : undefined}
              aria-disabled={!item.target || !onNavigate}
              onClick={item.target && onNavigate ? () => onNavigate(item.target) : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="ms-muted-copy">
          UI foundation preview: navigációs váz, állapotjelzés és újrahasznosítható komponensek.
        </div>
      </aside>

      <header className="ms-topbar">
        <div className="ms-topbar-title">MérnökSzem TakeOff</div>
        <Select label="Projekt választó" value="pilot" onChange={() => {}}>
          <option value="pilot">{projectName}</option>
        </Select>
        <div className="ms-topbar-search">
          <Input label="Keresés" type="search" placeholder="Keresés projektben…" />
        </div>
        <SystemStatusBadge status={status} />
        <div className="ms-account-area">
          <span className="ms-muted-copy">Pilot felhasználó</span>
          <Button variant="ghost">Fiók</Button>
        </div>
      </header>

      <main className="ms-workspace">
        <div className="ms-workspace-inner">{children}</div>
      </main>

      <aside className={`ms-context-panel${rightOpen ? "" : " is-collapsed"}`} aria-label="Jobb oldali kontextuspanel">
        <div className="ms-context-head">
          <IconButton
            label={rightOpen ? "Kontextuspanel bezárása" : "Kontextuspanel megnyitása"}
            icon={rightOpen ? "›" : "‹"}
            aria-expanded={rightOpen}
            onClick={() => setRightOpen((open) => !open)}
          />
          {rightOpen ? <Tabs tabs={CONTEXT_TABS} activeId={contextTab} onChange={setContextTab} /> : null}
        </div>
        {rightOpen ? (
          <div className="ms-context-body">
            {contextTab === "chat" ? <ContextBlock title="Chat" body="Projektállapot, export blokk és használati segítség helye." /> : null}
            {contextTab === "findings" ? <ContextBlock title="Megállapítások" body="Validation findingek és review okok áttekintése." /> : null}
            {contextTab === "context" ? <ContextBlock title="Kontextus" body="Forrás, dokumentum, méretarány és audit hivatkozások helye." /> : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function ContextBlock({ title, body }) {
  return (
    <section className="ms-card-stack">
      <strong>{title}</strong>
      <p className="ms-muted-copy">{body}</p>
    </section>
  );
}
