import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { checkEntitlement } from '../services/purchases';

export function useEntitlements() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const premium = await checkEntitlement();
      setIsPremium(premium);
    } catch {
      // Keep current state on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  return { isPremium, isLoading, refresh };
}
