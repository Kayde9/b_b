import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MatchProvider } from '../contexts/MatchContext';
import { AuthProvider } from '../contexts/AuthContext';

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <MatchProvider>
            {children}
          </MatchProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Mock Firebase database for testing
 */
export const mockFirebaseDatabase = () => {
  return {
    database: {
      ref: jest.fn(),
      onValue: jest.fn(),
      update: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
    },
    ref: jest.fn(),
    onValue: jest.fn((ref, callback) => {
      // Simulate initial data
      callback({ val: () => null });
      // Return unsubscribe function
      return jest.fn();
    }),
    update: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve({ val: () => null })),
  };
};

/**
 * Mock match data for testing
 */
export const mockMatchData = {
  teamA: 'Team Alpha',
  teamB: 'Team Beta',
  scoreA: 45,
  scoreB: 38,
  quarter: 2,
  timerSeconds: 420,
  quarterDuration: 10,
  isRunning: false,
  matchStage: 'match',
  status: 'live',
  players: {
    player_1: {
      name: 'John Doe',
      jersey: '23',
      team: 'A',
      points: 12,
      fouls: 2,
    },
    player_2: {
      name: 'Jane Smith',
      jersey: '10',
      team: 'A',
      points: 8,
      fouls: 1,
    },
    player_3: {
      name: 'Bob Johnson',
      jersey: '5',
      team: 'B',
      points: 15,
      fouls: 3,
    },
  },
  teamAPlaying: ['player_1', 'player_2'],
  teamBPlaying: ['player_3'],
  lastUpdated: Date.now(),
  createdAt: Date.now() - 3600000,
};

/**
 * Wait for async operations
 */
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

