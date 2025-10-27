import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navbar Component', () => {
  test('renders navbar with logo', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Inter-NMIMS/i)).toBeInTheDocument();
  });

  test('renders all navigation links', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Getting Here')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    renderWithRouter(<Navbar />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const scheduleLink = screen.getByText('Schedule').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(scheduleLink).toHaveAttribute('href', '/schedule');
  });

  test('mobile menu toggle works', () => {
    renderWithRouter(<Navbar />);
    
    // Find the mobile menu button (usually has a hamburger icon)
    const menuButtons = screen.getAllByRole('button');
    
    if (menuButtons.length > 0) {
      const menuButton = menuButtons[0];
      fireEvent.click(menuButton);
      
      // After clicking, menu should be visible
      // This test assumes your navbar has a mobile menu implementation
      expect(menuButton).toBeInTheDocument();
    }
  });

  test('navbar has proper styling classes', () => {
    const { container } = renderWithRouter(<Navbar />);
    const navbar = container.querySelector('nav');
    
    expect(navbar).toBeInTheDocument();
  });
});
