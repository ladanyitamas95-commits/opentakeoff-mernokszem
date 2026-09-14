export const PILOT_ACCESS_STATES = Object.freeze({
  LOADING: "loading",
  UNAUTHENTICATED: "unauthenticated",
  BLOCKED_CONFIG: "blocked_config",
  AUTHORIZED: "authorized",
});

export const PILOT_APP_ROUTES = Object.freeze({
  local: "/",
  foundation: "/ui-foundation",
  app: "/app",
  projects: "/app/projects",
});

function hasUserIdentity(user) {
  if (!user || typeof user !== "object" || Array.isArray(user)) return false;
  return [user.sub, user.email].some((value) => typeof value === "string" && value.trim());
}

// Pure access-state mapping. Only an explicitly configured, ready session with
// a real user identity can authorize. Missing, malformed and future/unknown
// inputs fail closed instead of falling through to private project content.
/** @param {unknown} [input] */
export function resolvePilotAccess(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const { googleConfigured, projectsRootConfigured, ready, user } = /** @type {{googleConfigured?: unknown, projectsRootConfigured?: unknown, ready?: unknown, user?: unknown}} */ (source);
  if (googleConfigured !== true || projectsRootConfigured !== true) {
    return PILOT_ACCESS_STATES.BLOCKED_CONFIG;
  }
  if (ready !== true) return PILOT_ACCESS_STATES.LOADING;
  if (!hasUserIdentity(user)) return PILOT_ACCESS_STATES.UNAUTHENTICATED;
  return PILOT_ACCESS_STATES.AUTHORIZED;
}

export function isPilotAppPath(pathname) {
  return typeof pathname === "string" && /^\/app(?:[/?#]|$)/.test(pathname);
}
