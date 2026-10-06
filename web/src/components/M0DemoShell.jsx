import React, { useEffect } from "react";
import TakeoffCanvas from "../pages/TakeoffCanvas.jsx";
import { clearM0LocalProjectData } from "../lib/m0Demo.js";

// M0 is an internal Hungarian evaluation surface. Keep the canonical OpenTakeoff
// engine untouched; localize only rendered UI strings in demo mode.
const EXACT = new Map([
  ["Open PDF", "PDF terv megnyitása"],
  ["Add PDF", "PDF terv hozzáadása"],
  ["Choose PDF", "PDF terv kiválasztása"],
  ["Takeoffs", "Mérések"],
  ["Report", "Kimutatás"],
  ["Sheets", "Tervlapok"],
  ["Sheet", "Tervlap"],
  ["Gallery", "Tervlapok"],
  ["Select", "Kijelölés"],
  ["SEL", "KIJ."],
  ["MEAS", "MÉRÉS"],
  ["CUT", "KIVONÁS"],
  ["MARK", "JELÖLÉS"],
  ["Measure", "Mérés"],
  ["Area", "Terület"],
  ["Surface", "Falfelület"],
  ["Linear", "Hossz"],
  ["Length", "Hossz"],
  ["Count", "Darab"],
  ["Zone", "Zóna"],
  ["Pan", "Mozgatás"],
  ["Calibrate", "Kalibrálás"],
  ["Check", "Ellenőrzés"],
  ["Scale", "Méretarány"],
  ["Set scale", "Méretarány beállítása"],
  ["Check scale", "Méretarány ellenőrzése"],
  ["Action", "Műveletek"],
  ["Aids", "Segédletek"],
  ["Waste", "Ráhagyás"],
  ["Line", "Kontúr"],
  ["Fill", "Kitöltés"],
  ["Style", "Vonalstílus"],
  ["Solid", "Folytonos"],
  ["Dashed", "Szaggatott"],
  ["Dotted", "Pontozott"],
  ["Dash dot", "Pont-vonal"],
  ["Dash-dot", "Pont-vonal"],
  ["Color", "Szín"],
  ["Opacity", "Átlátszóság"],
  ["Pattern", "Mintázat"],
  ["Terrazzo / speckle", "Terrazzo / szemcsés"],
  ["Crosshatch", "Keresztsraff"],
  ["Grid", "Rács"],
  ["Dots", "Pontozott minta"],
  ["Materials", "Anyagok"],
  ["Material", "Anyag"],
  ["Quantity", "Mennyiség"],
  ["Unit", "Mértékegység"],
  ["Condition", "Mérési tétel"],
  ["Conditions", "Mérési tételek"],
  ["Height", "Magasság"],
  ["Thickness", "Vastagság"],
  ["Perimeter", "Kerület"],
  ["Room", "Helyiség"],
  ["Rooms", "Helyiségek"],
  ["Search", "Keresés"],
  ["Filter", "Szűrés"],
  ["Close", "Bezárás"],
  ["Cancel", "Mégse"],
  ["Save", "Mentés"],
  ["Apply", "Alkalmaz"],
  ["Reset", "Visszaállítás"],
  ["Delete", "Törlés"],
  ["Duplicate", "Másolat"],
  ["Rename", "Átnevezés"],
  ["Export", "Exportálás"],
  ["Import", "Importálás"],
  ["Undo", "Visszavonás"],
  ["Redo", "Ismét"],
  ["Undo last point", "Utolsó pont visszavonása"],
  ["Undo last shape", "Utolsó mérés visszavonása"],
  ["Delete selected", "Kijelölt törlése"],
  ["Finish shape", "Mérés befejezése"],
  ["Set scale first", "Előbb állítsd be a méretarányt"],
  ["Pick a condition", "Válassz mérési tételt"],
  ["Click to trace an area", "Kattints a terület körberajzolásához"],
  ["Trace the wall run", "Jelöld ki a fal nyomvonalát"],
  ["Click inside a room — it selects itself", "Kattints a helyiség belsejébe az automatikus kijelöléshez"],
  ["this wall", "ez a fal"],
  ["TOTAL", "ÖSSZESEN"],
  ["total", "összesen"],
  ["shapes on", "mérés ·"],
  ["shape on", "mérés ·"],
  ["measure_line", "Hosszmérés"],
  ["measure_polygon", "Területmérés"],
  ["measure_surface", "Falfelület-mérés"],
  ["place_count", "Darabszámlálás"],
  ["set_scale", "Méretarány beállítása"],
  ["check_dimension", "Méretellenőrzés"],
  ["one_click", "Automatikus területmérés"],
  ["zone_check", "Zónaellenőrzés"],
  ["cut_out", "Kivonás"],
  ["Local workspace", "Helyi munkaterület"],
  ["local", "helyi"],
  ["saved", "mentve"],
  ["saving…", "mentés…"],
]);

const PHRASES = [
  ["Trace a region (an apartment, a wing) — ⏎ closes it and lists every condition inside", "Rajzolj körbe egy területet (pl. lakás vagy épületszárny) — az Enter lezárja és kilistázza a benne lévő mérési tételeket"],
  ["shapes on sheet", "mérés a tervlapon"],
  ["shape on sheet", "mérés a tervlapon"],
  ["Set scale first", "Előbb állítsd be a méretarányt"],
  ["Pick a condition", "Válassz mérési tételt"],
  ["Click to trace an area", "Kattints a terület körberajzolásához"],
  ["Trace the wall run", "Jelöld ki a fal nyomvonalát"],
  ["Click inside a room — it selects itself", "Kattints a helyiség belsejébe az automatikus kijelöléshez"],
  ["TOTAL", "ÖSSZESEN"],
  ["zoom", "nagyítás"],
  ["Opened", "Megnyitva:"],
  ["sheets", "tervlap"],
  ["sheet", "tervlap"],
];

const ATTR_REPLACEMENTS = [
  ["Line style", "Vonalstílus"],
  ["Takeoffs", "Mérések"],
  ["Scale", "Méretarány"],
  ["Open PDF", "PDF terv megnyitása"],
  ["Add PDF", "PDF terv hozzáadása"],
  ["Delete", "Törlés"],
  ["Undo", "Visszavonás"],
  ["Redo", "Ismét"],
  ["Height", "Magasság"],
  ["Thickness", "Vastagság"],
  ["Area", "Terület"],
  ["Linear", "Hossz"],
  ["Count", "Darab"],
  ["Select", "Kijelölés"],
  ["Calibrate", "Kalibrálás"],
  ["Report", "Kimutatás"],
  ["Search", "Keresés"],
  ["Filter", "Szűrés"],
  ["Close", "Bezárás"],
  ["Save", "Mentés"],
];

function translateText(value) {
  const raw = String(value ?? "");
  const t = raw.trim();
  if (!t) return raw;
  if (EXACT.has(t)) return raw.replace(t, EXACT.get(t));

  let next = raw;
  for (const [from, to] of PHRASES) next = next.replaceAll(from, to);

  // Dynamic status strings used by the measurement footer/panel. Some React
  // fragments render the count, phrase and sheet name as separate text nodes,
  // so translate both full sentences and the partial fragments.
  next = next
    .replace(/\bTOTAL\b/gi, "ÖSSZESEN")
    .replace(/\b(\d+) measurements? on tervlap\b/gi, "$1 mérés a tervlapon")
    .replace(/\b(\d+) shapes? on tervlap\b/gi, "$1 mérés a tervlapon")
    .replace(/\bshapes? on\b/gi, "mérés ·")
    .replace(/\bmeasure_line\b/g, "Hosszmérés")
    .replace(/\bmeasure_polygon\b/g, "Területmérés")
    .replace(/\bmeasure_surface\b/g, "Falfelület-mérés")
    .replace(/\bplace_count\b/g, "Darabszámlálás")
    .replace(/\bset_scale\b/g, "Méretarány beállítása")
    .replace(/\bcheck_dimension\b/g, "Méretellenőrzés")
    .replace(/\bone_click\b/g, "Automatikus területmérés")
    .replace(/\bzone_check\b/g, "Zónaellenőrzés")
    .replace(/\bcut_out\b/g, "Kivonás")
    .replace(/\bWaste set to\b/gi, "Ráhagyás beállítva:")
    .replace(/\bon (\d+) conditions?\b/gi, "$1 mérési tételen")
    .replace(/\bSet scale…/g, "Méretarány beállítása…")
    .replace(/\bSet scale\.\.\./g, "Méretarány beállítása…");

  return next;
}

function translateAttribute(value) {
  let next = translateText(value);
  for (const [from, to] of ATTR_REPLACEMENTS) next = next.replaceAll(from, to);
  return next;
}

function localizeElement(el) {
  if (!el?.getAttribute) return;
  for (const attr of ["title", "aria-label", "placeholder"]) {
    const value = el.getAttribute(attr);
    if (!value) continue;
    const next = translateAttribute(value);
    if (next !== value) el.setAttribute(attr, next);
  }
}

function localizeNode(root) {
  if (!root) return;

  if (root.nodeType === Node.TEXT_NODE) {
    const next = translateText(root.nodeValue);
    if (next !== root.nodeValue) root.nodeValue = next;
    return;
  }

  localizeElement(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (n.nodeType === Node.TEXT_NODE) {
      const next = translateText(n.nodeValue);
      if (next !== n.nodeValue) n.nodeValue = next;
    } else {
      localizeElement(n);
    }
  }
}

export default function M0DemoShell() {
  useEffect(() => {
    document.documentElement.lang = "hu";
    document.title = "MérnökSzem M0 – Tervmérés";
    localizeNode(document.body);

    // React frequently updates existing text nodes (sheet load, scale, totals,
    // zoom, selection). Observe characterData too, otherwise those updates
    // revert to the upstream English labels after the initial translation.
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") {
          localizeNode(m.target);
          continue;
        }
        if (m.type === "attributes") {
          localizeElement(m.target);
          continue;
        }
        for (const n of m.addedNodes) localizeNode(n);
      }
    });
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "aria-label", "placeholder"],
    });
    return () => obs.disconnect();
  }, []);

  const reset = async () => {
    if (!window.confirm("Biztosan törlöd az M0 összes helyi projektadatát ebből a böngészőből? Ez a művelet nem vonható vissza.")) return;
    try {
      await clearM0LocalProjectData();
      window.location.reload();
    } catch (e) {
      window.alert(e?.message || String(e));
    }
  };

  const back = import.meta.env?.VITE_MERNOKSZEM_URL || "";

  return (
    <>
      <style>{`
        .m0-demo-bar {
          position: sticky;
          top: 0;
          left: auto;
          transform: none;
          z-index: 99999;
          width: fit-content;
          min-height: 34px;
          box-sizing: border-box;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 9px;
          max-width: calc(100vw - 16px);
          padding: 6px 9px;
          background: rgba(255,255,255,.96);
          color: #172033;
          border: 1px solid rgba(23,32,51,.18);
          box-shadow: 0 2px 12px rgba(0,0,0,.12);
          font-size: 11.5px;
          line-height: 1.25;
          border-radius: 6px;
          white-space: nowrap;
        }
        .m0-demo-bar a { color: inherit; font-weight: 600; text-decoration: none; }
        .m0-demo-reset {
          border: 1px solid rgba(23,32,51,.24);
          background: #fff;
          color: #172033;
          padding: 4px 7px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          white-space: nowrap;
        }
        .m0-demo-bar + .app-shell {
          height: calc(100vh - 34px) !important;
          min-height: 0;
        }
        .m0-mobile-only { display: none; }
        @media (max-width: 720px) {
          .m0-demo-bar {
            top: 0;
            left: auto;
            right: auto;
            transform: none;
            width: 100%;
            max-width: 100%;
            margin: 0;
            gap: 6px;
            padding: 5px 7px;
            font-size: 10.5px;
            overflow: hidden;
          }
          .m0-demo-note { display: none; }
          .m0-demo-back { margin-left: auto; }
          .m0-demo-reset { padding: 3px 5px; font-size: 10px; }
          .m0-desktop-only { display: none; }
          .m0-mobile-only { display: inline; }
        }
      `}</style>
      <div className="m0-demo-bar">
        <strong>M0 – Tervmérés</strong>
        <span className="m0-demo-note" style={{ opacity:.72 }}>Helyi mód: a terv ebben a böngészőben marad; AI és felhőszinkron kikapcsolva.</span>
        {back ? <a className="m0-demo-back" href={back}><span className="m0-desktop-only">Vissza a MérnökSzemhez</span><span className="m0-mobile-only">MérnökSzem</span></a> : null}
        <button type="button" className="m0-demo-reset" onClick={reset}>
          <span className="m0-desktop-only">Helyi projektadatok törlése</span>
          <span className="m0-mobile-only">Adatok törlése</span>
        </button>
      </div>
      <TakeoffCanvas />
    </>
  );
}
