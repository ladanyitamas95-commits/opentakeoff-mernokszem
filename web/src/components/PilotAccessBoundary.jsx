import React, { useState } from "react";
import { Link } from "react-router";
import { useGoogleAuth } from "../lib/google/AuthContext.jsx";
import { isGoogleConfigured } from "../lib/google/auth.js";
import { projectHomeFolderId } from "../lib/projectHome.js";
import { PILOT_ACCESS_STATES, resolvePilotAccess } from "../lib/pilotAccess.js";
import { BlockedState, Button, LoadingState } from "./ui/index.js";

const page = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "var(--background, var(--paper-bright))",
  color: "var(--text-primary, var(--ink))",
};

const card = { width: "min(100%, 520px)" };

export function PilotAccessView({ state, onSignIn, error = "", children }) {
  if (state === PILOT_ACCESS_STATES.AUTHORIZED) return children;

  if (state === PILOT_ACCESS_STATES.LOADING) {
    return (
      <main style={page} aria-live="polite">
        <div style={card}>
          <LoadingState title="Pilot-hozzáférés ellenőrzése…">
            A privát projekt csak az ellenőrzés után nyílik meg.
          </LoadingState>
        </div>
      </main>
    );
  }

  if (state === PILOT_ACCESS_STATES.UNAUTHENTICATED) {
    return (
      <main style={page}>
        <div className="ms-card-stack" style={card}>
          <BlockedState title="Bejelentkezés szükséges">
            A MérnökSzem pilot projektjei csak a manuálisan provisionált pilot fiókkal érhetők el.
          </BlockedState>
          <Button variant="primary" onClick={onSignIn}>Bejelentkezés Google-fiókkal</Button>
          {error ? <div role="alert" className="ms-muted-copy">Sikertelen bejelentkezés: {error}</div> : null}
          <Link to="/" className="ms-muted-copy">Vissza a helyi tervméréshez</Link>
        </div>
      </main>
    );
  }

  // Includes blocked_config and every unknown state: the view itself also
  // fails closed if a caller bypasses resolvePilotAccess with a new value.
  return (
    <main style={page}>
      <div className="ms-card-stack" style={card}>
        <BlockedState title="A pilot hozzáférés nincs konfigurálva">
          A privát alkalmazáshoz hitelesített pilot fiók és kijelölt projekttárhely szükséges.
        </BlockedState>
        <Link to="/" className="ms-muted-copy">Vissza a helyi tervméréshez</Link>
      </div>
    </main>
  );
}

export default function PilotAccessBoundary({ children }) {
  const { user, ready, signIn } = useGoogleAuth();
  const [error, setError] = useState("");
  const configured = isGoogleConfigured() && Boolean(projectHomeFolderId());
  const state = resolvePilotAccess({ configured, ready, user });

  const handleSignIn = async () => {
    setError("");
    try {
      await signIn();
    } catch (e) {
      setError(String(e?.message || e));
    }
  };

  return (
    <PilotAccessView state={state} onSignIn={handleSignIn} error={error}>
      {children}
    </PilotAccessView>
  );
}
