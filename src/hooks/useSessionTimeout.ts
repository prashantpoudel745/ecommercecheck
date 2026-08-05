import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const INACTIVITY_LIMIT_MS   = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS     = 60 * 1000;       // show warning 60s before logout
const ACTIVITY_EVENTS       = ["mousemove", "keydown", "click", "scroll", "touchstart"];

/**
 * useSessionTimeout — Auto-logout after 30 minutes of inactivity.
 *
 * Returns { showWarning, secondsLeft, extendSession }
 * - showWarning: true when the 60-second countdown is active
 * - secondsLeft: countdown in seconds
 * - extendSession: call this to reset the timer (e.g. on "Stay logged in" click)
 */
export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current)     clearTimeout(timerRef.current);
    if (warningRef.current)   clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timerRef.current = null;
    warningRef.current = null;
    countdownRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(60);

    if (!user) return; // no timer if not logged in

    // Start the warning timer (fires 60s before logout)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(60);
      // Start a 1-second countdown for the UI
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

    // Final logout timer
    timerRef.current = setTimeout(() => {
      clearAllTimers();
      setShowWarning(false);
      logout();
    }, INACTIVITY_LIMIT_MS);
  }, [user, logout, clearAllTimers]);

  // Listen for user activity
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      // Only reset if warning is not yet shown (avoid resetting during countdown)
      if (!showWarning) {
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    resetTimer(); // start on mount

    return () => {
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
      clearAllTimers();
    };
  }, [user, resetTimer, clearAllTimers, showWarning]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return { showWarning, secondsLeft, extendSession };
}
