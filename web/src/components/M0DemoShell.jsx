import React, { useEffect, useState } from "react";
import TakeoffCanvas from "../pages/TakeoffCanvas.jsx";
import { clearM0LocalProjectData } from "../lib/m0Demo.js";

const EXACT = new Map([
  ["Open PDF", "PDF terv megnyitása"], ["Add PDF", "PDF terv hozzáadása"], ["Choose PDF", "PDF terv kiválasztása"],
  ["Takeoffs", "Mérések"], ["Report", "Kimutatás"], ["Sheets", "Tervlapok"], ["Sheet", "Tervlap"], ["Gallery", "Tervlapok"],
  ["Select", "Kijelölés"], ["SEL", "KIJ."], ["MEAS", "MÉRÉS"], ["CUT", "KIVONÁS"], ["MARK", "JELÖLÉS"],
  ["Measure", "Mérés"], ["Area", "Terület"], ["Surface", "Falfelület"], ["Linear", "Hossz"], ["Length", "Hossz"], ["Count", "Darab"],
  ["Zone", "Zóna"], ["Pan", "Mozgatás"], ["Calibrate", "Kalibrálás"], ["Check", "Ellenőrzés"],
  ["Scale", "Méretarány"], ["Set scale", "Méretarány beállítása"], ["Check scale", "Méretarány ellenőrzése"],
  ["Action", "Műveletek"], ["Aids", "Segédletek"], ["Waste", "Ráhagyás"], ["Line", "Kontúr"], ["Fill", "Kitöltés"],
  ["Style", "Vonalstílus"], ["Solid", "Folytonos"], ["Dashed", "Szaggatott"], ["Dotted", "Pontozott"],
  ["Dash dot", "Pont-vonal"], ["Dash-dot", "Pont-vonal"], ["Color", "Szín"], ["Opacity", "Átlátszóság"], ["Pattern", "Mintázat"],
  ["Terrazzo / speckle", "Terrazzo / szemcsés"], ["Crosshatch", "Keresztsraff"], ["Grid", "Rács"], ["Dots", "Pontozott minta"],
  ["Materials", "Anyagok"], ["Material", "Anyag"], ["Quantity", "Mennyiség"], ["Unit", "Mértékegység"],
  ["Condition", "Mérési tétel"], ["Conditions", "Mérési tételek"], ["Height", "Magasság"], ["Thickness", "Vastagság"], ["Perimeter", "Kerület"],
  ["Room", "Helyiség"], ["Rooms", "Helyiségek"], ["Search", "Keresés"], ["Filter", "Szűrés"], ["Close", "Bezárás"],
  ["Cancel", "Mégse"], ["Save", "Mentés"], ["Apply", "Alkalmaz"], ["Reset", "Visszaállítás"], ["Delete", "Törlés"],
  ["Duplicate", "Másolat"], ["Rename", "Átnevezés"], ["Export", "Exportálás"], ["Import", "Importálás"],
  ["Undo", "Visszavonás"], ["Redo", "Ismét"], ["Undo last point", "Utolsó pont visszavonása"],
  ["Undo last shape", "Utolsó mérés visszavonása"], ["Delete selected", "Kijelölt törlése"], ["Finish shape", "Mérés befejezése"],
  ["Set scale first", "Előbb állítsd be a méretarányt"], ["Pick a condition", "Válassz mérési tételt"],
  ["Click to trace an area", "Kattints a terület körberajzolásához"], ["Trace the wall run", "Jelöld ki a fal nyomvonalát"],
  ["Click inside a room — it selects itself", "Kattints a helyiség belsejébe az automatikus kijelöléshez"], ["this wall", "ez a fal"],
  ["TOTAL", "ÖSSZESEN"], ["total", "összesen"], ["shapes on", "mérés ·"], ["shape on", "mérés ·"],
  ["measure_line", "Hosszmérés"], ["measure_polygon", "Területmérés"], ["measure_surface", "Falfelület-mérés"],
  ["place_count", "Darabszámlálás"], ["set_scale", "Méretarány beállítása"], ["check_dimension", "Méretellenőrzés"],
  ["one_click", "Automatikus területmérés"], ["zone_check", "Zónaellenőrzés"], ["cut_out", "Kivonás"],
  ["Local workspace", "Helyi munkaterület"], ["local", "helyi"], ["saved", "mentve"], ["saving…", "mentés…"],
]);

const PHRASES = [
  ["Trace a region (an apartment, a wing) — ⏎ closes it and lists every condition inside", "Rajzolj körbe egy területet (pl. lakás vagy épületszárny) — az Enter lezárja és kilistázza a benne lévő mérési tételeket"],
  ["shapes on sheet", "mérés a tervlapon"], ["shape on sheet", "mérés a tervlapon"],
  ["Set scale first", "Előbb állítsd be a méretarányt"], ["Pick a condition", "Válassz mérési tételt"],
  ["Click to trace an area", "Kattints a terület körberajzolásához"], ["Trace the wall run", "Jelöld ki a fal nyomvonalát"],
  ["Click inside a room — it selects itself", "Kattints a helyiség belsejébe az automatikus kijelöléshez"],
  ["TOTAL", "ÖSSZESEN"], ["zoom", "nagyítás"], ["Opened", "Megnyitva:"], ["sheets", "tervlap"], ["sheet", "tervlap"],
];

const ATTR_REPLACEMENTS = [
  ["Line style", "Vonalstílus"], ["Takeoffs", "Mérések"], ["Scale", "Méretarány"], ["Open PDF", "PDF terv megnyitása"],
  ["Add PDF", "PDF terv hozzáadása"], ["Delete", "Törlés"], ["Undo", "Visszavonás"], ["Redo", "Ismét"],
  ["Height", "Magasság"], ["Thickness", "Vastagság"], ["Area", "Terület"], ["Linear", "Hossz"], ["Count", "Darab"],
  ["Select", "Kijelölés"], ["Calibrate", "Kalibrálás"], ["Report", "Kimutatás"], ["Search", "Keresés"], ["Filter", "Szűrés"],
  ["Close", "Bezárás"], ["Save", "Mentés"],
];

function translateText(value) {
  const raw = String(value ?? "");
  const t = raw.trim();
  if (!t) return raw;
  if (EXACT.has(t)) return raw.replace(t, EXACT.get(t));
  let next = raw;
  for (const [from, to] of PHRASES) next = next.replaceAll(from, to);
  return next
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
    } else localizeElement(n);
  }
}

function smallestContaining(tokens, selector = "div") {
  const els = Array.from(document.querySelectorAll(selector)).filter((el) => {
    const t = el.textContent || "";
    return tokens.every((token) => t.includes(token));
  });
  els.sort((a, b) => (a.textContent || "").length - (b.textContent || "").length);
  return els[0] || null;
}

function commonAncestor(nodes) {
  if (!nodes.length) return null;
  let cur = nodes[0];
  while (cur && cur !== document.body) {
    if (nodes.every((n) => cur.contains(n))) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function tagMobileSurfaces() {
  if (!window.matchMedia?.("(max-width: 720px)").matches) return;

  const condition = smallestContaining(["Ráhagyás", "Kontúr", "Vonalstílus"]);
  condition?.classList.add("m0-mobile-condition-sheet");

  const summary = smallestContaining(["ÖSSZESEN", "nagyítás"]);
  summary?.classList.add("m0-mobile-summary-sheet");

  const rail = smallestContaining(["KIJ.", "MÉRÉS", "KIVONÁS"]);
  if (rail) {
    rail.classList.add("m0-mobile-tool-rail");
    const parent = rail.parentElement;
    const r = parent?.getBoundingClientRect?.();
    if (parent && r && r.width <= 150 && r.height >= 240) parent.classList.add("m0-mobile-tool-rail-slot");
  }

  const sheetLabel = Array.from(document.querySelectorAll("*"))
    .find((el) => el.children.length === 0 && (el.textContent || "").trim() === "TERVLAPOK");
  sheetLabel?.parentElement?.classList.add("m0-mobile-sheet-strip");

  const advanced = Array.from(document.querySelectorAll("[title]"))
    .filter((el) => /Markups on these sheets|Stamps —|RFI register|Takeoffs —|Revisions —|PDF layers —|Roll goods —/.test(el.getAttribute("title") || ""));
  const advancedRail = commonAncestor(advanced.slice(0, Math.min(advanced.length, 4)));
  advancedRail?.classList.add("m0-mobile-advanced-rail");
}

export default function M0DemoShell() {
  const [mobilePanel, setMobilePanel] = useState("none");

  useEffect(() => {
    document.documentElement.lang = "hu";
    document.title = "MérnökSzem M0 – Tervmérés";
    localizeNode(document.body);
    tagMobileSurfaces();

    let raf = 0;
    const refresh = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        localizeNode(document.body);
        tagMobileSurfaces();
      });
    };

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") localizeNode(m.target);
        else if (m.type === "attributes") localizeElement(m.target);
        else for (const n of m.addedNodes) localizeNode(n);
      }
      refresh();
    });
    obs.observe(document.body, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["title", "aria-label", "placeholder"],
    });
    window.addEventListener("resize", refresh);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      window.removeEventListener("resize", refresh);
    };
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
  const togglePanel = (name) => setMobilePanel((p) => p === name ? "none" : name);

  return (
    <>
      <style>{`
        .m0-demo-bar {
          position: fixed; top: 6px; left: 50%; transform: translateX(-50%); z-index: 99999;
          display: flex; align-items: center; gap: 9px; max-width: calc(100vw - 16px); padding: 6px 9px;
          background: rgba(255,255,255,.96); color: #172033; border: 1px solid rgba(23,32,51,.18);
          box-shadow: 0 2px 12px rgba(0,0,0,.12); font-size: 11.5px; line-height: 1.25; border-radius: 6px; white-space: nowrap;
        }
        .m0-demo-bar a { color: inherit; font-weight: 600; text-decoration: none; }
        .m0-demo-reset, .m0-mobile-action {
          border: 1px solid rgba(23,32,51,.24); background: #fff; color: #172033; padding: 4px 7px;
          border-radius: 5px; cursor: pointer; font-size: 11px; white-space: nowrap;
        }
        .m0-mobile-only, .m0-mobile-action, .m0-mobile-backdrop { display: none; }

        @media (max-width: 720px) {
          html, body, #root { height: 100%; overflow: hidden !important; overscroll-behavior: none; }
          body { position: fixed; inset: 0; width: 100%; }
          .m0-canvas-wrap { height: 100dvh; overflow: hidden; touch-action: none; }
          .m0-canvas-wrap canvas, .m0-canvas-wrap svg { touch-action: none; }

          .m0-demo-bar {
            top: 3px; left: 4px; right: 4px; transform: none; width: auto; max-width: none; height: 34px;
            box-sizing: border-box; gap: 4px; padding: 3px 5px; font-size: 10.5px; overflow: hidden; border-radius: 7px;
          }
          .m0-demo-bar strong { flex: 0 0 auto; max-width: 105px; overflow: hidden; text-overflow: ellipsis; }
          .m0-demo-note, .m0-demo-reset { display: none !important; }
          .m0-demo-back { margin-left: auto; padding: 4px 5px; border-radius: 5px; background: rgba(23,32,51,.06); }
          .m0-desktop-only { display: none; }
          .m0-mobile-only, .m0-mobile-action { display: inline-flex; align-items: center; justify-content: center; }
          .m0-mobile-action { padding: 4px 6px; font-size: 10px; font-weight: 650; }
          .m0-mobile-action.active { background: #172033; color: white; }

          .m0-mobile-backdrop {
            display: block; position: fixed; inset: 38px 0 0; z-index: 99970; background: rgba(0,0,0,.26);
            backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px);
          }

          .m0-mobile-condition-sheet, .m0-mobile-summary-sheet {
            position: fixed !important; left: 8px !important; right: 8px !important; width: auto !important;
            z-index: 99980 !important; background: var(--paper-bright, #111) !important;
            border: 1px solid var(--ink-faint, rgba(255,255,255,.2)) !important;
            box-shadow: 0 12px 38px rgba(0,0,0,.38) !important; border-radius: 8px !important;
            overflow: auto !important; -webkit-overflow-scrolling: touch;
          }
          .m0-mobile-condition-sheet { top: 44px !important; max-height: 43dvh !important; padding: 8px !important; }
          .m0-mobile-summary-sheet { top: auto !important; bottom: 72px !important; max-height: 36dvh !important; padding: 10px !important; }
          .m0-panel-none .m0-mobile-condition-sheet, .m0-panel-summary .m0-mobile-condition-sheet { display: none !important; }
          .m0-panel-none .m0-mobile-summary-sheet, .m0-panel-condition .m0-mobile-summary-sheet { display: none !important; }

          .m0-mobile-tool-rail-slot { width: 0 !important; min-width: 0 !important; flex: 0 0 0 !important; overflow: visible !important; }
          .m0-mobile-tool-rail {
            position: fixed !important; left: 6px !important; right: 6px !important; bottom: 6px !important; top: auto !important;
            width: auto !important; height: 54px !important; transform: none !important; z-index: 99960 !important;
            display: flex !important; flex-direction: row !important; align-items: center !important; gap: 4px !important;
            padding: 4px !important; overflow-x: auto !important; overflow-y: hidden !important; -webkit-overflow-scrolling: touch;
            background: rgba(8,10,14,.92) !important; border: 1px solid rgba(255,255,255,.14) !important;
            border-radius: 9px !important; box-shadow: 0 6px 24px rgba(0,0,0,.32) !important;
          }
          .m0-mobile-tool-rail > * { flex: 0 0 auto !important; }
          .m0-mobile-tool-rail button { min-width: 44px !important; min-height: 44px !important; padding: 4px !important; }

          .m0-mobile-advanced-rail { display: none !important; }
          .m0-mobile-sheet-strip { min-height: 32px !important; max-height: 38px !important; padding-top: 2px !important; padding-bottom: 2px !important; }

          footer.ink-panel.ticks {
            position: fixed !important; left: 6px !important; right: 6px !important; bottom: 64px !important; z-index: 99950 !important;
            width: auto !important; height: 24px !important; min-height: 24px !important; padding: 0 7px !important; gap: 6px !important;
            font-size: 9px !important; border-radius: 6px !important; background: rgba(8,10,14,.88) !important;
            pointer-events: none; opacity: .9;
          }
          footer.ink-panel.ticks span[aria-hidden="true"] { display: none !important; }
          footer.ink-panel.ticks span[style*="min-width: 150px"] { display: none !important; }

          .m0-canvas-wrap input, .m0-canvas-wrap select, .m0-canvas-wrap button { font-size: max(11px, 16px); }
          .m0-mobile-condition-sheet input, .m0-mobile-condition-sheet select { min-height: 34px; }
        }
      `}</style>

      <div className="m0-demo-bar">
        <strong>M0 – Tervmérés</strong>
        <span className="m0-demo-note" style={{ opacity:.72 }}>Helyi mód: a terv ebben a böngészőben marad; AI és felhőszinkron kikapcsolva.</span>
        <button type="button" className={`m0-mobile-action ${mobilePanel === "condition" ? "active" : ""}`} onClick={() => togglePanel("condition")}>Tétel</button>
        <button type="button" className={`m0-mobile-action ${mobilePanel === "summary" ? "active" : ""}`} onClick={() => togglePanel("summary")}>Összesítő</button>
        {back ? <a className="m0-demo-back" href={back}><span className="m0-desktop-only">Vissza a MérnökSzemhez</span><span className="m0-mobile-only">MérnökSzem</span></a> : null}
        <button type="button" className="m0-demo-reset" onClick={reset}>Helyi projektadatok törlése</button>
      </div>

      {mobilePanel !== "none" && <button type="button" aria-label="Panel bezárása" className="m0-mobile-backdrop" onClick={() => setMobilePanel("none")} />}

      <div className={`m0-canvas-wrap m0-panel-${mobilePanel}`}>
        <TakeoffCanvas />
      </div>
    </>
  );
}
