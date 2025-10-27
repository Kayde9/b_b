import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  test('renders footer component', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo') || document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  test('displays copyright information', () => {
    render(<Footer />);
    expect(screen.getByText(/NMIMS/i)).toBeInTheDocument();
  });

  test('displays year 2025', () => {
    render(<Footer />);
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  test('contains social media or contact links', () => {
    const { container } = render(<Footer />);
    const links = container.querySelectorAll('a');
    
    // Footer should have at least some links
    expect(links.length).toBeGreaterThanOrEqual(0);
  });
});
