export const SESSION_ACTIVE_WINDOW_DAYS = 30;

const SESSION_ACTIVE_WINDOW_MS =
  SESSION_ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export type LoginAuditEntry = {
  // Backend flag: whether the server still considers this session live.
  // Required for Active, but not trusted on its own (see issue #248).
  is_live?: boolean | null;
  // Timestamp of the original login for this session; fallback activity
  // signal used for the 30-day staleness check when nothing newer exists.
  login_at?: string | null;
  // Most recent user activity in this session, when the backend provides it;
  // preferred over login_at so idle-then-active sessions stay Active.
  last_active_at?: string | null;
  // Last time the backend observed this session (heartbeat/request), when
  // provided; used when last_active_at is absent.
  last_seen_at?: string | null;
  // Hard expiry timestamp for the session, when the backend provides it;
  // takes precedence over all age checks (Active only if now <= expires_at).
  expires_at?: string | null;
};

function parseTime(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * A session counts as Active only when the backend still flags it live
 * AND its timestamp is recent.
 * Backend `is_live` alone over-reports (see issue #248: Aug logins still
 * "Active" in Oct), so stale `login_at` values are treated as expired.
 * `expires_at` / activity fields are honored when the backend provides
 * them; otherwise behaviour is unchanged (no backend work required).
 */
export function isSessionActive(
  entry: LoginAuditEntry | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!entry?.is_live) {
    return false;
  }
  const expiresTime = parseTime(entry.expires_at);
  if (expiresTime !== null) {
    return nowMs <= expiresTime;
  }
  const activityTime =
    parseTime(entry.last_active_at) ??
    parseTime(entry.last_seen_at) ??
    parseTime(entry.login_at);
  if (activityTime === null) {
    return false;
  }
  const ageMs = nowMs - activityTime;
  // Tolerate minor clock skew: a slightly-future timestamp is still Active.
  if (ageMs < 0) {
    return true;
  }
  return ageMs <= SESSION_ACTIVE_WINDOW_MS;
}
