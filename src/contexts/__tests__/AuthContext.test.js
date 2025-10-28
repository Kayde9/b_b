import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.authenticated).toBe(false);
    expect(result.current.selectedCourt).toBeNull();
    expect(result.current.isLocked).toBe(false);
    expect(result.current.loginAttempts).toBe(0);
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('should login with correct password', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      const success = result.current.login('nmims2025');
      expect(success).toBe(true);
    });

    expect(result.current.authenticated).toBe(true);
  });

  it('should reject login with incorrect password', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(() => {
      act(() => {
        result.current.login('wrongpassword');
      });
    }).toThrow('Invalid password');

    expect(result.current.authenticated).toBe(false);
    expect(result.current.loginAttempts).toBe(1);
  });

  it('should lockout after max attempts', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      try {
        act(() => {
          result.current.login('wrongpassword');
        });
      } catch (e) {
        // Expected to throw
      }
    }

    expect(result.current.isLocked).toBe(true);
    expect(result.current.lockoutTime).toBeTruthy();
  });

  it('should logout successfully', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('nmims2025');
    });

    expect(result.current.authenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.authenticated).toBe(false);
    expect(result.current.selectedCourt).toBeNull();
  });

  it('should select court with correct password', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('nmims2025');
    });

    act(() => {
      const success = result.current.changeCourt('Court A', 'courtA123');
      expect(success).toBe(true);
    });

    expect(result.current.selectedCourt).toBe('Court A');
  });

  it('should persist authentication to localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('nmims2025', 'Court A');
    });

    expect(localStorage.getItem('authenticated')).toBe('true');
    expect(localStorage.getItem('selectedCourt')).toBe('Court A');
  });

  it('should restore authentication from localStorage', () => {
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('selectedCourt', 'Court A');
    localStorage.setItem('courtPassword', 'courtA123');

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for useEffect to run
    expect(result.current.authenticated).toBe(true);
    expect(result.current.selectedCourt).toBe('Court A');
  });
});

