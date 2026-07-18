/**
 * Startup Copilot OS — localStorage persistence layer
 *
 * Drop-in key/value store that namespaces all data under "copilot_".
 * Used as an offline cache; when Supabase is configured, the same
 * workspace data is also synced to the cloud (see supabase-db.ts).
 */

const PREFIX = "copilot_";

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota exceeded — fail silently */
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  },

  /** Wipe registered emails / sessions so auth can start fresh (keeps non-auth app prefs). */
  clearAuthAccounts(): void {
    try {
      this.remove("registered_users");
      this.remove("user");
      for (const key of Object.keys(localStorage)) {
        if (
          key.startsWith(`${PREFIX}profile_status_`) ||
          key.startsWith(`${PREFIX}integrations_`) ||
          key.startsWith(`${PREFIX}creds_`) ||
          // Supabase browser session tokens
          (key.startsWith("sb-") && key.endsWith("-auth-token"))
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  },
};

/** Bump this to force another one-time wipe of registered emails on next app load. */
export const AUTH_ACCOUNTS_RESET_EPOCH = 2;
export const AUTH_ACCOUNTS_RESET_KEY = "auth_accounts_reset_epoch";

/** Returns true if a wipe ran (caller should also clear cloud users / sign out). */
export function applyPendingAuthAccountsReset(): boolean {
  if (typeof window === "undefined") return false;
  const done = storage.get<number>(AUTH_ACCOUNTS_RESET_KEY, 0);
  if (done >= AUTH_ACCOUNTS_RESET_EPOCH) return false;
  storage.clearAuthAccounts();
  storage.set(AUTH_ACCOUNTS_RESET_KEY, AUTH_ACCOUNTS_RESET_EPOCH);
  return true;
}
