// The in-app manual — the short version, reachable without leaving the canvas.
//
// docs/USER_GUIDE.md is 705 lines and good, and until now NOTHING in the app
// pointed at it: a first-time visitor to the demo had no way to learn that a
// manual exists. (The one icon that reads as help is the RFI hexagon, whose own
// comment calls it "a question motif".) This is the overlay that closes that
// gap — the five-minute path plus the real key bindings, with the long-form
// manual one link away.
//
// DELIBERATELY NOT a rendering of the markdown. Bundling a parser to re-display
// a document that lives in the repo buys a dependency and a second thing to
// keep true; what an estimator needs mid-trace is the shortcut and the next
// step, not sixteen sections. The bindings below are transcribed from
// USER_GUIDE.md §15, which is itself maintained against the code — if a
// shortcut changes, §15 and this table move together.
import { oneClickEnabled, commandBoxEnabled } from "../lib/gate.js";
import { useEffect } from "react";
import { Z } from "../lib/ui.js";
import { keyLabel, keyText, isApplePlatform } from "../lib/keys.ts";

const GUIDE_URL = "https://github.com/Kentucky-ai/opentakeoff/blob/main/docs/USER_GUIDE.md";

function Kbd({ children }) {
  return (
    <kbd style={{
      fontFamily: "var(--f-mono)", fontSize: 11, padding: "2px 6px", border: "1px solid var(--ink-faint)",
      borderBottomWidth: 2, borderRadius: 5, background: "var(--paper-bright)", color: "var(--ink)", whiteSpace: "nowrap",
    }}>{children}</kbd>
  );
}

function Keys({ combo }) {
  // Labels only — the handlers already treat ⌘ and Ctrl as one key. See lib/keys.ts.
  const apple = isApplePlatform();
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {combo.map((k, i) => <Kbd key={i}>{keyLabel(k, apple)}</Kbd>)}
    </span>
  );
}

function Table({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "7px 14px", alignItems: "baseline" }}>
      {rows.map(([combo, what], i) => (
        <div key={i} style={{ display: "contents" }}>
          <div style={{ justifySelf: "start" }}><Keys combo={combo} /></div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.45 }}>{keyText(what)}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="t-label" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

const START = [
  ["Terv feltöltése", "Húzz egy PDF-et, képet vagy ZIP-tervcsomagot a munkaterületre. A fájlok a gépeden maradnak."],
  ["Méretarány beállítása", "Minden mennyiség ettől függ. Válaszd ki a tervlapon megadott méretarányt, vagy kalibrálj két ismert távolságú ponttal."],
  ["Tétel hozzáadása", "A tétel egy mérendő anyag vagy szerkezet, például CPT-1, LVT vagy lábazat. Adj meg kódot, hulladékszázalékot és színt."],
  ["Mérés", oneClickEnabled() ? "Kattints egy helyiségbe az automatikus területfelismeréshez, vagy mérj kézzel a Terület, Téglalap, Hossz és Darabszám eszközzel." : "Mérj kézzel a Terület, Téglalap, Hossz és Darabszám eszközzel. Kattints a sarokpontokra, majd az ⏎ lezárja az alakzatot."],
  ["Riport megnyitása", "A Riport tételenként összesít, hozzáadja a hulladékot, és exportálható rendelési mennyiséget készít."],
];

export const TOOLS = [
  ...(oneClickEnabled() ? [[["O"], "Terület egy kattintással — kattints a helyiség belsejébe"]] : []),
  [["A"], "Terület"], [["R"], "Téglalap"], [["L"], "Hossz"], [["Q"], "Egyenes ⇄ íves vonal"],
  [["S"], "Falfelület"], [["C"], "Darabszám"],
  [["D"], "Levonási alakzat"], [["⇧", "D"], "Levonási téglalap"],
  [["H"], "Kiemelő"], [["K"], "Méret ellenőrzése a tervhez képest"],
  [["N"], "Méretvonal — önálló hosszméret a terv méretarányával"],
  [["V"], "Kijelölés"], [["G"], "Tervlapgaléria"],
  [["1", "–", "9"], "Tétel aktiválása"],
  ...(commandBoxEnabled() ? [[["hold", "M"], "Push-to-talk dictation — release runs it, Esc discards"]] : []),
];

export const DRAW = [
  [["⏎"], oneClickEnabled() ? "Alakzat lezárása; automatikus mérésnél a kijelölés létrehozása" : "Alakzat lezárása"],
  [["⌫"], "Visszalépés egy lépéssel"],
  [["⌘", "Z"], "Visszavonás"],
  [["⇧", "⌘", "Z"], "Ismét"],
  [["Esc"], "Aktuális művelet megszakítása"],
  [["hold", "⇧"], "Force the 45° angle lock at any cursor angle"],
  ...(oneClickEnabled() ? [[["⌥", "click"], "In One-Click: carve a cutout inside a selected space"]] : []),
  [["⇧", "click"], "Insert a vertex at an edge midpoint, and drag it"],
  [["⌘", "C"], "Másolás"], [["⌘", "V"], "Beillesztés a kurzorhoz"], [["⌘", "D"], "Duplikálás"],
  [["T"], "Trace another one like the selected shape — its condition and its tool arm, the selection drops"],
];

export const VIEW = [
  [["görgetés"], "Nagyítás a kurzor irányába"],
  [["két ujj"], "Terv mozgatása"],
  [["⇧", "görgetés"], "Terv mozgatása"],
  [["hold", "Space"], "Pan with any tool armed — as does middle-drag or right-drag"],
  [["F"], "Fókuszmód — kezelőfelület elrejtése"],
  [["?"], "Súgó megnyitása"],
];

export default function UserGuide({ onClose }) {
  // The dialog closes ITSELF, and that is not a style preference. The canvas's
  // Escape chain lives in an effect that early-returns while the plan-set
  // gallery is up — so a guide dismissed from there would have swallowed the
  // key and stayed open, which is precisely the first-time visitor who came
  // looking for the manual. Owning the key here makes dismissal independent of
  // whatever view is behind. Capture phase + stopPropagation so the same press
  // cannot also back out of a trace the user cannot see behind the overlay.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: Z.modal, background: "var(--scrim)",
        display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflow: "auto",
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="MérnökSzem TakeOff felhasználói útmutató"
        className="panel"
        style={{
          width: "min(760px, 100%)", background: "var(--paper-bright)", color: "var(--ink)",
          border: "1px solid var(--ink-faint)", borderRadius: 0, padding: "22px 26px 26px",
          boxShadow: "var(--shadow-2)",
        }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <strong style={{ fontFamily: "var(--f-display)", fontSize: 17, letterSpacing: "-0.02em" }}>A MérnökSzem TakeOff használata</strong>
          <button onClick={onClose} title="Bezárás (Esc)"
            style={{ background: "none", border: "none", color: "var(--ink-soft)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 22px" }}>
          Böngészőben működő tervmérő felület. Tölts fel tervet, állítsd be a méretarányt,
          mérd fel a tételeket, majd készíts mennyiségkimutatást.
        </p>

        <Section title="Tervmérés öt perc alatt">
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9 }}>
            {START.map(([t, d]) => (
              <li key={t} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>{t}</strong>
                <span style={{ color: "var(--ink-soft)" }}> — {keyText(d)}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Eszközök"><Table rows={TOOLS} /></Section>
        <Section title="Rajzolás és szerkesztés"><Table rows={DRAW} /></Section>
        <Section title="Navigáció"><Table rows={VIEW} /></Section>

        <div style={{ borderTop: "1px solid var(--ink-faint)", paddingTop: 14, fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
          Ez a rövid útmutató. A teljes, jelenleg angol nyelvű kézikönyv a tételeket, jelöléseket,
          RFI-ket, revíziókat, riportokat és az AI/MCP használatot is bemutatja —{" "}
          <a href={GUIDE_URL} target="_blank" rel="noreferrer" style={{ color: "var(--cobalt)" }}>teljes kézikönyv megnyitása</a>.
        </div>
      </div>
    </div>
  );
}
