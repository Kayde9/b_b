import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import Home from '../Home';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock LazyBasketball3D component
jest.mock('../../components/LazyBasketball3D', () => {
  return function MockLazyBasketball3D() {
    return <div data-testid="lazy-basketball">Basketball</div>;
  };
});

describe('Home Page', () => {
  it('should render without crashing', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/INTER-NMIMS/i)).toBeInTheDocument();
  });

  it('should display tournament title', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/BASKETBALL/i)).toBeInTheDocument();
    expect(screen.getByText(/TOURNAMENT 2025/i)).toBeInTheDocument();
  });

  it('should display tournament highlights section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/TOURNAMENT HIGHLIGHTS/i)).toBeInTheDocument();
  });

  it('should display tournament date feature', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/November 4-5, 2025/i)).toBeInTheDocument();
  });

  it('should display venue feature', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/NMIMS Jadcherla/i)).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/View Event Map/i)).toBeInTheDocument();
    expect(screen.getByText(/Match Schedule/i)).toBeInTheDocument();
  });

  it('should display about section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/ABOUT THE TOURNAMENT/i)).toBeInTheDocument();
  });

  it('should display stats', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/Participating Teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Days of Action/i)).toBeInTheDocument();
  });

  it('should render CTA section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/READY TO WITNESS THE ACTION/i)).toBeInTheDocument();
  });

  it('should load lazy basketball component', async () => {
    renderWithProviders(<Home />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('lazy-basketball').length).toBeGreaterThan(0);
    });
  });
});

