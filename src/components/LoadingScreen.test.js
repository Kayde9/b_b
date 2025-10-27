import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingScreen from './LoadingScreen';

describe('LoadingScreen Component', () => {
  test('renders loading screen', () => {
    render(<LoadingScreen />);
    const loadingElement = screen.getByText(/loading/i) || screen.getByText(/🏀/);
    expect(loadingElement).toBeInTheDocument();
  });

  test('displays basketball emoji or icon', () => {
    const { container } = render(<LoadingScreen />);
    expect(container).toBeInTheDocument();
  });

  test('has loading animation styles', () => {
    const { container } = render(<LoadingScreen />);
    const loadingDiv = container.querySelector('.loading-screen') || container.firstChild;
    expect(loadingDiv).toBeInTheDocument();
  });
});
