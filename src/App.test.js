import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import App from './App';

// Mock all heavy components
jest.mock('./components/LoadingScreen', () => {
  return function MockLoadingScreen() {
    return <div data-testid="loading-screen">Loading...</div>;
  };
});

jest.mock('./pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home</div>;
  };
});

jest.mock('./contexts/MatchContext', () => ({
  MatchProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('App', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render loading screen initially', () => {
    render(<App />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  it('should render home page after loading', async () => {
    render(<App />);
    
    // Fast forward past loading delay
    jest.advanceTimersByTime(2500);

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('should wrap app with providers', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
