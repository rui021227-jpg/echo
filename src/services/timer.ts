const SESSION_DURATION_MS = 180_000; // 3 minutes

export interface SessionTimer {
  clear: () => void;
  getRemainingMs: () => number;
}

export function startSessionTimer(onExpire: () => void): SessionTimer {
  const startTime = Date.now();
  const timerId = setTimeout(onExpire, SESSION_DURATION_MS);

  return {
    clear: () => clearTimeout(timerId),
    getRemainingMs: () => {
      const elapsed = Date.now() - startTime;
      return Math.max(0, SESSION_DURATION_MS - elapsed);
    },
  };
}

export const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;
