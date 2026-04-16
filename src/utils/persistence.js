const STORAGE_KEYS = {
  lastVisitedRoute: "primuxcare:last-visited-route",
};

const INVALID_LAST_ROUTE_PREFIXES = [
  "/",
  "/login",
  "/register-clinic",
  "/verify-email",
  "/support",
  "/billing/paystack/callback",
];

function canUseStorage(storage) {
  if (!storage) return false;
  try {
    const testKey = "__primuxcare_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getStorage(preferred = "session") {
  if (typeof window === "undefined") return null;

  const session = canUseStorage(window.sessionStorage)
    ? window.sessionStorage
    : null;
  const local = canUseStorage(window.localStorage) ? window.localStorage : null;

  if (preferred === "local") return local || session;
  return session || local;
}

export function readStoredJson(key, fallbackValue, preferred = "session") {
  const storage = getStorage(preferred);
  if (!storage) return fallbackValue;

  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeStoredJson(key, value, preferred = "session") {
  const storage = getStorage(preferred);
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or storage availability issues.
  }
}

export function removeStoredValue(key, preferred = "session") {
  const storage = getStorage(preferred);
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage availability issues.
  }
}

export function readLastVisitedRoute() {
  const sessionValue = readStoredJson(
    STORAGE_KEYS.lastVisitedRoute,
    null,
    "session",
  );
  if (isValidLastVisitedRoute(sessionValue)) return sessionValue;

  const localValue = readStoredJson(STORAGE_KEYS.lastVisitedRoute, null, "local");
  return isValidLastVisitedRoute(localValue) ? localValue : null;
}

export function writeLastVisitedRoute(value) {
  if (!isValidLastVisitedRoute(value)) return;

  ["session", "local"].forEach((preferred) => {
    writeStoredJson(STORAGE_KEYS.lastVisitedRoute, value, preferred);
  });
}

export function clearLastVisitedRoute() {
  ["session", "local"].forEach((preferred) => {
    removeStoredValue(STORAGE_KEYS.lastVisitedRoute, preferred);
  });
}

export function isValidLastVisitedRoute(value) {
  if (typeof value !== "string") return false;
  if (!value.startsWith("/")) return false;
  return !INVALID_LAST_ROUTE_PREFIXES.some((prefix) =>
    prefix === "/"
      ? value === "/"
      : value.startsWith(prefix),
  );
}

export { STORAGE_KEYS };
