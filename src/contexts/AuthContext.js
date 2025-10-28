import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtPassword, setCourtPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Court passwords from environment variables
  const COURT_PASSWORDS = {
    'Court A': process.env.REACT_APP_COURT_A_PASSWORD || 'courtA123',
    'Court B': process.env.REACT_APP_COURT_B_PASSWORD || 'courtB123',
    'Court C': process.env.REACT_APP_COURT_C_PASSWORD || 'courtC123',
  };

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'nmims2025';
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Load authentication state from localStorage
  useEffect(() => {
    const savedCourt = localStorage.getItem('selectedCourt');
    const savedPassword = localStorage.getItem('courtPassword');
    const savedAuth = localStorage.getItem('authenticated');
    
    if (savedCourt && savedPassword && savedAuth === 'true') {
      if (COURT_PASSWORDS[savedCourt] === savedPassword) {
        setSelectedCourt(savedCourt);
        setCourtPassword(savedPassword);
        setAuthenticated(true);
      }
    }

    // Check lockout status
    const savedLockoutTime = localStorage.getItem('lockoutTime');
    if (savedLockoutTime) {
      const lockoutEnd = parseInt(savedLockoutTime);
      if (Date.now() < lockoutEnd) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('lockoutTime');
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  // Lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setTimeout(() => {
        setIsLocked(false);
        setLockoutTime(null);
        setLoginAttempts(0);
        localStorage.removeItem('lockoutTime');
        localStorage.removeItem('loginAttempts');
      }, lockoutTime - Date.now());

      return () => clearTimeout(timer);
    }
  }, [isLocked, lockoutTime]);

  // Login function
  const login = useCallback((password, court) => {
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 60000);
      throw new Error(`Too many failed attempts. Locked out for ${remainingTime} more minutes.`);
    }

    // Check admin password or court-specific password
    const isAdminPassword = password === ADMIN_PASSWORD;
    const isCourtPassword = court && COURT_PASSWORDS[court] === password;

    if (isAdminPassword || isCourtPassword) {
      setAuthenticated(true);
      if (court) {
        setSelectedCourt(court);
        setCourtPassword(password);
        localStorage.setItem('selectedCourt', court);
        localStorage.setItem('courtPassword', password);
      }
      localStorage.setItem('authenticated', 'true');
      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      return true;
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
        localStorage.setItem('lockoutTime', lockoutEnd.toString());
        throw new Error('Too many failed attempts. Locked out for 15 minutes.');
      }

      throw new Error(`Invalid password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
    }
  }, [isLocked, lockoutTime, loginAttempts, ADMIN_PASSWORD, COURT_PASSWORDS]);

  // Logout function
  const logout = useCallback(() => {
    setAuthenticated(false);
    setSelectedCourt(null);
    setCourtPassword('');
    localStorage.removeItem('selectedCourt');
    localStorage.removeItem('courtPassword');
    localStorage.removeItem('authenticated');
  }, []);

  // Change court
  const changeCourt = useCallback((court, password) => {
    if (COURT_PASSWORDS[court] === password || password === ADMIN_PASSWORD) {
      setSelectedCourt(court);
      setCourtPassword(password);
      localStorage.setItem('selectedCourt', court);
      localStorage.setItem('courtPassword', password);
      return true;
    }
    return false;
  }, [ADMIN_PASSWORD, COURT_PASSWORDS]);

  const value = {
    authenticated,
    selectedCourt,
    courtPassword,
    loginAttempts,
    isLocked,
    lockoutTime,
    login,
    logout,
    changeCourt,
    COURT_PASSWORDS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

