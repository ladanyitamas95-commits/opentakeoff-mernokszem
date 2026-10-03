export function m0DemoEnabled() {
  try { return import.meta.env?.VITE_M0_DEMO === "1"; } catch { return false; }
}

const DB_NAME = "opentakeoff";
const OWNED_PREFIXES = ["opentakeoff_", "m0_"];

function clearOwnedStorage(storage) {
  try {
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && OWNED_PREFIXES.some((p) => k.startsWith(p))) keys.push(k);
    }
    for (const k of keys) storage.removeItem(k);
  } catch { /* private mode / disabled storage */ }
}

export async function clearM0LocalProjectData() {
  if (!m0DemoEnabled()) return;
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error("IndexedDB törlés sikertelen."));
    req.onblocked = () => reject(new Error("A helyi adatbázist egy másik OpenTakeoff lap még használja. Zárd be a többi M0 lapot, majd próbáld újra."));
  });

  clearOwnedStorage(localStorage);
  clearOwnedStorage(sessionStorage);

  // Remove only caches owned by this app. Never touch unrelated site data.
  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names
        .filter((name) => /^(opentakeoff|m0[-_])/i.test(name))
        .map((name) => caches.delete(name)));
    }
  } catch { /* CacheStorage unavailable */ }

  // This Railway hostname is dedicated to M0; no service worker is required.
  // Removing registrations prevents an older worker from retaining stale plan
  // responses or initiating network work before the current app boots.
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }
  } catch { /* ServiceWorker unavailable */ }
}
