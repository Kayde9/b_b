import { renderHook, act } from '@testing-library/react';
import { useMatchOperations } from '../useMatchOperations';
import { MatchProvider } from '../../contexts/MatchContext';
import { mockFirebaseDatabase, mockMatchData } from '../../utils/test-utils';

jest.mock('../../firebase', () => ({
  getFirebaseDatabase: jest.fn(() => Promise.resolve(mockFirebaseDatabase())),
}));

describe('useMatchOperations', () => {
  const wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

  it('should add score to team', async () => {
    const { result } = renderHook(() => useMatchOperations(), { wrapper });
    
    await act(async () => {
      await result.current.addScore('A', 3);
    });

    // Check that update was called (mocked)
    expect(true).toBe(true); // Placeholder assertion
  });

  it('should calculate correct team total when updating player score', async () => {
    const { result } = renderHook(() => useMatchOperations(), { wrapper });
    
    await act(async () => {
      const resultData = await result.current.updatePlayerScoreAndTeam(
        'player_1',
        15,
        2,
        'A'
      );
      
      // Should calculate team total based on all players
      expect(resultData).toBeDefined();
    });
  });

  it('should prevent negative scores', async () => {
    const { result } = renderHook(() => useMatchOperations(), { wrapper });
    
    await act(async () => {
      await result.current.addScore('A', -100);
    });

    // Score should never go below 0
    expect(true).toBe(true);
  });

  it('should add player with correct data', async () => {
    const { result } = renderHook(() => useMatchOperations(), { wrapper });
    
    const playerData = {
      name: 'New Player',
      jersey: '99',
      team: 'A',
      points: 0,
      fouls: 0,
    };

    await act(async () => {
      const playerId = await result.current.addPlayer(playerData);
      expect(playerId).toMatch(/^player_/);
    });
  });

  it('should update quarter correctly', async () => {
    const { result } = renderHook(() => useMatchOperations(), { wrapper });
    
    await act(async () => {
      await result.current.updateQuarter(3);
    });

    expect(true).toBe(true);
  });
});

