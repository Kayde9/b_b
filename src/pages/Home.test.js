import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';

// Mock the Basketball3D component
jest.mock('../components/Basketball3D', () => {
  return function Basketball3D() {
    return <div data-testid="basketball-3d">Basketball 3D Animation</div>;
  };
});

describe('Home Page', () => {
  test('renders home page', () => {
    render(<Home />);
    expect(screen.getByText(/Inter-NMIMS/i) || screen.getByText(/Basketball/i)).toBeInTheDocument();
  });

  test('displays tournament title', () => {
    render(<Home />);
    expect(screen.getByText(/Basketball/i) || screen.getByText(/Tournament/i)).toBeInTheDocument();
  });

  test('displays year 2025', () => {
    render(<Home />);
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  test('renders 3D basketball animation', () => {
    render(<Home />);
    expect(screen.getByTestId('basketball-3d')).toBeInTheDocument();
  });

  test('has hero section', () => {
    const { container } = render(<Home />);
    const heroSection = container.querySelector('.hero') || container.querySelector('section');
    expect(heroSection).toBeInTheDocument();
  });
});
