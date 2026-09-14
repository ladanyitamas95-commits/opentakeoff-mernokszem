import React, { useState } from "react";
import { Link } from "react-router";
import { useGoogleAuth } from "../lib/google/AuthContext.jsx";
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

export function PilotAccessView({ state, onSignIn, signInFailed = false, children }) {
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
            A MérnökSzem pilot projektjei csak az előzetesen engedélyezett pilotfiókkal érhetők el.
          </BlockedState>
          <Button variant="primary" onClick={onSignIn}>Bejelentkezés Google-fiókkal</Button>
          {signInFailed ? <div role="alert" className="ms-muted-copy">A bejelentkezés nem sikerült. Próbáld újra.</div> : null}
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

export function PilotAccessBoundaryContent({
  googleConfigured = false,
  projectsRootConfigured = false,
  ready = false,
  user = null,
  onSignIn,
  signInFailed = false,
  children,
}) {
  const state = resolvePilotAccess({
    googleConfigured,
    projectsRootConfigured,
    ready,
    user,
  });
  return (
    <PilotAccessView state={state} onSignIn={onSignIn} signInFailed={signInFailed}>
      {children}
    </PilotAccessView>
  );
}

export default function PilotAccessBoundary({ children }) {
  const { user, ready, configured: googleConfigured, signIn } = useGoogleAuth();
  const [signInFailed, setSignInFailed] = useState(false);
  const projectsRootConfigured = Boolean(projectHomeFolderId());

  const handleSignIn = async () => {
    setSignInFailed(false);
    try {
      await signIn();
    } catch {
      setSignInFailed(true);
    }
  };

  return (
    <PilotAccessBoundaryContent
      googleConfigured={googleConfigured}
      projectsRootConfigured={projectsRootConfigured}
      ready={ready}
      user={user}
      onSignIn={handleSignIn}
      signInFailed={signInFailed}
    >
      {children}
    </PilotAccessBoundaryContent>
  );
}
