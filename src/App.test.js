import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the components to avoid complex dependencies
jest.mock('./components/Navbar', () => {
  return function Navbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

jest.mock('./components/Footer', () => {
  return function Footer() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

jest.mock('./components/LoadingScreen', () => {
  return function LoadingScreen() {
    return <div data-testid="loading-screen">Loading...</div>;
  };
});

jest.mock('./pages/Home', () => {
  return function Home() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./pages/GettingHere', () => {
  return function GettingHere() {
    return <div data-testid="getting-here-page">Getting Here Page</div>;
  };
});

jest.mock('./pages/Schedule', () => {
  return function Schedule() {
    return <div data-testid="schedule-page">Schedule Page</div>;
  };
});

jest.mock('./pages/Gallery', () => {
  return function Gallery() {
    return <div data-testid="gallery-page">Gallery Page</div>;
  };
});

jest.mock('./pages/Contact', () => {
  return function Contact() {
    return <div data-testid="contact-page">Contact Page</div>;
  };
});

jest.mock('./pages/AdminScoring', () => {
  return function AdminScoring() {
    return <div data-testid="admin-scoring-page">Admin Scoring Page</div>;
  };
});

jest.mock('./pages/JourneyAnimation', () => {
  return function JourneyAnimation() {
    return <div data-testid="journey-animation-page">Journey Animation Page</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders loading screen initially', () => {
    render(<App />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  test('renders home page after loading', async () => {
    render(<App />);
    
    // Fast-forward time past the loading delay
    jest.advanceTimersByTime(2500);
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('renders navbar and footer on home page', async () => {
    render(<App />);
    
    jest.advanceTimersByTime(2500);
    
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  test('renders 404 page for unknown routes', async () => {
    window.history.pushState({}, 'Test page', '/unknown-route');
    
    render(<App />);
    
    jest.advanceTimersByTime(2500);
    
    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });
  });
});
