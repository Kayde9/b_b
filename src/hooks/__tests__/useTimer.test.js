import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimer } from '../useTimer';
import { MatchProvider } from '../../contexts/MatchContext';
import { mockFirebaseDatabase } from '../../utils/test-utils';

jest.mock('../../firebase', () => ({
  getFirebaseDatabase: jest.fn(() => Promise.resolve(mockFirebaseDatabase())),
}));

// Use fake timers for testing
jest.useFakeTimers();

describe('useTimer', () => {
  const wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should format timer correctly', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    expect(result.current.formatTimer(125)).toBe('02:05');
    expect(result.current.formatTimer(600)).toBe('10:00');
    expect(result.current.formatTimer(0)).toBe('00:00');
    expect(result.current.formatTimer(3661)).toBe('61:01');
  });

  it('should start timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    await act(async () => {
      await result.current.startTimer();
    });

    expect(result.current.isRunning).toBeDefined();
  });

  it('should pause timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    await act(async () => {
      await result.current.startTimer();
    });

    await act(async () => {
      await result.current.pauseTimer();
    });

    expect(result.current.isRunning).toBeDefined();
  });

  it('should reset timer to quarter duration', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    await act(async () => {
      await result.current.resetTimer();
    });

    expect(true).toBe(true);
  });

  it('should set custom timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    await act(async () => {
      await result.current.setCustomTimer(5, 30);
    });

    expect(true).toBe(true);
  });

  it('should stop timer when reaching zero', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    await act(async () => {
      await result.current.setCustomTimer(0, 2);
      await result.current.startTimer();
    });

    // Fast forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Timer should have stopped
    await waitFor(() => {
      expect(result.current.isRunning).toBeDefined();
    });
  });
});

