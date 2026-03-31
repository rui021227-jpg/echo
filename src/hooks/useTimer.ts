import { useEffect, useRef, useState, useCallback } from 'react';
import { startSessionTimer, SESSION_DURATION_SECONDS } from '../services/timer';

export function useTimer(active: boolean, onExpire: () => void) {
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_DURATION_SECONDS);
  const timerRef = useRef<ReturnType<typeof startSessionTimer> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    timerRef.current?.clear();
    timerRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    timerRef.current = startSessionTimer(onExpire);

    intervalRef.current = setInterval(() => {
      const remaining = timerRef.current?.getRemainingMs() ?? 0;
      setSecondsRemaining(Math.ceil(remaining / 1000));
    }, 1000);

    return clear;
  }, [active, onExpire, clear]);

  return { secondsRemaining, isExpired: secondsRemaining <= 0, clear };
}
