// Agent panel — the docked right-rail surface for the in-canvas takeoff agent.
// An estimator types a goal; the agent (running on the user's OWN model via
// the BYO-AI seam) aims the app's deterministic tools and stages DASHED pencil
// proposals on the canvas. This panel is the review desk: streaming status
// while the loop runs, then per-proposal Accept/Reject plus Accept all —
// nothing becomes a takeoff until a human says so, exactly like one-click's
// Create gate. Unconfigured builds get the honest empty state (the Contribute
// modal pattern): no key, no run, and a link to AI settings.
import { useEffect, useRef, useState } from "react";
import { keyText } from "../lib/keys.ts";
import { Icon } from "../brand/icons.jsx";

const evidenceText = (ev) => {
  if (!ev) return "";
  const bits = [];
  if (ev.schedule_row_tag) bits.push(`kimutatás ${ev.schedule_row_tag}`);
  if (ev.matched_text && ev.matched_text !== ev.schedule_row_tag) bits.push(`“${ev.matched_text}”`);
  if (Array.isArray(ev.seed_norm)) bits.push(`kiindulópont (${(+ev.seed_norm[0]).toFixed(2)}, ${(+ev.seed_norm[1]).toFixed(2)})`);
  return bits.join(" · ");
};

const LOG_STYLE = { status: "var(--ink-muted)", tool: "var(--cobalt)", text: "var(--ink)", error: "var(--c-danger)" };

export default function AgentPanel({
  configured, running, log, proposals, condById, sheetLabel, units,
  fmtArea, onRun, onStop, onAccept, onReject, onAcceptAll, onRejectAll,
  onOpenSettings, onClose,
}) {
  const [goal, setGoal] = useState("");
  const logRef = useRef(null);
  // follow the stream — pin the log to its latest line as events arrive
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
  void units; // reserved for a metric readout pass; fmtArea already localizes

  const run = () => { const g = goal.trim(); if (g && !running) onRun(g); };
  const ctl = { padding: "3px 9px", border: "1px solid var(--ink-faint)", background: "transparent", cursor: "pointer", fontSize: 11.5 };

  return (
    <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid var(--ink-faint)", background: "var(--paper-bright)", overflow: "hidden", minHeight: 0 }}>
      {/* header strip — matches the docked-panel chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--cobalt)", color: "var(--accent-contrast)" }}>
        <Icon name="target" size={15} />
        <strong style={{ flex: 1, fontSize: 12.5 }}>AI asszisztens{proposals.length ? ` · ${proposals.length} függőben` : ""}</strong>
        <button onClick={onClose} title="Panel bezárása" style={{ border: "none", background: "transparent", color: "var(--accent-contrast)", fontSize: 16, cursor: "pointer", padding: "0 2px" }}>×</button>
      </div>

      {!configured ? (
        // honest empty state — the Contribute-modal pattern: nothing configured,
        // nothing runs, no pretense. Zero network calls until the user brings a key.
        <div style={{ padding: 14, fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>
          <p style={{ marginTop: 0 }}>
            Az AI asszisztens az <strong>általad megadott</strong> modellen, végponton és kulccsal fut közvetlenül
            ebből a böngészőből. Még nincs beállítva, ezért nem indítható.
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            A beállítás után írd le a tervmérési feladatot. Az asszisztens a terv szövegrétegét,
            a kimutatás-feldolgozót és az egykattintásos mérőt használja, majd szaggatott javaslatokat
            készít. Ezeket neked kell elfogadnod vagy elvetned; önállóan nem véglegesít mérést.
          </p>
          <button className="btn-primary" onClick={onOpenSettings} style={{ marginTop: 4 }}>AI-beállítások…</button>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* goal + run */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ink-faint)" }}>
            <textarea
              name="agent-goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
              placeholder={'Példa: „Mérd fel a szőnyeget a burkolatkimutatás szerint ezen a tervlapon.”'}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); } }}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: 12.5, fontFamily: "inherit", padding: "6px 8px", border: "1px solid var(--ink-faint)", background: "var(--paper-bright)", color: "var(--ink)", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              {running ? (
                <button onClick={onStop} style={{ ...ctl, color: "var(--c-danger)", fontWeight: 600 }}>■ Leállítás</button>
              ) : (
                <button onClick={run} disabled={!goal.trim()} className="btn-primary" style={{ padding: "5px 14px", fontSize: 12, cursor: goal.trim() ? "pointer" : "default", opacity: goal.trim() ? 1 : 0.5 }}>Indítás</button>
              )}
              <span style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>{running ? "Feldolgozás — a javaslatok szaggatott körvonallal jelennek meg." : keyText("⌘⏎ indít. Saját kulcs, saját végpont.")}</span>
              <span style={{ flex: 1 }} />
              <button onClick={onOpenSettings} title="AI-beállítások (végpont / modell / kulcs)" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-muted)" }}><Icon name="sliders" size={13} /></button>
            </div>
          </div>

          {/* streaming status log */}
          <div ref={logRef} style={{ flex: 1, minHeight: 60, overflow: "auto", padding: "8px 12px", fontFamily: "var(--f-mono)", fontSize: 11, lineHeight: 1.55 }}>
            {log.length === 0 && <div style={{ color: "var(--ink-muted)", fontFamily: "inherit" }}>Még nem futott feladat.</div>}
            {log.map((e, i) => (
              <div key={i} style={{ color: LOG_STYLE[e.kind] || "var(--ink)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginBottom: 3 }}>{e.text}</div>
            ))}
          </div>

          {/* pending proposals — the accept gate */}
          <div style={{ borderTop: "1px solid var(--ink-faint)", maxHeight: "45%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px" }}>
              <strong style={{ flex: 1, fontSize: 11.5 }}>Javaslatok · {proposals.length}</strong>
              {proposals.length > 0 && (
                <>
                  <button onClick={onAcceptAll} style={{ ...ctl, color: "var(--c-positive)", fontWeight: 600 }} title={keyText("Minden látható javaslat elfogadása (a terven az ⏎ ugyanez)")}>Összes elfogadása</button>
                  <button onClick={onRejectAll} style={{ ...ctl, color: "var(--c-danger)" }} title="Minden függő javaslat elvetése">Összes elvetése</button>
                </>
              )}
            </div>
            <div style={{ overflow: "auto", minHeight: 0 }}>
              {proposals.map((p) => {
                const cond = condById[p.condition_id];
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderTop: "1px solid var(--ink-faint)", fontSize: 11.5 }}>
                    <span style={{ width: 10, height: 10, flexShrink: 0, background: cond?.color || "var(--cobalt)", border: "1px solid var(--ink-faint)" }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{cond?.finish_tag || "?"}</span>
                      {p.measure_role === "deduct" ? " (deduct)" : ""} · {sheetLabel(p.sheet_id)}
                      {p.area_sf != null ? ` · ${fmtArea(p.area_sf)}` : ""}
                      <span style={{ display: "block", color: "var(--ink-muted)", fontSize: 10.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={evidenceText(p.evidence)}>
                        {evidenceText(p.evidence) || "nincs bizonyíték"}
                      </span>
                    </span>
                    <button onClick={() => onAccept(p.id)} style={{ ...ctl, color: "var(--c-positive)", fontWeight: 600 }} title="Elfogadás — végleges tervmérésként menti">✓</button>
                    <button onClick={() => onReject(p.id)} style={{ ...ctl, color: "var(--c-danger)" }} title="Elvetés — a javaslat törlése">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
