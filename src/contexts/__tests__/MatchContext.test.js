import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MatchProvider, useMatch } from '../MatchContext';
import { mockFirebaseDatabase } from '../../utils/test-utils';

// Mock Firebase
jest.mock('../../firebase', () => ({
  getFirebaseDatabase: jest.fn(() => Promise.resolve(mockFirebaseDatabase())),
}));

describe('MatchContext', () => {
  const wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

  it('should provide initial state', () => {
    const { result } = renderHook(() => useMatch(), { wrapper });
    
    expect(result.current.state.matchData).toBeNull();
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.authenticated).toBe(false);
    expect(result.current.state.matchStage).toBe('menu');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useMatch());
    }).toThrow('useMatch must be used within a MatchProvider');
    
    consoleSpy.mockRestore();
  });

  it('should update match data', () => {
    const { result } = renderHook(() => useMatch(), { wrapper });
    
    const mockData = {
      teamA: 'Test Team A',
      teamB: 'Test Team B',
      scoreA: 10,
      scoreB: 8,
    };

    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.SET_MATCH_DATA,
        payload: mockData,
      });
    });

    expect(result.current.state.matchData).toEqual(mockData);
  });

  it('should update score', () => {
    const { result } = renderHook(() => useMatch(), { wrapper });
    
    // Set initial match data
    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.SET_MATCH_DATA,
        payload: { teamA: 'Team A', teamB: 'Team B', scoreA: 0, scoreB: 0 },
      });
    });

    // Update score
    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.UPDATE_SCORE,
        payload: { team: 'A', score: 15 },
      });
    });

    expect(result.current.state.matchData.scoreA).toBe(15);
  });

  it('should add player', () => {
    const { result } = renderHook(() => useMatch(), { wrapper });
    
    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.SET_MATCH_DATA,
        payload: { players: {} },
      });
    });

    const playerData = {
      name: 'Test Player',
      team: 'A',
      points: 0,
      fouls: 0,
    };

    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.ADD_PLAYER,
        payload: { id: 'player_1', data: playerData },
      });
    });

    expect(result.current.state.matchData.players.player_1).toEqual(playerData);
  });

  it('should remove player', () => {
    const { result } = renderHook(() => useMatch(), { wrapper });
    
    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.SET_MATCH_DATA,
        payload: {
          players: {
            player_1: { name: 'Player 1', team: 'A' },
            player_2: { name: 'Player 2', team: 'B' },
          },
        },
      });
    });

    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.REMOVE_PLAYER,
        payload: 'player_1',
      });
    });

    expect(result.current.state.matchData.players.player_1).toBeUndefined();
    expect(result.current.state.matchData.players.player_2).toBeDefined();
  });

  it('should update player', () => {
    const { result } = renderHook(() => useMatch(), { wrapper });
    
    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.SET_MATCH_DATA,
        payload: {
          players: {
            player_1: { name: 'Player 1', team: 'A', points: 0, fouls: 0 },
          },
        },
      });
    });

    act(() => {
      result.current.dispatch({
        type: result.current.ACTIONS.UPDATE_PLAYER,
        payload: { id: 'player_1', updates: { points: 10, fouls: 2 } },
      });
    });

    expect(result.current.state.matchData.players.player_1.points).toBe(10);
    expect(result.current.state.matchData.players.player_1.fouls).toBe(2);
  });
});

