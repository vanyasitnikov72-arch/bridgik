import { useEffect } from 'react';

/**
 * Screen Wake Lock hook: Keeps mobile and desktop screens awake during active file transfers.
 * Automatically handles re-acquiring the lock on visibilitychange (e.g. when returning to the tab from background).
 */
export function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let wakeLockSentinel: any = null;
    let isCancelled = false;

    const requestLock = async () => {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
      if (document.visibilityState !== 'visible' || isCancelled) return;

      try {
        wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        wakeLockSentinel?.addEventListener?.('release', () => {
          wakeLockSentinel = null;
        });
      } catch (err) {
        // May fail if low power mode is enabled or page is not focused
        console.debug('[WakeLock] Request failed:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockSentinel) {
        requestLock();
      }
    };

    requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release?.().catch(() => {});
        wakeLockSentinel = null;
      }
    };
  }, [enabled]);
}
