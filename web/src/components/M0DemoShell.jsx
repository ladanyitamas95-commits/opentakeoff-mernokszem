import React, { useEffect } from "react";
import TakeoffCanvas from "../pages/TakeoffCanvas.jsx";
import { clearM0LocalProjectData } from "../lib/m0Demo.js";

const EXACT = new Map([
  ["Open PDF", "PDF terv megnyitása"],
  ["Takeoffs", "Mérések"],
  ["Report", "Kimutatás"],
  ["Sheets", "Tervlapok"],
  ["Gallery", "Tervlapok"],
  ["Select", "Kijelölés"],
  ["Area", "Terület"],
  ["Linear", "Hossz"],
  ["Count", "Darab"],
  ["Calibrate", "Kalibrálás"],
  ["Check", "Ellenőrzés"],
  ["Scale", "Méretarány"],
  ["Action", "Műveletek"],
  ["Aids", "Segédletek"],
  ["Undo last point", "Utolsó pont visszavonása"],
  ["Undo last shape", "Utolsó mérés visszavonása"],
  ["Redo", "Ismét"],
  ["Delete selected", "Kijelölt törlése"],
  ["Finish shape", "Mérés befejezése"],
  ["Local workspace", "Helyi munkaterület"],
  ["local", "helyi"],
  ["saved", "mentve"],
  ["saving…", "mentés…"],
]);

function translateText(value) {
  const raw = String(value ?? "");
  const t = raw.trim();
  if (EXACT.has(t)) return raw.replace(t, EXACT.get(t));
  if (t.startsWith("Scale — ")) return raw.replace(t, "Méretarány — " + t.slice(8));
  if (t.startsWith("Opened ") && t.includes(" sheet")) return raw.replace(t, t.replace(/^Opened /, "Megnyitva: ").replace(/ sheets?/, " tervlap"));
  return raw;
}

function localizeNode(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const next = translateText(n.nodeValue);
    if (next !== n.nodeValue) n.nodeValue = next;
  }
  if (root.querySelectorAll) {
    root.querySelectorAll("[title]").forEach((el) => {
      const title = el.getAttribute("title") || "";
      const replacements = [
        ["Agent —", "AI asszisztens —"],
        ["Takeoffs —", "Mérések —"],
        ["Scale", "Méretarány"],
        ["Open PDF", "PDF terv megnyitása"],
        ["Delete", "Törlés"],
      ];
      let next = title;
      for (const [a,b] of replacements) next = next.replaceAll(a,b);
      if (next !== title) el.setAttribute("title", next);
    });
  }
}

export default function M0DemoShell() {
  useEffect(() => {
    document.title = "MérnökSzem M0 – Tervmérés";
    localizeNode(document.body);
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) localizeNode(n.nodeType === Node.TEXT_NODE ? n.parentNode : n);
      }
    });
    obs.observe(document.body, { subtree: true, childList: true });
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
      <div style={{ position:"fixed", top:8, left:"50%", transform:"translateX(-50%)", zIndex:99999, display:"flex", alignItems:"center", gap:10, padding:"7px 10px", background:"rgba(255,255,255,.96)", color:"#172033", border:"1px solid rgba(23,32,51,.18)", boxShadow:"0 2px 12px rgba(0,0,0,.12)", fontSize:12, borderRadius:6 }}>
        <strong>MérnökSzem M0 – belső demo</strong>
        <span style={{ opacity:.72 }}>A terv helyben, ebben a böngészőben marad. AI és felhőszinkron kikapcsolva.</span>
        {back ? <a href={back} style={{ color:"inherit", fontWeight:600 }}>Vissza a MérnökSzemhez</a> : null}
        <button type="button" onClick={reset} style={{ border:"1px solid rgba(23,32,51,.24)", background:"#fff", color:"#172033", padding:"4px 7px", borderRadius:4, cursor:"pointer", fontSize:11 }}>Helyi projektadatok törlése</button>
      </div>
      <TakeoffCanvas />
    </>
  );
}
