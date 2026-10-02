export function m0DemoEnabled() {
  try { return import.meta.env?.VITE_M0_DEMO === "1"; } catch { return false; }
}

const DB_NAME = "opentakeoff";

export async function clearM0LocalProjectData() {
  if (!m0DemoEnabled()) return;
  try {
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error("IndexedDB törlés sikertelen."));
      req.onblocked = () => reject(new Error("A helyi adatbázist egy másik OpenTakeoff lap még használja. Zárd be a többi M0 lapot, majd próbáld újra."));
    });
  } catch (e) {
    throw e;
  }
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("opentakeoff_")) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch { /* private mode */ }
}
