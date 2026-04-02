import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getSetting, initDatabase } from '../database/database';
import { useEntitlements } from '../hooks/useEntitlements';
import { initPurchases } from '../services/purchases';
import {
  SESSION_DURATION_SECONDS,
  startSessionTimer,
  type SessionTimer,
} from '../services/timer';
import { bootstrapApp } from './bootstrap';

interface AppContextValue {
  isReady: boolean;
  bootstrapError: string | null;
  retryBootstrap: () => Promise<void>;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  isPremium: boolean;
  isLoadingPremium: boolean;
  refreshPremium: () => Promise<void>;
  secondsRemaining: number;
  isTimedSessionActive: boolean;
  hasTimedSessionExpired: boolean;
  startTimedSession: () => void;
  endTimedSession: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const BOOTSTRAP_ERROR_MESSAGE = 'We could not open your local data.';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_DURATION_SECONDS);
  const [isTimedSessionActive, setIsTimedSessionActive] = useState(false);
  const [hasTimedSessionExpired, setHasTimedSessionExpired] = useState(false);
  const timerRef = useRef<SessionTimer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isPremium, isLoading: isLoadingPremium, refresh: refreshPremium } = useEntitlements();

  const clearTimedSessionRefs = useCallback(() => {
    timerRef.current?.clear();
    timerRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const endTimedSession = useCallback(() => {
    clearTimedSessionRefs();
    setSecondsRemaining(SESSION_DURATION_SECONDS);
    setIsTimedSessionActive(false);
    setHasTimedSessionExpired(false);
  }, [clearTimedSessionRefs]);

  const startTimedSession = useCallback(() => {
    clearTimedSessionRefs();
    setSecondsRemaining(SESSION_DURATION_SECONDS);
    setHasTimedSessionExpired(false);
    setIsTimedSessionActive(true);

    timerRef.current = startSessionTimer(() => {
      clearTimedSessionRefs();
      setSecondsRemaining(0);
      setIsTimedSessionActive(false);
      setHasTimedSessionExpired(true);
    });

    intervalRef.current = setInterval(() => {
      const remaining = timerRef.current?.getRemainingMs() ?? 0;
      setSecondsRemaining(Math.ceil(remaining / 1000));
    }, 1000);
  }, [clearTimedSessionRefs]);

  const retryBootstrap = useCallback(async () => {
    setIsReady(false);
    setBootstrapError(null);

    try {
      const result = await bootstrapApp({
        initDatabase,
        getSetting,
        initPurchases,
        refreshPremium,
        onPurchasesError: (error) => {
          console.warn('Purchases init error:', error);
        },
      });

      setOnboardingComplete(result.onboardingComplete);
      setIsReady(true);
    } catch (error) {
      console.error('Init error:', error);
      setBootstrapError(BOOTSTRAP_ERROR_MESSAGE);
      setIsReady(false);
    }
  }, [refreshPremium]);

  useEffect(() => {
    void retryBootstrap();
  }, [retryBootstrap]);

  useEffect(() => () => clearTimedSessionRefs(), [clearTimedSessionRefs]);

  return (
    <AppContext.Provider
      value={{
        isReady,
        bootstrapError,
        retryBootstrap,
        onboardingComplete,
        setOnboardingComplete,
        isPremium,
        isLoadingPremium,
        refreshPremium,
        secondsRemaining,
        isTimedSessionActive,
        hasTimedSessionExpired,
        startTimedSession,
        endTimedSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
