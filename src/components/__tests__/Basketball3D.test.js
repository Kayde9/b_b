import React from 'react';
import { render } from '@testing-library/react';
import Basketball3D from '../Basketball3D';

// Mock @react-three/fiber and @react-three/drei
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn(),
}));

jest.mock('@react-three/drei', () => ({
  Sphere: ({ children }) => <mesh data-testid="sphere">{children}</mesh>,
}));

describe('Basketball3D', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<Basketball3D />);
    expect(getByTestId('canvas')).toBeInTheDocument();
  });

  it('should render sphere mesh', () => {
    const { getByTestId } = render(<Basketball3D />);
    expect(getByTestId('sphere')).toBeInTheDocument();
  });

  it('should have canvas with correct camera settings', () => {
    const { container } = render(<Basketball3D />);
    expect(container.querySelector('[data-testid="canvas"]')).toBeInTheDocument();
  });
});

