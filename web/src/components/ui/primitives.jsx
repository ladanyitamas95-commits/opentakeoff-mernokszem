import React, { useId } from "react";

export const MEASUREMENT_STATUSES = [
  "DRAFT",
  "AI_PROPOSED",
  "REVIEW_REQUIRED",
  "MEASUREMENT_RULE_REQUIRED",
  "SCALE_REVIEW_REQUIRED",
  "INVALID_GEOMETRY",
  "ACCEPTED",
  "EDITED",
  "REJECTED",
];

export const MEASUREMENT_STATUS_META = {
  DRAFT: { label: "Vázlat", icon: "○", tone: "neutral" },
  AI_PROPOSED: { label: "AI-javaslat", icon: "◇", tone: "review" },
  REVIEW_REQUIRED: { label: "Ellenőrzés kell", icon: "!", tone: "review" },
  MEASUREMENT_RULE_REQUIRED: { label: "Mérési szabály kell", icon: "↯", tone: "blocked" },
  SCALE_REVIEW_REQUIRED: { label: "Méretarány ellenőrzése", icon: "⌖", tone: "blocked" },
  INVALID_GEOMETRY: { label: "Hibás geometria", icon: "×", tone: "error" },
  ACCEPTED: { label: "Elfogadva", icon: "✓", tone: "pass" },
  EDITED: { label: "Szerkesztve", icon: "✎", tone: "warning" },
  REJECTED: { label: "Elutasítva", icon: "–", tone: "neutral" },
};

export const SYSTEM_STATUS_META = {
  PROCESSING: { label: "Feldolgozás", icon: "…", tone: "review" },
  READY: { label: "Kész", icon: "✓", tone: "pass" },
  PASS: { label: "Rendben", icon: "✓", tone: "pass" },
  WARNING: { label: "Figyelmeztetés", icon: "!", tone: "warning" },
  ERROR: { label: "Hiba", icon: "×", tone: "error" },
  BLOCKED: { label: "Blokkolva", icon: "■", tone: "blocked" },
};

export const VALIDATION_META = {
  PASS: { label: "PASS", icon: "✓", tone: "pass" },
  REVIEW: { label: "REVIEW", icon: "!", tone: "review" },
  ERROR: { label: "ERROR", icon: "×", tone: "error" },
};

function metaFor(value, map, fallbackTone = "neutral") {
  return map[value] || { label: String(value || "Ismeretlen"), icon: "?", tone: fallbackTone };
}

export function Button({ children, variant = "secondary", type = "button", ...props }) {
  return <button type={type} className="ms-button" data-variant={variant} {...props}>{children}</button>;
}

export function IconButton({ label, icon, type = "button", ...props }) {
  return (
    <button type={type} className="ms-icon-button" aria-label={label} title={label} {...props}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export function Input({ label, id, ...props }) {
  const fallbackId = useId();
  const inputId = id || fallbackId;
  return (
    <label className="ms-field" htmlFor={inputId}>
      {label ? <span className="ms-field-label">{label}</span> : null}
      <input id={inputId} className="ms-input" {...props} />
    </label>
  );
}

export function Select({ label, id, children, ...props }) {
  const fallbackId = useId();
  const inputId = id || fallbackId;
  return (
    <label className="ms-field" htmlFor={inputId}>
      {label ? <span className="ms-field-label">{label}</span> : null}
      <select id={inputId} className="ms-select" {...props}>{children}</select>
    </label>
  );
}

export function Textarea({ label, id, ...props }) {
  const fallbackId = useId();
  const inputId = id || fallbackId;
  return (
    <label className="ms-field" htmlFor={inputId}>
      {label ? <span className="ms-field-label">{label}</span> : null}
      <textarea id={inputId} className="ms-textarea" {...props} />
    </label>
  );
}

export function Checkbox({ children, ...props }) {
  return (
    <label className="ms-checkbox">
      <input type="checkbox" {...props} />
      <span className="ms-checkbox-box" aria-hidden="true" />
      <span>{children}</span>
    </label>
  );
}

export function Tabs({ tabs, activeId, onChange }) {
  return (
    <div className="ms-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="ms-tab"
          role="tab"
          aria-selected={tab.id === activeId}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({ children, tone = "neutral" }) {
  return <span className="ms-chip" data-tone={tone}>{children}</span>;
}

export function Panel({ title, children, actions }) {
  return (
    <section className="ms-panel">
      {(title || actions) ? (
        <div className="ms-panel-header">
          {title ? <h2 className="ms-panel-title">{title}</h2> : null}
          {actions}
        </div>
      ) : null}
      <div className="ms-panel-body">{children}</div>
    </section>
  );
}

export function DataTableShell({ columns, rows, emptyText = "Nincs megjeleníthető adat." }) {
  return (
    <table className="ms-data-table-shell">
      <thead>
        <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row, index) => (
          <tr key={row.id || index}>
            {columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}
          </tr>
        )) : (
          <tr><td colSpan={columns.length}>{emptyText}</td></tr>
        )}
      </tbody>
    </table>
  );
}

export function Toast({ title = "Értesítés", children, tone = "neutral" }) {
  return <div className="ms-toast" data-tone={tone} role="status"><strong>{title}</strong><span>{children}</span></div>;
}

export function Alert({ title, children, tone = "neutral" }) {
  return (
    <div className="ms-alert" data-tone={tone} role={tone === "error" || tone === "blocked" ? "alert" : "status"}>
      <StatusGlyph tone={tone} />
      <div>{title ? <strong>{title}</strong> : null}<div>{children}</div></div>
    </div>
  );
}

export function Tooltip({ label, children }) {
  return (
    <span className="ms-tooltip">
      {children}
      <span className="ms-tooltip-bubble" role="tooltip">{label}</span>
    </span>
  );
}

export function Dialog({ title, children, open = false, onClose }) {
  if (!open) return null;
  return (
    <div className="ms-dialog-backdrop" role="presentation">
      <section className="ms-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="ms-panel-header">
          <h2 className="ms-panel-title">{title}</h2>
          {onClose ? <IconButton label="Bezárás" icon="×" onClick={onClose} /> : null}
        </div>
        <div className="ms-panel-body">{children}</div>
      </section>
    </div>
  );
}

export function StatusBadge({ status }) {
  const meta = metaFor(status, MEASUREMENT_STATUS_META);
  return <Badge meta={meta} title={status} />;
}

export function SystemStatusBadge({ status }) {
  const meta = metaFor(status, SYSTEM_STATUS_META);
  return <Badge meta={meta} title={status} />;
}

export function ValidationBadge({ status }) {
  const meta = metaFor(status, VALIDATION_META);
  return <Badge meta={meta} title={status} />;
}

export function ConfidenceBadge({ value, label = "Bizonyosság" }) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : null;
  const tone = safe === null ? "neutral" : safe >= .9 ? "pass" : safe >= .65 ? "review" : "warning";
  const text = safe === null ? "n/a" : `${Math.round(safe * 100)}%`;
  return <span className="ms-badge" data-tone={tone}><span aria-hidden="true">◌</span><span>{label}: {text}</span></span>;
}

export function EmptyState({ title = "Nincs adat", children }) {
  return <StateCard icon="□" title={title}>{children}</StateCard>;
}

export function LoadingState({ title = "Betöltés…", children }) {
  return <StateCard icon="…" title={title}>{children}</StateCard>;
}

export function ErrorState({ title = "Hiba történt", children }) {
  return <StateCard icon="×" title={title} tone="error">{children}</StateCard>;
}

export function BlockedState({ title = "Blokkolt állapot", children }) {
  return <StateCard icon="■" title={title} tone="blocked">{children}</StateCard>;
}

function Badge({ meta, title }) {
  return (
    <span className="ms-badge" data-tone={meta.tone} title={title}>
      <span aria-hidden="true">{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}

function StatusGlyph({ tone }) {
  const icon = { pass: "✓", warning: "!", error: "×", review: "◇", blocked: "■" }[tone] || "•";
  return <span aria-hidden="true">{icon}</span>;
}

function StateCard({ icon, title, children, tone = "neutral" }) {
  return (
    <section className="ms-state-card" data-tone={tone}>
      <span aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        {children ? <div className="ms-muted-copy">{children}</div> : null}
      </div>
    </section>
  );
}
