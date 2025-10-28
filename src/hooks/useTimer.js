import { useEffect, useRef, useCallback } from 'react';
import { useMatch } from '../contexts/MatchContext';
import { useMatchOperations } from './useMatchOperations';

/**
 * Custom hook for managing match timer
 */
export const useTimer = () => {
  const { state } = useMatch();
  const { matchData } = state;
  const { updateTimer, setTimerRunning } = useMatchOperations();
  const timerIntervalRef = useRef(null);

  // Start timer
  const startTimer = useCallback(async () => {
    if (!matchData) return;
    
    await setTimerRunning(true);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [matchData, setTimerRunning]);

  // Pause timer
  const pauseTimer = useCallback(async () => {
    if (!matchData) return;
    
    await setTimerRunning(false);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [matchData, setTimerRunning]);

  // Reset timer
  const resetTimer = useCallback(async () => {
    if (!matchData) return;
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    const defaultSeconds = (matchData.quarterDuration || 10) * 60;
    await updateTimer(defaultSeconds);
    await setTimerRunning(false);
  }, [matchData, updateTimer, setTimerRunning]);

  // Set custom timer
  const setCustomTimer = useCallback(async (minutes, seconds) => {
    if (!matchData) return;
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    const totalSeconds = minutes * 60 + seconds;
    await updateTimer(totalSeconds);
    await setTimerRunning(false);
  }, [matchData, updateTimer, setTimerRunning]);

  // Timer tick effect
  useEffect(() => {
    if (!matchData || !matchData.isRunning) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(async () => {
      const currentSeconds = matchData.timerSeconds || 0;
      
      if (currentSeconds > 0) {
        await updateTimer(currentSeconds - 1);
      } else {
        // Time's up
        await setTimerRunning(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [matchData, updateTimer, setTimerRunning]);

  // Format timer display
  const formatTimer = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomTimer,
    formatTimer,
    isRunning: matchData?.isRunning || false,
    timerSeconds: matchData?.timerSeconds || 0,
  };
};

export default useTimer;

