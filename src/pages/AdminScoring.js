import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Lock, LogOut, Users, Trophy, Play, Pause, RotateCcw, Clock, RefreshCw, AlertTriangle, Upload, FileSpreadsheet } from 'lucide-react';
import { getFirebaseDatabase } from '../firebase';
import * as XLSX from 'xlsx';
import './AdminScoring.css';

const AdminScoring = () => {
  // All hooks must be declared at the top, before any conditional returns
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [firebase, setFirebase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('A');
  const [newPlayer, setNewPlayer] = useState({ name: '', jersey: '', team: 'A' });
  const [notification, setNotification] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(720); // 12 minutes in seconds
  const [quarterDuration, setQuarterDuration] = useState(12); // Duration in minutes
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const timerIntervalRef = useRef(null);
  
  // New state for workflow stages
  const [matchStage, setMatchStage] = useState('menu'); // 'menu', 'setup', 'selectPlaying5', 'match'
  const [teamAPlaying, setTeamAPlaying] = useState([]);
  const [teamBPlaying, setTeamBPlaying] = useState([]);
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [substituteTeam, setSubstituteTeam] = useState('A');
  const [substituteOut, setSubstituteOut] = useState(null);
  const [substituteIn, setSubstituteIn] = useState(null);
  const [expandedPlayer, setExpandedPlayer] = useState(null); // Track which player card is expanded
  const [foulWarning, setFoulWarning] = useState(null);
  
  // Timeout state
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutTeam, setTimeoutTeam] = useState(null);
  const [timeoutActive, setTimeoutActive] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);
  const timeoutIntervalRef = useRef(null);
  
  // Past matches state
  const [pastMatches, setPastMatches] = useState([]);
  const [showSaveMatchModal, setShowSaveMatchModal] = useState(false);
  const [showPastMatchesModal, setShowPastMatchesModal] = useState(false);
  const [selectedPastMatch, setSelectedPastMatch] = useState(null);
  
  // Ref to track previous match data to prevent unnecessary re-renders
  const prevMatchDataRef = useRef(null);
  
  // Match scheduling state
  const [matchScheduleData, setMatchScheduleData] = useState({
    matchType: 'Boys',
    court: 'Court A',
    date: '',
    time: '',
    roundType: 'Knockout Round'
  });
  const [isMatchScheduled, setIsMatchScheduled] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Use environment variable for admin password with fallback
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'nmims2025';

  const updateMatchInfo = React.useCallback(async (field, value) => {
    if (!firebase) return;
    
    // Optimistic update - update local state immediately to prevent flickering
    if (matchData) {
      const optimisticData = { ...matchData, [field]: value };
      prevMatchDataRef.current = optimisticData;
      setMatchData(optimisticData);
    }
    
    const updates = {};
    updates[`matches/current/${field}`] = value;
    updates['matches/current/lastUpdated'] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
    } catch (error) {
      console.error('Error updating match:', error);
      // Revert optimistic update on error
      if (matchData) {
        setMatchData(matchData);
      }
    }
  }, [firebase, matchData]);

  const stopTimer = React.useCallback(async () => {
    if (!firebase) return;
    const updates = {};
    updates['matches/current/isRunning'] = false;
    updates['matches/current/lastUpdated'] = Date.now();
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  }, [firebase]);

  const endTimeout = React.useCallback(async () => {
    setTimeoutActive(false);
    setTimeoutSeconds(60);
    setTimeoutTeam(null);
    showNotification('Timeout ended');
  }, []);

  const initFirebase = React.useCallback(async () => {
    try {
      const { database, ref, onValue, update } = await getFirebaseDatabase();
      
      setFirebase({ database, ref, onValue, update });
      
      // Listen to match updates
      const matchRef = ref(database, 'matches/current');
      let isFirstLoad = true;
      const unsubscribe = onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Check if data actually changed (ignore lastUpdated timestamp)
          const prevData = prevMatchDataRef.current;
          const hasChanged = !prevData || 
            data.matchStage !== prevData.matchStage ||
            data.scoreA !== prevData.scoreA ||
            data.scoreB !== prevData.scoreB ||
            data.quarter !== prevData.quarter ||
            data.isRunning !== prevData.isRunning ||
            JSON.stringify(data.teamAPlaying) !== JSON.stringify(prevData.teamAPlaying) ||
            JSON.stringify(data.teamBPlaying) !== JSON.stringify(prevData.teamBPlaying) ||
            JSON.stringify(data.players) !== JSON.stringify(prevData.players);
          
          if (hasChanged || !prevData) {
            prevMatchDataRef.current = data;
            
            // Use React 18 batching - all state updates in same function are batched automatically
            // This prevents multiple re-renders and flickering
            setMatchData(data);
            setMatchStage(data.matchStage || 'menu');
            setTeamAPlaying(data.teamAPlaying || []);
            setTeamBPlaying(data.teamBPlaying || []);
            
            // Only sync timer from Firebase when timer is not running to prevent flickering
            if (data.timerSeconds !== undefined && !data.isRunning) {
              setTimerSeconds(data.timerSeconds);
            }
            setQuarterDuration(data.quarterDuration || 12);
          }
        } else {
          // Initialize default match
          initializeMatch(database, ref, update);
        }
        // Only set loading to false on first load
        if (isFirstLoad) {
          setLoading(false);
          isFirstLoad = false;
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setError(err);
      setLoading(false);
    }
  }, []);

  const loadPastMatches = React.useCallback(async () => {
    try {
      // Load from localStorage first with validation
      const storedData = localStorage.getItem('pastMatches');
      let localMatches = [];
      if (storedData) {
        try {
          localMatches = JSON.parse(storedData);
          // Validate it's an array
          if (!Array.isArray(localMatches)) {
            localMatches = [];
            localStorage.removeItem('pastMatches');
          }
        } catch (parseError) {
          console.error('Invalid localStorage data, clearing:', parseError);
          localStorage.removeItem('pastMatches');
        }
      }
      setPastMatches(localMatches);

      // Also try to load from Firebase if available
      if (firebase) {
        const { onValue } = firebase;
        const pastMatchesRef = firebase.ref(firebase.database, 'matches/past');
        onValue(pastMatchesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const matchesArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
            setPastMatches(matchesArray);
            // Sync to localStorage
            localStorage.setItem('pastMatches', JSON.stringify(matchesArray));
          }
        }, { onlyOnce: true });
      }
    } catch (error) {
      console.error('Error loading past matches:', error);
    }
  }, [firebase]);

  // All useEffect hooks must be declared before any conditional returns
  useEffect(() => {
    if (authenticated) {
      setLoading(true);
      initFirebase();
      loadPastMatches();
    }
  }, [authenticated, initFirebase, loadPastMatches]);

  // Timer management useEffect - optimized to prevent flickering
  useEffect(() => {
    if (matchData?.isRunning) {
      let lastUpdateTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            stopTimer();
          }
          // Update Firebase less frequently to reduce network traffic and prevent conflicts
          // Only update every 5 seconds or when timer hits 0
          const now = Date.now();
          if (newTime === 0 || (now - lastUpdateTime >= 5000)) {
            lastUpdateTime = now;
            if (firebase) {
              const updates = {};
              updates['matches/current/timerSeconds'] = newTime;
              // Don't update lastUpdated to prevent triggering Firebase listener
              firebase.update(firebase.ref(firebase.database), updates).catch(err => {
                console.error('Error updating timer:', err);
              });
            }
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [matchData?.isRunning, stopTimer, firebase]);

  // Timeout timer management
  useEffect(() => {
    if (timeoutActive) {
      timeoutIntervalRef.current = setInterval(() => {
        setTimeoutSeconds(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            endTimeout();
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
      }
    }
    return () => {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
      }
    };
  }, [timeoutActive, endTimeout]);

  // Error boundary check - after all hooks
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#1a1a1a', 
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Loading Admin Panel</h1>
          <p style={{ marginBottom: '1rem' }}>{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.75rem 1.5rem',
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const initializeMatch = async (database, ref, update) => {
    const matchData = {
      teamA: 'NMIMS Mumbai',
      teamB: 'NMIMS Hyderabad',
      scoreA: 0,
      scoreB: 0,
      timerSeconds: 720,
      quarterDuration: 12,
      isRunning: false,
      quarter: 1,
      isOvertime: false,
      matchStage: 'menu',
      teamAPlaying: [],
      teamBPlaying: [],
      quarterScores: {
        q1: { teamA: 0, teamB: 0 },
        q2: { teamA: 0, teamB: 0 },
        q3: { teamA: 0, teamB: 0 },
        q4: { teamA: 0, teamB: 0 }
      },
      timeouts: {
        teamA: { q1: 2, q2: 2, q3: 2, q4: 4 },
        teamB: { q1: 2, q2: 2, q3: 2, q4: 4 }
      },
      players: {},
      lastUpdated: Date.now()
    };
    await update(ref(database, 'matches/current'), matchData);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      const timeRemaining = Math.ceil((lockoutTime - Date.now()) / 1000);
      if (timeRemaining > 0) {
        setError(`Too many failed attempts. Try again in ${timeRemaining} seconds.`);
        return;
      } else {
        // Reset lockout
        setIsLocked(false);
        setLoginAttempts(0);
        setLockoutTime(null);
      }
    }
    
    // Validate password length to prevent timing attacks
    if (!password || password.length < 6) {
      setError('Invalid password format');
      setLoginAttempts(prev => prev + 1);
      return;
    }
    
    if (password.trim() === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(null);
      setLoginAttempts(0);
      setPassword('');
      showNotification('Login successful!');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Lock account after 5 failed attempts for 5 minutes
      if (newAttempts >= 5) {
        setIsLocked(true);
        const lockTime = Date.now() + 300000; // 5 minutes
        setLockoutTime(lockTime);
        setError('Too many failed attempts. Account locked for 5 minutes.');
        setPassword('');
      } else {
        setError(`Invalid password. ${5 - newAttempts} attempts remaining.`);
        setPassword('');
      }
      showNotification('Invalid password!');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setMatchData(null);
  };

  const endMatch = async () => {
    // Show save match modal instead of immediately ending
    setShowSaveMatchModal(true);
  };

  const saveAndEndMatch = async () => {
    try {
      // Save match to past matches
      const matchId = `match_${Date.now()}`;
      const matchToSave = {
        id: matchId,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        scoreA: matchData.scoreA,
        scoreB: matchData.scoreB,
        quarter: matchData.quarter,
        isOvertime: matchData.isOvertime,
        quarterScores: matchData.quarterScores,
        players: matchData.players,
        teamAPlaying: teamAPlaying,
        teamBPlaying: teamBPlaying,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      // Save to Firebase
      const updates = {};
      updates[`matches/past/${matchId}`] = matchToSave;
      
      // If this match was scheduled, update the scheduled match to show it has score
      if (matchData.scheduleId) {
        updates[`matches/scheduled/${matchData.scheduleId}/hasScore`] = true;
        updates[`matches/scheduled/${matchData.scheduleId}/status`] = 'completed';
        updates[`matches/scheduled/${matchData.scheduleId}/finalScoreA`] = matchData.scoreA;
        updates[`matches/scheduled/${matchData.scheduleId}/finalScoreB`] = matchData.scoreB;
        updates[`matches/scheduled/${matchData.scheduleId}/completedAt`] = Date.now();
      }
      
      await firebase.update(firebase.ref(firebase.database), updates);

      // Also save to localStorage as backup
      let savedMatches = [];
      try {
        const storedData = localStorage.getItem('pastMatches');
        if (storedData) {
          savedMatches = JSON.parse(storedData);
          if (!Array.isArray(savedMatches)) savedMatches = [];
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
      savedMatches.unshift(matchToSave);
      localStorage.setItem('pastMatches', JSON.stringify(savedMatches));

      // Reset current match
      await resetCurrentMatch();
      
      setShowSaveMatchModal(false);
      showNotification('Match saved successfully!');
      loadPastMatches();
    } catch (error) {
      console.error('Error saving match:', error);
      showNotification('Failed to save match');
    }
  };

  const endWithoutSaving = async () => {
    if (!window.confirm('Are you sure? The match data will be lost.')) {
      return;
    }
    await resetCurrentMatch();
    setShowSaveMatchModal(false);
    showNotification('Match ended without saving.');
  };

  const resetCurrentMatch = async () => {
    try {
      const updates = {};
      updates['matches/current/matchStage'] = 'menu';
      updates['matches/current/isRunning'] = false;
      updates['matches/current/timerSeconds'] = 720;
      updates['matches/current/quarter'] = 1;
      updates['matches/current/scoreA'] = 0;
      updates['matches/current/scoreB'] = 0;
      updates['matches/current/teamA'] = '';
      updates['matches/current/teamB'] = '';
      updates['matches/current/teamAPlaying'] = [];
      updates['matches/current/teamBPlaying'] = [];
      updates['matches/current/players'] = {};
      updates['matches/current/scheduleId'] = null;
      updates['matches/current/matchType'] = null;
      updates['matches/current/court'] = null;
      updates['matches/current/scheduledDate'] = null;
      updates['matches/current/scheduledTime'] = null;
      updates['matches/current/roundType'] = null;
      updates['matches/current/quarterScores'] = {
        q1: { teamA: 0, teamB: 0 },
        q2: { teamA: 0, teamB: 0 },
        q3: { teamA: 0, teamB: 0 },
        q4: { teamA: 0, teamB: 0 }
      };
      updates['matches/current/timeouts'] = {
        teamA: { q1: 2, q2: 2, q3: 2, q4: 4 },
        teamB: { q1: 2, q2: 2, q3: 2, q4: 4 }
      };
      updates['matches/current/lastUpdated'] = Date.now();
      
      await firebase.update(firebase.ref(firebase.database), updates);
      
      // Reset local state
      setMatchStage('menu');
      setIsMatchScheduled(false);
      setMatchScheduleData({
        matchType: 'Boys',
        court: 'Court A',
        date: '',
        time: '',
        roundType: 'Knockout Round'
      });
      setTeamAPlaying([]);
      setTeamBPlaying([]);
    } catch (error) {
      console.error('Error resetting match:', error);
      showNotification('Failed to reset match');
    }
  };

  const viewPastMatch = (match) => {
    setSelectedPastMatch(match);
  };

  const deletePastMatch = async (matchId) => {
    if (!window.confirm('Delete this match from history?')) {
      return;
    }

    try {
      // Delete from Firebase
      const updates = {};
      updates[`matches/past/${matchId}`] = null;
      await firebase.update(firebase.ref(firebase.database), updates);

      // Delete from localStorage
      let savedMatches = [];
      try {
        const storedData = localStorage.getItem('pastMatches');
        if (storedData) {
          savedMatches = JSON.parse(storedData);
          if (!Array.isArray(savedMatches)) savedMatches = [];
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
      const filtered = savedMatches.filter(m => m.id !== matchId);
      localStorage.setItem('pastMatches', JSON.stringify(filtered));

      setPastMatches(filtered);
      showNotification('Match deleted from history');
      
      if (selectedPastMatch?.id === matchId) {
        setSelectedPastMatch(null);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      showNotification('Failed to delete match');
    }
  };

  const scheduleMatch = async () => {
    // Validate required fields
    if (!matchData?.teamA || !matchData?.teamB) {
      showNotification('Please enter both team names');
      return;
    }
    if (!matchScheduleData.date || !matchScheduleData.time) {
      showNotification('Please select date and time');
      return;
    }

    try {
      const scheduleId = `schedule_${Date.now()}`;
      const scheduledMatch = {
        id: scheduleId,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        matchType: matchScheduleData.matchType,
        court: matchScheduleData.court,
        date: matchScheduleData.date,
        time: matchScheduleData.time,
        roundType: matchScheduleData.roundType,
        status: 'upcoming',
        createdAt: Date.now(),
        hasScore: false
      };

      // Save to Firebase scheduled matches
      const updates = {};
      updates[`matches/scheduled/${scheduleId}`] = scheduledMatch;
      updates['matches/current/scheduleId'] = scheduleId;
      updates['matches/current/matchType'] = matchScheduleData.matchType;
      updates['matches/current/court'] = matchScheduleData.court;
      updates['matches/current/scheduledDate'] = matchScheduleData.date;
      updates['matches/current/scheduledTime'] = matchScheduleData.time;
      updates['matches/current/roundType'] = matchScheduleData.roundType;
      updates['matches/current/lastUpdated'] = Date.now();

      await firebase.update(firebase.ref(firebase.database), updates);
      
      console.log('Match scheduled with ID:', scheduleId); // Debug log
      console.log('Scheduled match data:', scheduledMatch); // Debug log
      
      setIsMatchScheduled(true);
      showNotification('Match scheduled successfully! Now add players.');
    } catch (error) {
      console.error('Error scheduling match:', error);
      showNotification('Failed to schedule match');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    await updateMatchInfo('isRunning', true);
  };

  const resetTimer = async () => {
    const duration = (matchData?.quarterDuration || quarterDuration) * 60;
    setTimerSeconds(duration);
    await updateMatchInfo('timerSeconds', duration);
    await updateMatchInfo('isRunning', false);
  };

  const updateQuarterDuration = async (minutes) => {
    const seconds = minutes * 60;
    setQuarterDuration(minutes);
    setTimerSeconds(seconds);
    
    const updates = {};
    updates['matches/current/quarterDuration'] = minutes;
    updates['matches/current/timerSeconds'] = seconds;
    updates['matches/current/isRunning'] = false;
    updates['matches/current/lastUpdated'] = Date.now();
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification(`Quarter duration set to ${minutes} minutes`);
    } catch (error) {
      console.error('Error updating quarter duration:', error);
      showNotification('Failed to update quarter duration');
    }
  };

  const changeQuarter = async (newQuarter, isOT = false) => {
    if (!isOT && (newQuarter < 1 || newQuarter > 4)) return;
    
    // Check if game is tied after Q4 and suggest overtime
    if (newQuarter === 5 && !isOT) {
      if (matchData.scoreA === matchData.scoreB) {
        startOvertime();
        return;
      } else {
        showNotification('Game is not tied. No overtime needed.');
        return;
      }
    }
    
    // Save current quarter scores before changing
    const currentQ = isOT ? `ot${matchData.quarter - 4}` : `q${matchData.quarter}`;
    const updates = {};
    
    if (!isOT && matchData.quarter <= 4) {
      updates[`matches/current/quarterScores/${currentQ}/teamA`] = matchData.scoreA || 0;
      updates[`matches/current/quarterScores/${currentQ}/teamB`] = matchData.scoreB || 0;
    } else if (isOT || matchData.quarter > 4) {
      // Save overtime scores
      if (!matchData.quarterScores[currentQ]) {
        updates[`matches/current/quarterScores/${currentQ}`] = {};
      }
      updates[`matches/current/quarterScores/${currentQ}/teamA`] = matchData.scoreA || 0;
      updates[`matches/current/quarterScores/${currentQ}/teamB`] = matchData.scoreB || 0;
    }
    
    const duration = (matchData?.quarterDuration || quarterDuration) * 60;
    updates['matches/current/quarter'] = newQuarter;
    updates['matches/current/timerSeconds'] = duration;
    updates['matches/current/isRunning'] = false;
    updates['matches/current/isOvertime'] = isOT;
    updates['matches/current/lastUpdated'] = Date.now();
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      setTimerSeconds(duration);
      if (isOT) {
        showNotification(`Overtime ${newQuarter - 4} started!`);
      } else {
        showNotification(`Quarter ${newQuarter} started!`);
      }
    } catch (error) {
      console.error('Error changing quarter:', error);
      showNotification('Failed to change quarter');
    }
  };

  const startOvertime = async () => {
    if (matchData.scoreA !== matchData.scoreB) {
      showNotification('Game is not tied. No overtime needed.');
      return;
    }
    
    // Initialize overtime quarter - 3 minutes
    const updates = {};
    const duration = 3 * 60; // 3 minutes for overtime
    updates['matches/current/quarter'] = 5; // OT1
    updates['matches/current/isOvertime'] = true;
    updates['matches/current/timerSeconds'] = duration;
    updates['matches/current/quarterDuration'] = 3;
    updates['matches/current/isRunning'] = false;
    updates['matches/current/lastUpdated'] = Date.now();
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      setTimerSeconds(duration);
      setQuarterDuration(3);
      showNotification('⚠️ OVERTIME! Game is tied. Starting 3-minute overtime.');
    } catch (error) {
      console.error('Error starting overtime:', error);
      showNotification('Failed to start overtime');
    }
  };

  const checkForOvertime = () => {
    if (matchData?.quarter === 4 && matchData.scoreA === matchData.scoreB) {
      return true;
    }
    return false;
  };

  // NEW WORKFLOW FUNCTIONS
  
  // Stage 1: Setup - Proceed to select playing 5
  const proceedToSelectPlaying5 = async () => {
    const players = matchData?.players || {};
    const teamACount = Object.values(players).filter(p => p.team === 'A').length;
    const teamBCount = Object.values(players).filter(p => p.team === 'B').length;
    
    if (teamACount < 5 || teamBCount < 5) {
      showNotification('Each team needs at least 5 players');
      return;
    }
    
    // Clear any previous selections
    setTeamAPlaying([]);
    setTeamBPlaying([]);
    
    const updates = {};
    updates['matches/current/matchStage'] = 'selectPlaying5';
    updates['matches/current/teamAPlaying'] = [];
    updates['matches/current/teamBPlaying'] = [];
    updates['matches/current/lastUpdated'] = Date.now();
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      setMatchStage('selectPlaying5');
      showNotification('Select 5 players from each team');
    } catch (error) {
      console.error('Error proceeding to select playing 5:', error);
      showNotification('Failed to proceed');
    }
  };
  
  // Go back to setup stage
  const goBackToSetup = async () => {
    // Clear selections when going back
    setTeamAPlaying([]);
    setTeamBPlaying([]);
    
    const updates = {};
    updates['matches/current/matchStage'] = 'setup';
    updates['matches/current/teamAPlaying'] = [];
    updates['matches/current/teamBPlaying'] = [];
    updates['matches/current/lastUpdated'] = Date.now();
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      setMatchStage('setup');
      showNotification('Returned to setup');
    } catch (error) {
      console.error('Error going back to setup:', error);
      showNotification('Failed to go back');
    }
  };
  
  // Go back to menu
  const goBackToMenu = async () => {
    if (!window.confirm('Going back will clear the current match setup. Continue?')) {
      return;
    }
    
    // Reset everything
    await resetCurrentMatch();
    showNotification('Returned to main menu');
  };
  
  // Stage 2: Toggle player selection for playing 5
  const togglePlayingPlayer = async (team, playerId) => {
    const playing = team === 'A' ? teamAPlaying : teamBPlaying;
    const isSelected = playing.includes(playerId);
    
    let newPlaying;
    if (isSelected) {
      newPlaying = playing.filter(id => id !== playerId);
    } else {
      if (playing.length >= 5) {
        showNotification('Maximum 5 players can be on court');
        return;
      }
      newPlaying = [...playing, playerId];
    }
    
    if (team === 'A') {
      setTeamAPlaying(newPlaying);
      await updateMatchInfo('teamAPlaying', newPlaying);
    } else {
      setTeamBPlaying(newPlaying);
      await updateMatchInfo('teamBPlaying', newPlaying);
    }
  };
  
  // Stage 2: Start match with selected playing 5
  const startMatchWithPlaying5 = async () => {
    if (teamAPlaying.length !== 5 || teamBPlaying.length !== 5) {
      showNotification('Both teams must have exactly 5 players on court');
      return;
    }
    
    setMatchStage('match');
    const updates = {};
    updates['matches/current/matchStage'] = 'match';
    updates['matches/current/isRunning'] = true;
    updates['matches/current/lastUpdated'] = Date.now();
    
    // If this match was scheduled, update its status to "live"
    const scheduleId = matchData?.scheduleId;
    console.log('Starting match with scheduleId:', scheduleId); // Debug log
    
    if (scheduleId) {
      updates[`matches/scheduled/${scheduleId}/status`] = 'live';
      updates[`matches/scheduled/${scheduleId}/liveStartedAt`] = Date.now();
      console.log('Updating scheduled match to LIVE status'); // Debug log
    } else {
      console.log('No scheduleId found in matchData'); // Debug log
    }
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification('Match started!');
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };
  
  // Substitution functions
  const openSubstitution = (team) => {
    setSubstituteTeam(team);
    setSubstituteOut(null);
    setSubstituteIn(null);
    setShowSubstitution(true);
  };
  
  const confirmSubstitution = async () => {
    if (!substituteOut || !substituteIn) {
      showNotification('Please select both OUT and IN players');
      return;
    }
    
    const playing = substituteTeam === 'A' ? teamAPlaying : teamBPlaying;
    const newPlaying = playing.map(id => id === substituteOut ? substituteIn : id);
    
    if (substituteTeam === 'A') {
      setTeamAPlaying(newPlaying);
      await updateMatchInfo('teamAPlaying', newPlaying);
    } else {
      setTeamBPlaying(newPlaying);
      await updateMatchInfo('teamBPlaying', newPlaying);
    }
    
    setShowSubstitution(false);
    setSubstituteOut(null);
    setSubstituteIn(null);
    showNotification('Substitution completed');
  };
  
  // Get playing and bench players
  const getPlayingPlayers = (team) => {
    const players = matchData?.players || {};
    const playing = team === 'A' ? teamAPlaying : teamBPlaying;
    return Object.entries(players)
      .filter(([id, p]) => p.team === team && playing.includes(id))
      .map(([id, p]) => ({ id, ...p }));
  };
  
  const getBenchPlayers = (team) => {
    const players = matchData?.players || {};
    const playing = team === 'A' ? teamAPlaying : teamBPlaying;
    return Object.entries(players)
      .filter(([id, p]) => p.team === team && !playing.includes(id))
      .map(([id, p]) => ({ id, ...p }));
  };

  // Timeout functions
  const getAvailableTimeouts = (team) => {
    if (!matchData?.timeouts) return 0;
    const quarter = matchData.quarter;
    const qKey = matchData.isOvertime ? `ot${quarter - 4}` : `q${quarter}`;
    const teamKey = team === 'A' ? 'teamA' : 'teamB';
    return matchData.timeouts[teamKey]?.[qKey] || 0;
  };

  const requestTimeout = (team) => {
    const available = getAvailableTimeouts(team);
    if (available <= 0) {
      showNotification('No timeouts remaining for this quarter');
      return;
    }
    
    setTimeoutTeam(team);
    setShowTimeoutModal(true);
  };

  const startTimeout = async () => {
    const quarter = matchData.quarter;
    const qKey = matchData.isOvertime ? `ot${quarter - 4}` : `q${quarter}`;
    const teamKey = timeoutTeam === 'A' ? 'teamA' : 'teamB';
    const currentTimeouts = matchData.timeouts[teamKey][qKey];
    
    if (currentTimeouts <= 0) {
      showNotification('No timeouts remaining');
      return;
    }

    // Pause match timer
    await stopTimer();
    
    // Update timeout count
    const updates = {};
    updates[`matches/current/timeouts/${teamKey}/${qKey}`] = currentTimeouts - 1;
    updates['matches/current/lastUpdated'] = Date.now();
    
    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      setTimeoutSeconds(60); // 1 minute timeout
      setTimeoutActive(true);
      setShowTimeoutModal(false);
      showNotification(`Timeout started for ${timeoutTeam === 'A' ? matchData.teamA : matchData.teamB}`);
    } catch (error) {
      console.error('Error starting timeout:', error);
      showNotification('Failed to start timeout');
    }
  };

  const cancelTimeout = () => {
    setShowTimeoutModal(false);
    setTimeoutTeam(null);
  };

  const addPlayer = async () => {
    if (!newPlayer.name || !newPlayer.jersey) {
      showNotification('Please enter player name and jersey number');
      return;
    }

    const playerId = `player_${Date.now()}`;
    const playerData = {
      name: newPlayer.name,
      jersey: newPlayer.jersey,
      team: selectedTeam,
      points: 0,
      fouls: 0
    };

    const updates = {};
    updates[`matches/current/players/${playerId}`] = playerData;
    updates['matches/current/lastUpdated'] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      setNewPlayer({ name: '', jersey: '', team: selectedTeam });
      setShowAddPlayer(false);
      showNotification(`Player ${newPlayer.name} added!`);
    } catch (error) {
      console.error('Error adding player:', error);
      showNotification('Failed to add player');
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Expected format: [{ Name: "Player Name", Jersey: "12", Team: "A" }, ...]
      const updates = {};
      let addedCount = 0;

      jsonData.forEach((row) => {
        const name = row.Name || row.name || row.PlayerName || row['Player Name'];
        const jersey = String(row.Jersey || row.jersey || row.Number || row.number || '');
        const team = String(row.Team || row.team || 'A').toUpperCase();

        if (name && jersey && (team === 'A' || team === 'B')) {
          const playerId = `player_${Date.now()}_${addedCount}`;
          updates[`matches/current/players/${playerId}`] = {
            name: String(name).trim(),
            jersey: jersey.trim(),
            team: team,
            points: 0,
            fouls: 0
          };
          addedCount++;
        }
      });

      if (addedCount === 0) {
        showNotification('No valid players found in Excel file');
        return;
      }

      updates['matches/current/lastUpdated'] = Date.now();
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification(`Successfully imported ${addedCount} players!`);
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading Excel:', error);
      showNotification('Failed to import Excel file. Check format.');
    }
  };

  const updatePlayerScore = async (playerId, player, pointsToAdd) => {
    const newPoints = (player.points || 0) + pointsToAdd;
    
    // Calculate new team total
    const teamPlayers = Object.entries(matchData.players || {}).filter(([_, p]) => p.team === player.team);
    let teamTotal = 0;
    teamPlayers.forEach(([id, p]) => {
      if (id === playerId) {
        teamTotal += newPoints;
      } else {
        teamTotal += (p.points || 0);
      }
    });

    const updates = {};
    updates[`matches/current/players/${playerId}/points`] = newPoints;
    updates[`matches/current/score${player.team.toUpperCase()}`] = teamTotal;
    updates['matches/current/lastUpdated'] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification(`+${pointsToAdd} points for ${player.name}!`);
    } catch (error) {
      console.error('Error updating score:', error);
      showNotification('Failed to update score');
    }
  };

  const undoPlayerScore = async (playerId, player, pointsToRemove) => {
    const newPoints = Math.max(0, (player.points || 0) - pointsToRemove);
    
    // Calculate new team total
    const teamPlayers = Object.entries(matchData.players || {}).filter(([_, p]) => p.team === player.team);
    let teamTotal = 0;
    teamPlayers.forEach(([id, p]) => {
      if (id === playerId) {
        teamTotal += newPoints;
      } else {
        teamTotal += (p.points || 0);
      }
    });

    const updates = {};
    updates[`matches/current/players/${playerId}/points`] = newPoints;
    updates[`matches/current/score${player.team.toUpperCase()}`] = teamTotal;
    updates['matches/current/lastUpdated'] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification(`Undo: -${pointsToRemove} points for ${player.name}`);
    } catch (error) {
      console.error('Error undoing score:', error);
      showNotification('Failed to undo score');
    }
  };

  const updatePlayerFouls = async (playerId, player) => {
    const newFouls = (player.fouls || 0) + 1;

    const updates = {};
    updates[`matches/current/players/${playerId}/fouls`] = newFouls;
    updates['matches/current/lastUpdated'] = Date.now();
    
    // Check for 5 fouls
    if (newFouls >= 5) {
      updates['matches/current/isRunning'] = false;
      
      // Get all players in the team
      const allTeamPlayers = Object.entries(matchData?.players || {})
        .filter(([_, p]) => p.team === player.team);
      const totalTeamPlayers = allTeamPlayers.length;
      
      // Get bench players (not currently playing and without 5 fouls)
      const playing = player.team === 'A' ? teamAPlaying : teamBPlaying;
      const availableBenchPlayers = allTeamPlayers.filter(([id, p]) => 
        !playing.includes(id) && (p.fouls || 0) < 5
      );
      
      // Case 1: Exactly 6 players (5 playing + 1 bench) - Auto substitute
      if (totalTeamPlayers === 6 && availableBenchPlayers.length === 1) {
        const substitutePlayer = availableBenchPlayers[0];
        const newPlaying = playing.map(id => id === playerId ? substitutePlayer[0] : id);
        
        if (player.team === 'A') {
          setTeamAPlaying(newPlaying);
          updates['matches/current/teamAPlaying'] = newPlaying;
        } else {
          setTeamBPlaying(newPlaying);
          updates['matches/current/teamBPlaying'] = newPlaying;
        }
        
        showNotification(`⚠️ ${player.name} has 5 fouls! Auto-substituted with ${substitutePlayer[1].name}`);
      } 
      // Case 2: More than 6 players - Player is disqualified, must substitute manually
      else if (totalTeamPlayers > 6) {
        setFoulWarning({
          player: player.name,
          jersey: player.jersey,
          team: player.team === 'A' ? matchData?.teamA : matchData?.teamB,
          playerTeam: player.team,
          playerId: playerId,
          disqualified: true
        });
        showNotification(`⚠️ ${player.name} has 5 fouls! Player disqualified.`);
      }
      // Case 3: Less than 6 players or no bench available
      else {
        setFoulWarning({
          player: player.name,
          jersey: player.jersey,
          team: player.team === 'A' ? matchData?.teamA : matchData?.teamB,
          playerTeam: player.team,
          playerId: playerId,
          disqualified: false
        });
        showNotification(`⚠️ ${player.name} has 5 fouls! Match paused.`);
      }
    }

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      if (newFouls < 5) {
        showNotification(`Foul added for ${player.name}!`);
      }
    } catch (error) {
      console.error('Error updating fouls:', error);
      showNotification('Failed to update fouls');
    }
  };

  const undoPlayerFoul = async (playerId, player) => {
    const newFouls = Math.max(0, (player.fouls || 0) - 1);

    const updates = {};
    updates[`matches/current/players/${playerId}/fouls`] = newFouls;
    updates['matches/current/lastUpdated'] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification(`Undo: Foul removed for ${player.name}`);
    } catch (error) {
      console.error('Error undoing foul:', error);
      showNotification('Failed to undo foul');
    }
  };

  const deletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Delete player ${playerName}?`)) return;

    const updates = {};
    updates[`matches/current/players/${playerId}`] = null;
    updates['matches/current/lastUpdated'] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
      showNotification(`Player ${playerName} removed!`);
    } catch (error) {
      console.error('Error deleting player:', error);
      showNotification('Failed to delete player');
    }
  };

  // Login Screen
  if (!authenticated) {
    return (
      <div className="admin-login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-icon">
            <Lock size={60} />
          </div>
          <h1>Admin Access</h1>
          <p>Enter password to access scoring panel</p>
          {error && (
            <div className="login-error" style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              autoFocus
              disabled={isLocked}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary" disabled={isLocked}>
              <Lock size={20} />
              {isLocked ? 'Account Locked' : 'Login'}
            </button>
          </form>
          {loginAttempts > 0 && !isLocked && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#ef4444' }}>
              {5 - loginAttempts} attempts remaining
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">🏀</div>
        <p>Loading scoring panel...</p>
      </div>
    );
  }

  const teamAPlayers = Object.entries(matchData?.players || {}).filter(([_, player]) => player.team === 'A');
  const teamBPlayers = Object.entries(matchData?.players || {}).filter(([_, player]) => player.team === 'B');

  // STAGE 0: MENU - Choose action
  if (matchStage === 'menu') {
    return (
      <div className="admin-scoring-container menu-stage dark-theme">
        {notification && (
          <motion.div className="notification" initial={{ y: -50 }} animate={{ y: 0 }}>
            {notification}
          </motion.div>
        )}
        
        <div className="admin-header">
          <h1><Trophy size={32} /> Admin Scoring Panel</h1>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="menu-content">
          <h2>What would you like to do?</h2>
          <div className="menu-options">
            <motion.button
              className="menu-option-card"
              onClick={async () => {
                // Reset form for new match
                setIsMatchScheduled(false);
                setMatchScheduleData({
                  matchType: 'Boys',
                  court: 'Court A',
                  date: '',
                  time: '',
                  roundType: 'Knockout Round'
                });
                
                const updates = {};
                updates['matches/current/matchStage'] = 'setup';
                updates['matches/current/teamA'] = '';
                updates['matches/current/teamB'] = '';
                updates['matches/current/players'] = {};
                updates['matches/current/scheduleId'] = null;
                updates['matches/current/lastUpdated'] = Date.now();
                await firebase.update(firebase.ref(firebase.database), updates);
                setMatchStage('setup');
                showNotification('Starting new match setup...');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="menu-icon">📅</div>
              <h3>Schedule a Match</h3>
              <p>Set up teams and players for a new match</p>
            </motion.button>

            <motion.button
              className="menu-option-card"
              onClick={async () => {
                // Check if there's a scheduled match
                if (!matchData?.players || Object.keys(matchData.players).length === 0) {
                  showNotification('No scheduled match found. Please schedule a match first.');
                  return;
                }
                const updates = {};
                updates['matches/current/matchStage'] = 'selectPlaying5';
                updates['matches/current/lastUpdated'] = Date.now();
                await firebase.update(firebase.ref(firebase.database), updates);
                setMatchStage('selectPlaying5');
                showNotification('Starting match scoring...');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="menu-icon">🏀</div>
              <h3>Start Scoring for Scheduled Match</h3>
              <p>Begin live scoring for an already scheduled match</p>
            </motion.button>

            <motion.button
              className="menu-option-card"
              onClick={() => {
                setShowPastMatchesModal(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="menu-icon">📊</div>
              <h3>View Score of Past Match</h3>
              <p>Review scores and statistics from previous matches ({pastMatches.length})</p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 1: SETUP - Add all players
  if (matchStage === 'setup') {
    return (
      <div className="admin-scoring-container setup-stage dark-theme">
        {notification && (
          <motion.div className="notification" initial={{ y: -50 }} animate={{ y: 0 }}>
            {notification}
          </motion.div>
        )}
        
        <div className="admin-header">
          <h1><Trophy size={32} /> Match Setup</h1>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="setup-content">
          {/* Match Scheduling Form */}
          <div className="match-schedule-form">
            <h2 className="form-section-title">📅 Schedule Match Details</h2>
            <div className="schedule-form-grid">
              <div className="form-group">
                <label>Team A Name</label>
                <input
                  type="text"
                  value={matchData?.teamA || ''}
                  onChange={(e) => updateMatchInfo('teamA', e.target.value)}
                  className="form-input"
                  placeholder="e.g., NMIMS Mumbai"
                  disabled={isMatchScheduled}
                />
              </div>
              <div className="form-group">
                <label>Team B Name</label>
                <input
                  type="text"
                  value={matchData?.teamB || ''}
                  onChange={(e) => updateMatchInfo('teamB', e.target.value)}
                  className="form-input"
                  placeholder="e.g., NMIMS Bangalore"
                  disabled={isMatchScheduled}
                />
              </div>
              <div className="form-group">
                <label>Match Type</label>
                <select
                  value={matchScheduleData.matchType}
                  onChange={(e) => setMatchScheduleData({...matchScheduleData, matchType: e.target.value})}
                  className="form-select"
                  disabled={isMatchScheduled}
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
              <div className="form-group">
                <label>Court</label>
                <select
                  value={matchScheduleData.court}
                  onChange={(e) => setMatchScheduleData({...matchScheduleData, court: e.target.value})}
                  className="form-select"
                  disabled={isMatchScheduled}
                >
                  <option value="Court A">Court A</option>
                  <option value="Court B">Court B</option>
                  <option value="Main Court">Main Court</option>
                  <option value="Court C">Court C</option>
                </select>
              </div>
              <div className="form-group">
                <label>Round Type</label>
                <select
                  value={matchScheduleData.roundType}
                  onChange={(e) => setMatchScheduleData({...matchScheduleData, roundType: e.target.value})}
                  className="form-select"
                  disabled={isMatchScheduled}
                >
                  <option value="Knockout Round">Knockout Round</option>
                  <option value="Quarter Final">Quarter Final</option>
                  <option value="Semi Final">Semi Final</option>
                  <option value="Championship Final">Championship Final</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={matchScheduleData.date}
                  onChange={(e) => setMatchScheduleData({...matchScheduleData, date: e.target.value})}
                  className="form-input"
                  disabled={isMatchScheduled}
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={matchScheduleData.time}
                  onChange={(e) => setMatchScheduleData({...matchScheduleData, time: e.target.value})}
                  className="form-input"
                  disabled={isMatchScheduled}
                />
              </div>
            </div>
            {!isMatchScheduled && (
              <button onClick={scheduleMatch} className="schedule-match-btn">
                📅 Schedule Match
              </button>
            )}
            {isMatchScheduled && (
              <div className="schedule-success-badge">
                ✅ Match Scheduled Successfully! Now add players below.
              </div>
            )}
          </div>

          {/* Player Management Section - Only show after scheduling */}
          {isMatchScheduled && (
            <>
              <div className="section-divider"></div>
              <h2 className="form-section-title">👥 Add Team Players</h2>
            </>
          )}

          {/* Excel Upload Section - Only show after scheduling */}
          {isMatchScheduled && (
            <>
              <div className="excel-upload-section">
                <div className="upload-info">
                  <FileSpreadsheet size={32} />
                  <div>
                    <h3>Quick Import Players</h3>
                    <p>Upload an Excel file with columns: Name, Jersey, Team (A or B)</p>
                    <a 
                      href="/sample-players-template.csv" 
                      download 
                      className="download-template-link"
                    >
                      Download Sample Template
                    </a>
                  </div>
                </div>
                <label htmlFor="excel-upload" className="excel-upload-btn">
                  <Upload size={20} />
                  Upload Excel File
                  <input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="players-setup-grid">
            <div className="team-players-section">
              <h2><Users size={24} /> {matchData?.teamA || 'Team A'} Players ({teamAPlayers.length})</h2>
              <button onClick={() => { setSelectedTeam('A'); setShowAddPlayer(true); }} className="add-player-btn">
                <Plus size={20} /> Add Player
              </button>
              <div className="players-list-setup">
                {teamAPlayers.map(([id, player]) => (
                  <div key={id} className="player-setup-card">
                    <span className="jersey">#{player.jersey}</span>
                    <span className="name">{player.name}</span>
                    <button onClick={() => deletePlayer(id, player.name)} className="remove-btn">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {teamAPlayers.length === 0 && <div className="no-players">No players added yet</div>}
              </div>
            </div>

            <div className="team-players-section">
              <h2><Users size={24} /> {matchData?.teamB || 'Team B'} Players ({teamBPlayers.length})</h2>
              <button onClick={() => { setSelectedTeam('B'); setShowAddPlayer(true); }} className="add-player-btn">
                <Plus size={20} /> Add Player
              </button>
              <div className="players-list-setup">
                {teamBPlayers.map(([id, player]) => (
                  <div key={id} className="player-setup-card">
                    <span className="jersey">#{player.jersey}</span>
                    <span className="name">{player.name}</span>
                    <button onClick={() => deletePlayer(id, player.name)} className="remove-btn">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {teamBPlayers.length === 0 && <div className="no-players">No players added yet</div>}
              </div>
            </div>
          </div>

              <div className="action-buttons-row">
                <button onClick={goBackToMenu} className="back-btn">
                  ← Back to Menu
                </button>
                <button 
                  onClick={proceedToSelectPlaying5} 
                  className="proceed-btn"
                  disabled={teamAPlayers.length < 5 || teamBPlayers.length < 5}
                >
                  Proceed to Select Playing 5 →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add Player Modal */}
        <AnimatePresence>
          {showAddPlayer && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <h3>Add Player to {selectedTeam === 'A' ? matchData?.teamA : matchData?.teamB}</h3>
                <input
                  type="text"
                  placeholder="Player Name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Jersey Number"
                  value={newPlayer.jersey}
                  onChange={(e) => setNewPlayer({ ...newPlayer, jersey: e.target.value })}
                  className="input-field"
                />
                <div className="modal-actions">
                  <button onClick={() => setShowAddPlayer(false)} className="cancel-btn">Cancel</button>
                  <button onClick={addPlayer} className="confirm-btn">Add Player</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // STAGE 2: SELECT PLAYING 5
  if (matchStage === 'selectPlaying5') {
    return (
      <div className="admin-scoring-container select-playing-stage dark-theme">
        {notification && (
          <motion.div className="notification" initial={{ y: -50 }} animate={{ y: 0 }}>
            {notification}
          </motion.div>
        )}
        
        <div className="admin-header">
          <h1><Trophy size={32} /> Select Playing 5</h1>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="select-playing-content">
          <div className="selection-grid">
            <div className="team-selection-section">
              <h2>{matchData?.teamA || 'Team A'}</h2>
              <div className="selected-count">{teamAPlaying.length} / 5 selected</div>
              <div className="players-selection-list">
                {teamAPlayers.map(([id, player]) => (
                  <div
                    key={id}
                    className={`player-selection-card ${teamAPlaying.includes(id) ? 'selected' : ''}`}
                    onClick={() => togglePlayingPlayer('A', id)}
                  >
                    <span className="jersey">#{player.jersey}</span>
                    <span className="name">{player.name}</span>
                    {teamAPlaying.includes(id) && <span className="checkmark">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="team-selection-section">
              <h2>{matchData?.teamB || 'Team B'}</h2>
              <div className="selected-count">{teamBPlaying.length} / 5 selected</div>
              <div className="players-selection-list">
                {teamBPlayers.map(([id, player]) => (
                  <div
                    key={id}
                    className={`player-selection-card ${teamBPlaying.includes(id) ? 'selected' : ''}`}
                    onClick={() => togglePlayingPlayer('B', id)}
                  >
                    <span className="jersey">#{player.jersey}</span>
                    <span className="name">{player.name}</span>
                    {teamBPlaying.includes(id) && <span className="checkmark">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="action-buttons-row">
            <button onClick={goBackToSetup} className="back-btn">
              ← Back to Setup
            </button>
            <button 
              onClick={startMatchWithPlaying5} 
              className="start-match-btn"
              disabled={teamAPlaying.length !== 5 || teamBPlaying.length !== 5}
            >
              <Play size={20} /> Start Match
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 3: MATCH - Continue with existing match UI but modified
  return (
    <div className="admin-scoring-container dark-theme">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <Trophy size={32} />
          <div>
            <h1>Admin Scoring Panel</h1>
            <p>Live Match Control</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={endMatch} className="end-match-button">
            <Trophy size={20} />
            End Match
          </button>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Timer and Quarter Controls */}
      <div className="timer-quarter-section">
        <div className="timer-controls">
          <Clock size={24} />
          <div className="timer-display">{formatTime(timerSeconds)}</div>
          <div className="timer-buttons">
            {!matchData?.isRunning ? (
              <button onClick={startTimer} className="timer-btn start-btn">
                <Play size={18} />
                Start
              </button>
            ) : (
              <button onClick={stopTimer} className="timer-btn pause-btn">
                <Pause size={18} />
                Pause
              </button>
            )}
            <button onClick={resetTimer} className="timer-btn reset-btn">
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
          
          {/* Timeout Display */}
          {timeoutActive && (
            <motion.div 
              className="timeout-display"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="timeout-label">⏸️ TIMEOUT</div>
              <div className="timeout-timer">{formatTime(timeoutSeconds)}</div>
              <div className="timeout-team">{timeoutTeam === 'A' ? matchData?.teamA : matchData?.teamB}</div>
              <button onClick={endTimeout} className="end-timeout-btn">End Timeout</button>
            </motion.div>
          )}
        </div>
        
        <div className="quarter-controls">
          <div className="quarter-header">
            <label>Quarter {matchData?.isOvertime ? `(OT${matchData.quarter - 4})` : ''}</label>
            <button 
              onClick={() => setShowTimeSettings(!showTimeSettings)}
              className="time-settings-btn"
              title="Time Settings"
            >
              ⚙️
            </button>
          </div>
          
          {showTimeSettings && (
            <motion.div 
              className="time-settings"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label>Quarter Duration (minutes)</label>
              <div className="duration-selector">
                {[5, 8, 10, 12, 15].map(min => (
                  <button
                    key={min}
                    onClick={() => updateQuarterDuration(min)}
                    className={`duration-btn ${(matchData?.quarterDuration || quarterDuration) === min ? 'active' : ''}`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          <div className="quarter-buttons">
            {[1, 2, 3, 4].map(q => (
              <button
                key={q}
                onClick={() => changeQuarter(q)}
                className={`quarter-btn ${matchData?.quarter === q && !matchData?.isOvertime ? 'active' : ''}`}
              >
                Q{q}
              </button>
            ))}
          </div>
          
          {/* Overtime Controls */}
          {checkForOvertime() && (
            <motion.div 
              className="overtime-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>⚠️ Game is tied!</span>
              <button onClick={startOvertime} className="overtime-btn">
                Start Overtime
              </button>
            </motion.div>
          )}
          
          {matchData?.isOvertime && (
            <div className="overtime-controls">
              <div className="overtime-label">OVERTIME</div>
              <div className="overtime-buttons">
                {[5, 6, 7, 8, 9].map(q => (
                  <button
                    key={q}
                    onClick={() => changeQuarter(q, true)}
                    className={`quarter-btn overtime-btn ${matchData?.quarter === q ? 'active' : ''}`}
                  >
                    OT{q - 4}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Info */}
      <div className="match-info-section">
        <div className="match-info-card">
          <label>Team A Name</label>
          <input
            type="text"
            value={matchData?.teamA || ''}
            onChange={(e) => updateMatchInfo('teamA', e.target.value)}
            className="team-name-input"
          />
          <div className="timeout-info">
            <button 
              onClick={() => requestTimeout('A')} 
              className="timeout-request-btn"
              disabled={timeoutActive || getAvailableTimeouts('A') === 0}
            >
              ⏸️ Timeout ({getAvailableTimeouts('A')})
            </button>
          </div>
        </div>
        <div className="match-score-display">
          <div className="score-big">{matchData?.scoreA || 0}</div>
          <div className="vs-text">VS</div>
          <div className="score-big">{matchData?.scoreB || 0}</div>
        </div>
        <div className="match-info-card">
          <label>Team B Name</label>
          <input
            type="text"
            value={matchData?.teamB || ''}
            onChange={(e) => updateMatchInfo('teamB', e.target.value)}
            className="team-name-input"
          />
          <div className="timeout-info">
            <button 
              onClick={() => requestTimeout('B')} 
              className="timeout-request-btn"
              disabled={timeoutActive || getAvailableTimeouts('B') === 0}
            >
              ⏸️ Timeout ({getAvailableTimeouts('B')})
            </button>
          </div>
        </div>
      </div>

      {/* Compact Match View - All Players Visible */}
      <div className="compact-match-view">
        {/* Team Names Row */}
        <div className="team-names-row">
          <div className="team-name-box">{matchData?.teamA || 'Team A'}</div>
          <div className="team-name-box">{matchData?.teamB || 'Team B'}</div>
        </div>

        {/* Playing 5 Players Row - Simple Button Layout */}
        <div className="playing-five-row">
          {/* Team A Players */}
          <div className="team-players-simple">
            {getPlayingPlayers('A').map((player, index) => (
              <div key={player.id} className="player-button-wrapper">
                <button 
                  className={`player-button ${expandedPlayer === player.id ? 'expanded' : ''} ${(player.fouls || 0) >= 5 ? 'disqualified' : ''}`}
                  onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
                >
                  <div className="player-btn-header">P{index + 1}</div>
                  <div className="player-btn-name">{player.name}</div>
                  <div className="player-btn-jersey">#{player.jersey}</div>
                  <div className="player-btn-stats">
                    {player.points || 0}pts | {player.fouls || 0}F
                    {(player.fouls || 0) >= 5 && <span className="disqualified-badge">DISQUALIFIED</span>}
                  </div>
                </button>
                
                {/* Action Panel - Shows when expanded */}
                {expandedPlayer === player.id && (
                  <motion.div 
                    className="action-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <button onClick={() => updatePlayerScore(player.id, player, 1)} className="action-btn score-1">+1</button>
                    <button onClick={() => updatePlayerScore(player.id, player, 2)} className="action-btn score-2">+2</button>
                    <button onClick={() => updatePlayerScore(player.id, player, 3)} className="action-btn score-3">+3</button>
                    <button onClick={() => updatePlayerFouls(player.id, player)} className="action-btn foul-action">Foul</button>
                    <button onClick={() => undoPlayerScore(player.id, player, 1)} className="action-btn undo-action">Undo Score</button>
                    <button onClick={() => undoPlayerFoul(player.id, player)} className="action-btn undo-action">Undo Foul</button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Team B Players */}
          <div className="team-players-simple">
            {getPlayingPlayers('B').map((player, index) => (
              <div key={player.id} className="player-button-wrapper">
                <button 
                  className={`player-button ${expandedPlayer === player.id ? 'expanded' : ''} ${(player.fouls || 0) >= 5 ? 'disqualified' : ''}`}
                  onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
                >
                  <div className="player-btn-header">P{index + 1}</div>
                  <div className="player-btn-name">{player.name}</div>
                  <div className="player-btn-jersey">#{player.jersey}</div>
                  <div className="player-btn-stats">
                    {player.points || 0}pts | {player.fouls || 0}F
                    {(player.fouls || 0) >= 5 && <span className="disqualified-badge">DISQUALIFIED</span>}
                  </div>
                </button>
                
                {/* Action Panel - Shows when expanded */}
                {expandedPlayer === player.id && (
                  <motion.div 
                    className="action-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <button onClick={() => updatePlayerScore(player.id, player, 1)} className="action-btn score-1">+1</button>
                    <button onClick={() => updatePlayerScore(player.id, player, 2)} className="action-btn score-2">+2</button>
                    <button onClick={() => updatePlayerScore(player.id, player, 3)} className="action-btn score-3">+3</button>
                    <button onClick={() => updatePlayerFouls(player.id, player)} className="action-btn foul-action">Foul</button>
                    <button onClick={() => undoPlayerScore(player.id, player, 1)} className="action-btn undo-action">Undo Score</button>
                    <button onClick={() => undoPlayerFoul(player.id, player)} className="action-btn undo-action">Undo Foul</button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Substitute Players Section */}
        <div className="substitute-section-row">
          {/* Team A Substitute */}
          <div className="substitute-column">
            <div className="substitute-header">
              <span>Substitute Players</span>
              <button onClick={() => openSubstitution('A')} className="substitute-btn-compact">
                <RefreshCw size={14} /> Substitute
              </button>
            </div>
            <div className="substitute-players-list">
              {getBenchPlayers('A').slice(0, 3).map((player) => (
                <div key={player.id} className="substitute-player-item">
                  P{getPlayingPlayers('A').length + getBenchPlayers('A').indexOf(player) + 1}: {player.name} (#{player.jersey})
                </div>
              ))}
              {getBenchPlayers('A').length === 0 && (
                <div className="no-bench-players">No substitute players</div>
              )}
            </div>
          </div>

          {/* Team B Substitute */}
          <div className="substitute-column">
            <div className="substitute-header">
              <span>Substitute Players</span>
              <button onClick={() => openSubstitution('B')} className="substitute-btn-compact">
                <RefreshCw size={14} /> Substitute
              </button>
            </div>
            <div className="substitute-players-list">
              {getBenchPlayers('B').slice(0, 3).map((player) => (
                <div key={player.id} className="substitute-player-item">
                  P{getPlayingPlayers('B').length + getBenchPlayers('B').indexOf(player) + 1}: {player.name} (#{player.jersey})
                </div>
              ))}
              {getBenchPlayers('B').length === 0 && (
                <div className="no-bench-players">No substitute players</div>
              )}
            </div>
          </div>
        </div>

        {/* Quarter Scores Display - At Bottom */}
        {matchData?.quarterScores && (
          <div className="quarter-scores-bottom">
            <h3>Quarter Scores</h3>
            <div className="quarter-scores-grid">
              {[1, 2, 3, 4].map(q => {
                const qKey = `q${q}`;
                const qScore = matchData.quarterScores[qKey] || { teamA: 0, teamB: 0 };
                return (
                  <div key={q} className={`quarter-score-card ${matchData.quarter === q && !matchData.isOvertime ? 'current' : ''}`}>
                    <div className="quarter-label">Q{q}</div>
                    <div className="quarter-score-row">
                      <span className="team-score">{qScore.teamA}</span>
                      <span className="score-divider">-</span>
                      <span className="team-score">{qScore.teamB}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Overtime Scores */}
            {matchData.isOvertime && (
              <>
                <h3 className="overtime-scores-title">Overtime Scores</h3>
                <div className="quarter-scores-grid">
                  {[1, 2, 3, 4, 5].map(ot => {
                    const otKey = `ot${ot}`;
                    const otScore = matchData.quarterScores[otKey];
                    if (!otScore) return null;
                    return (
                      <div key={otKey} className={`quarter-score-card overtime-card ${matchData.quarter === ot + 4 ? 'current' : ''}`}>
                        <div className="quarter-label">OT{ot}</div>
                        <div className="quarter-score-row">
                          <span className="team-score">{otScore.teamA}</span>
                          <span className="score-divider">-</span>
                          <span className="team-score">{otScore.teamB}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 5 Foul Warning Modal */}
      <AnimatePresence>
        {foulWarning && (
          <motion.div
            className="foul-warning-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="foul-warning-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <AlertTriangle size={64} color="#ef4444" />
              <h2>⚠️ 5 FOULS!</h2>
              <p className="player-name">#{foulWarning.jersey} {foulWarning.player}</p>
              <p className="team-name">{foulWarning.team}</p>
              
              {foulWarning.disqualified ? (
                <>
                  <p className="warning-text critical">
                    This player has committed 5 fouls and is <strong>PERMANENTLY DISQUALIFIED</strong> from this match.
                    <br /><br />
                    They cannot re-enter or substitute back in for the rest of the game.
                  </p>
                  <p className="match-status">Match is PAUSED</p>
                  <button 
                    onClick={() => {
                      setFoulWarning(null);
                      openSubstitution(foulWarning.playerTeam);
                    }} 
                    className="acknowledge-btn critical"
                  >
                    Substitute Player
                  </button>
                </>
              ) : (
                <>
                  <p className="warning-text">
                    This player has committed 5 fouls and must be substituted immediately.
                  </p>
                  <p className="match-status">Match is PAUSED</p>
                  <button 
                    onClick={() => {
                      setFoulWarning(null);
                      openSubstitution(foulWarning.playerTeam);
                    }} 
                    className="acknowledge-btn"
                  >
                    Acknowledge & Substitute
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Substitution Modal */}
      <AnimatePresence>
        {showSubstitution && (
          <motion.div
            className="substitution-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="substitution-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2>Substitute Player - {substituteTeam === 'A' ? matchData?.teamA : matchData?.teamB}</h2>
              
              <div className="substitution-section">
                <h3>Player OUT (from court)</h3>
                <div className="player-options">
                  {getPlayingPlayers(substituteTeam).map(player => (
                    <div
                      key={player.id}
                      className={`player-option ${substituteOut === player.id ? 'selected' : ''}`}
                      onClick={() => setSubstituteOut(player.id)}
                    >
                      <span className="jersey">#{player.jersey}</span>
                      <span className="name">{player.name}</span>
                      <span className="stats">({player.points}pts, {player.fouls}F)</span>
                      {substituteOut === player.id && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="substitution-section">
                <h3>Player IN (from bench)</h3>
                <div className="player-options">
                  {getBenchPlayers(substituteTeam).map(player => {
                    const hasFiveFouls = (player.fouls || 0) >= 5;
                    return (
                      <div
                        key={player.id}
                        className={`player-option ${substituteIn === player.id ? 'selected' : ''} ${hasFiveFouls ? 'disabled' : ''}`}
                        onClick={() => {
                          if (!hasFiveFouls) {
                            setSubstituteIn(player.id);
                          } else {
                            showNotification('Cannot select player with 5 fouls');
                          }
                        }}
                      >
                        <span className="jersey">#{player.jersey}</span>
                        <span className="name">{player.name}</span>
                        <span className="stats">({player.points}pts, {player.fouls}F)</span>
                        {hasFiveFouls && <span className="foul-badge">5 FOULS</span>}
                        {substituteIn === player.id && <span className="check">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={() => setShowSubstitution(false)} className="cancel-btn">
                  Cancel
                </button>
                <button 
                  onClick={confirmSubstitution} 
                  className="confirm-btn"
                  disabled={!substituteOut || !substituteIn}
                >
                  Confirm Substitution
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeout Confirmation Modal */}
      <AnimatePresence>
        {showTimeoutModal && (
          <motion.div
            className="timeout-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="timeout-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2>⏸️ Request Timeout</h2>
              <p className="timeout-team-name">
                {timeoutTeam === 'A' ? matchData?.teamA : matchData?.teamB}
              </p>
              <div className="timeout-details">
                <p>Duration: <strong>1 minute</strong></p>
                <p>Remaining: <strong>{getAvailableTimeouts(timeoutTeam)} timeout(s)</strong></p>
                <p className="timeout-note">
                  {matchData?.quarter === 4 ? 'Q4 has 4 timeouts' : 'Q1-Q3 have 2 timeouts each'}
                </p>
              </div>
              <div className="modal-actions">
                <button onClick={cancelTimeout} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={startTimeout} className="confirm-btn">
                  Start Timeout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Match Modal */}
      <AnimatePresence>
        {showSaveMatchModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="save-match-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <Save size={48} color="#FF6B35" />
              <h2>End Match</h2>
              <p className="save-match-question">Would you like to save this match?</p>
              <div className="match-summary">
                <div className="summary-row">
                  <span className="team-name">{matchData?.teamA}</span>
                  <span className="score-display">{matchData?.scoreA}</span>
                </div>
                <div className="vs-divider">VS</div>
                <div className="summary-row">
                  <span className="team-name">{matchData?.teamB}</span>
                  <span className="score-display">{matchData?.scoreB}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowSaveMatchModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={endWithoutSaving} className="delete-btn">
                  Don't Save
                </button>
                <button onClick={saveAndEndMatch} className="confirm-btn">
                  <Save size={18} /> Save Match
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past Matches Modal */}
      <AnimatePresence>
        {showPastMatchesModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="past-matches-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="past-matches-header">
                <h2>📊 Past Matches</h2>
                <button onClick={() => { setShowPastMatchesModal(false); setSelectedPastMatch(null); }} className="close-btn">
                  ✕
                </button>
              </div>

              {selectedPastMatch ? (
                // Detailed view of selected match
                <div className="past-match-detail">
                  <button onClick={() => setSelectedPastMatch(null)} className="back-to-list-btn">
                    ← Back to List
                  </button>
                  
                  <div className="match-detail-header">
                    <h3>{selectedPastMatch.teamA} vs {selectedPastMatch.teamB}</h3>
                    <p className="match-date">{new Date(selectedPastMatch.date).toLocaleString()}</p>
                  </div>

                  <div className="final-score-display">
                    <div className="team-score-box">
                      <div className="team-name">{selectedPastMatch.teamA}</div>
                      <div className="final-score">{selectedPastMatch.scoreA}</div>
                    </div>
                    <div className="vs-text">VS</div>
                    <div className="team-score-box">
                      <div className="team-name">{selectedPastMatch.teamB}</div>
                      <div className="final-score">{selectedPastMatch.scoreB}</div>
                    </div>
                  </div>

                  {/* Quarter Scores */}
                  <div className="quarter-breakdown">
                    <h4>Quarter Breakdown</h4>
                    <div className="quarter-scores-table">
                      {[1, 2, 3, 4].map(q => {
                        const qKey = `q${q}`;
                        const qScore = selectedPastMatch.quarterScores?.[qKey] || { teamA: 0, teamB: 0 };
                        return (
                          <div key={q} className="quarter-row">
                            <span className="quarter-label">Q{q}</span>
                            <span className="quarter-score">{qScore.teamA} - {qScore.teamB}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Player Stats */}
                  <div className="player-stats-section">
                    <h4>Player Statistics</h4>
                    <div className="teams-stats-grid">
                      <div className="team-stats">
                        <h5>{selectedPastMatch.teamA}</h5>
                        {Object.entries(selectedPastMatch.players || {})
                          .filter(([_, p]) => p.team === 'A')
                          .sort((a, b) => (b[1].points || 0) - (a[1].points || 0))
                          .map(([id, player]) => (
                            <div key={id} className="player-stat-row">
                              <span className="player-name">#{player.jersey} {player.name}</span>
                              <span className="player-stats">{player.points || 0}pts, {player.fouls || 0}F</span>
                            </div>
                          ))}
                      </div>
                      <div className="team-stats">
                        <h5>{selectedPastMatch.teamB}</h5>
                        {Object.entries(selectedPastMatch.players || {})
                          .filter(([_, p]) => p.team === 'B')
                          .sort((a, b) => (b[1].points || 0) - (a[1].points || 0))
                          .map(([id, player]) => (
                            <div key={id} className="player-stat-row">
                              <span className="player-name">#{player.jersey} {player.name}</span>
                              <span className="player-stats">{player.points || 0}pts, {player.fouls || 0}F</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => deletePastMatch(selectedPastMatch.id)} className="delete-match-btn">
                    <Trash2 size={18} /> Delete Match
                  </button>
                </div>
              ) : (
                // List of past matches
                <div className="past-matches-list">
                  {pastMatches.length === 0 ? (
                    <div className="no-matches">
                      <p>No past matches found</p>
                      <p className="hint">Matches will appear here after you save them</p>
                    </div>
                  ) : (
                    pastMatches.map((match) => (
                      <div key={match.id} className="past-match-card" onClick={() => viewPastMatch(match)}>
                        <div className="match-card-header">
                          <span className="match-teams">{match.teamA} vs {match.teamB}</span>
                          <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
                        </div>
                        <div className="match-card-score">
                          <span className="score">{match.scoreA} - {match.scoreB}</span>
                          <span className={`winner ${match.scoreA > match.scoreB ? 'team-a' : match.scoreB > match.scoreA ? 'team-b' : 'tie'}`}>
                            {match.scoreA > match.scoreB ? match.teamA : match.scoreB > match.scoreA ? match.teamB : 'Tie'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminScoring;
