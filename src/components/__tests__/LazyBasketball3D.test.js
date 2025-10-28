import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LazyBasketball3D from '../LazyBasketball3D';

// Mock the Basketball3D component
jest.mock('../Basketball3D', () => {
  return function MockBasketball3D() {
    return <div data-testid="basketball-3d">Basketball 3D</div>;
  };
});

describe('LazyBasketball3D', () => {
  it('should show loading fallback initially', () => {
    const { container } = render(<LazyBasketball3D />);
    
    // Check for loading fallback styles
    expect(container.firstChild).toHaveStyle({
      width: '100%',
      height: '100%',
      display: 'flex',
    });
  });

  it('should load Basketball3D component', async () => {
    render(<LazyBasketball3D />);
    
    await waitFor(() => {
      expect(screen.getByTestId('basketball-3d')).toBeInTheDocument();
    });
  });

  it('should display Basketball 3D text after loading', async () => {
    render(<LazyBasketball3D />);
    
    await waitFor(() => {
      expect(screen.getByText('Basketball 3D')).toBeInTheDocument();
    });
  });
});

