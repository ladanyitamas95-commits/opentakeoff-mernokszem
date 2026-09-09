// AI settings — bring your own key. The single always-visible pixel of the AI
// seam; everything else stays dormant until this is configured (ai.js).
import { useState } from "react";
import { Icon } from "../brand/icons.jsx";
import { aiConfig, saveAiConfig } from "../lib/ai.js";

export default function AiSettings({ onClose }) {
  const [cfg, setCfg] = useState(aiConfig);
  const set = (k) => (e) => setCfg((c) => ({ ...c, [k]: e.target.value }));
  const save = () => { saveAiConfig(cfg); onClose(true); };
  const clear = () => { saveAiConfig({ endpoint: "", apiKey: "", model: "", provider: "" }); onClose(true); };

  return (
    <div onClick={() => onClose(false)} style={{ position: "absolute", inset: 0, zIndex: 60, background: "rgba(14,26,46,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="panel" style={{ width: 520, maxWidth: "100%", maxHeight: "90%", overflow: "auto", background: "var(--paper-bright)", boxShadow: "var(--shadow-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--ink)" }}>
          <Icon name="target" size={16} />
          <strong style={{ fontFamily: "var(--f-display)", fontSize: 15 }}>AI-beállítások — saját API-kulcs</strong>
        </div>
        <div style={{ padding: 16, fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>
          <p style={{ marginTop: 0 }}>
            A MérnökSzem TakeOff az <strong>általad megadott</strong> képfeldolgozó modellel olvashat adatokat
            a tervről, például a rajzolt méretarányt. OpenAI- vagy Anthropic-kompatibilis felhős végpontot,
            illetve a saját gépeden futó helyi modellt is használhatsz.
          </p>
          <p style={{ margin: "0 0 10px", color: "var(--c-positive)", fontWeight: 600 }}>
            Csak AI-művelet indításakor küldjük el a szükséges tervrészlet képét és a kérdést.
            A teljes terv, a fájl- és projektnevek, valamint a mennyiségkimutatás nem kerül elküldésre.
          </p>
          <label style={{ display: "block", margin: "6px 0" }}>
            <span className="field-label">Végpont</span>
            <input value={cfg.endpoint} onChange={set("endpoint")} placeholder="https://… or http://localhost:1234"
              className="field-input" style={{ marginTop: 4 }} />
          </label>
          <label style={{ display: "block", margin: "6px 0" }}>
            <span className="field-label">API-típus</span>
            <select value={cfg.provider} onChange={set("provider")} className="field-input" style={{ marginTop: 4 }}>
              <option value="openai">OpenAI-kompatibilis API (a legtöbb helyi modell)</option>
              <option value="anthropic">Anthropic-kompatibilis API</option>
            </select>
          </label>
          <label style={{ display: "block", margin: "6px 0" }}>
            <span className="field-label">Modell</span>
            <input value={cfg.model} onChange={set("model")} placeholder="képfeldolgozásra képes modell azonosítója"
              className="field-input" style={{ marginTop: 4 }} />
          </label>
          <label style={{ display: "block", margin: "6px 0" }}>
            <span className="field-label">API-kulcs (helyi modellnél üresen hagyható)</span>
            <input type="password" value={cfg.apiKey} onChange={set("apiKey")} placeholder="csak ebben a böngészőben tároljuk"
              className="field-input" style={{ marginTop: 4 }} />
          </label>
          <p style={{ background: "var(--paper-shadow)", padding: "8px 10px", fontSize: 12.5, marginTop: 10 }}>
            A kulcsot <strong>ebben a böngészőben</strong> tároljuk. A böngészőprofilhoz hozzáférő személyek
            kiolvashatják, ezért visszavonható kulcsot használj. Üres beállítások mellett az AI-funkciók nem
            indulnak el. A végpontnak engedélyeznie kell a böngészőből érkező CORS-kéréseket.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--ink-faint)" }}>
          <button className="btn-ghost" onClick={clear} style={{ color: "var(--c-danger)" }}>Törlés</button>
          <span style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={() => onClose(false)}>Mégse</button>
            <button className="btn-primary" onClick={save}>Mentés</button>
          </span>
        </div>
      </div>
    </div>
  );
}
