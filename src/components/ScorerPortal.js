import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Plus, Minus, Users, Trophy, 
  Clock, LogOut, Home, AlertTriangle, RefreshCw, Calendar, MapPin, ArrowLeftRight, X as XIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFirestoreUtils, getFirebaseDatabase } from '../firebase';
import './ScorerPortal.css';

const ScorerPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Authentication
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Match data
  const [matchId, setMatchId] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({ teamA: [], teamB: [] });
  const [loadError, setLoadError] = useState(null);
  
  // Game state
  const [stage, setStage] = useState('select'); // 'select', 'playing'
  const [score, setScore] = useState({ teamA: 0, teamB: 0 });
  const [quarter, setQuarter] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const [quarterDuration, setQuarterDuration] = useState(600); // Default 10 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [quarterScores, setQuarterScores] = useState({
    q1: { teamA: 0, teamB: 0 },
    q2: { teamA: 0, teamB: 0 },
    q3: { teamA: 0, teamB: 0 },
    q4: { teamA: 0, teamB: 0 }
  });
  
  // Timer editor
  const [showTimerEditor, setShowTimerEditor] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState(10);
  
  // End match modal
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  
  // Team fouls tracking (resets each quarter, max 5 per quarter per team)
  const [teamFouls, setTeamFouls] = useState({
    teamA: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 },
    teamB: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 }
  });
  
  // Player stats and management
  const [playerStats, setPlayerStats] = useState({});
  const [disqualifiedPlayers, setDisqualifiedPlayers] = useState([]);
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [substitutionTeam, setSubstitutionTeam] = useState(null);
  const [playerToSubOut, setPlayerToSubOut] = useState(null);
  const [substitutionStep, setSubstitutionStep] = useState(1); // 1: select player out, 2: select player in
  const [selectedPlayerForScoring, setSelectedPlayerForScoring] = useState(null);
  const [lastScoreNotification, setLastScoreNotification] = useState('');
  
  // Timeouts
  const [timeouts, setTimeouts] = useState({
    teamA: { q1: 2, q2: 2, q3: 2, q4: 4 },
    teamB: { q1: 2, q2: 2, q3: 2, q4: 4 }
  });
  const [timeoutActive, setTimeoutActive] = useState(false);
  const [timeoutTimer, setTimeoutTimer] = useState(60);
  
  const [notification, setNotification] = useState('');
  
  // Match selection
  const [availableMatches, setAvailableMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  
  // Firebase
  const [firebase, setFirebase] = useState(null);
  const timerIntervalRef = useRef(null);
  
  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Side switch - swap Team A and Team B positions
  const [sidesSwapped, setSidesSwapped] = useState(false);
  
  // Score delay feature
  const [scoreDelay, setScoreDelay] = useState(3000); // 3 seconds default delay
  const [pendingScoreUpdate, setPendingScoreUpdate] = useState(null);
  const [delayTimer, setDelayTimer] = useState(null);
  const delayTimerRef = useRef(null);
  const delayIntervalRef = useRef(null);
  
  const SCORER_PASSWORD = process.env.REACT_APP_SCORER_PASSWORD || 'scorer2025';

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const fb = await getFirebaseDatabase();
        setFirebase(fb);
      } catch (error) {
        console.error('Firebase init error:', error);
      }
    };
    initFirebase();
  }, []);

  // Save match state to localStorage for recovery
  useEffect(() => {
    if (matchId && stage === 'playing' && matchInfo) {
      const matchState = {
        matchId,
        matchInfo,
        selectedPlayers,
        score,
        quarter,
        timerSeconds,
        quarterScores,
        playerStats,
        disqualifiedPlayers,
        teamFouls,
        timeouts,
        timestamp: Date.now()
      };
      localStorage.setItem(`match_state_${matchId}`, JSON.stringify(matchState));
    }
  }, [matchId, stage, matchInfo, selectedPlayers, score, quarter, timerSeconds, quarterScores, playerStats, disqualifiedPlayers, teamFouls, timeouts]);

  // Load saved match state on mount
  useEffect(() => {
    if (matchId && authenticated && matchInfo && stage === 'select') {
      const savedState = localStorage.getItem(`match_state_${matchId}`);
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          // Check if state is recent (within last 24 hours)
          const isRecent = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent && window.confirm('Found a saved match in progress. Do you want to resume?')) {
            setSelectedPlayers(state.selectedPlayers);
            setScore(state.score);
            setQuarter(state.quarter);
            setTimerSeconds(state.timerSeconds);
            setQuarterScores(state.quarterScores);
            setPlayerStats(state.playerStats);
            setDisqualifiedPlayers(state.disqualifiedPlayers || []);
            setTeamFouls(state.teamFouls || { teamA: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 }, teamB: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 } });
            setTimeouts(state.timeouts);
            setStage('playing');
            showNotification('Match resumed from saved state!');
          } else if (!isRecent) {
            localStorage.removeItem(`match_state_${matchId}`);
          }
        } catch (error) {
          console.error('Error loading saved match state:', error);
          localStorage.removeItem(`match_state_${matchId}`);
        }
      }
    }
  }, [matchId, authenticated, matchInfo]);

  // Load match from URL
  useEffect(() => {
    const loadMatch = async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('matchId');
      
      if (id && authenticated) {
        setMatchId(id);
        setLoadError(null);
        try {
          const { firestore, collection, query, where, getDocs } = await getFirestoreUtils();
          
          // Load match info
          const matchesRef = collection(firestore, 'scheduledMatches');
          const q = query(matchesRef, where('matchId', '==', id));
          const matchSnapshot = await getDocs(q);
          
          if (!matchSnapshot.empty) {
            const matchData = matchSnapshot.docs[0].data();
            setMatchInfo(matchData);
            
            // Load players
            const playersRef = collection(firestore, 'players');
            const playersQuery = query(playersRef, where('matchId', '==', id));
            const playersSnapshot = await getDocs(playersQuery);
            
            const players = [];
            playersSnapshot.forEach(doc => {
              const playerData = doc.data();
              players.push({
                id: doc.id,
                ...playerData
              });
              
              // Initialize player stats
              setPlayerStats(prev => ({
                ...prev,
                [doc.id]: { points: 0, fouls: 0 }
              }));
            });
            
            setAllPlayers(players);
            console.log('Match loaded successfully:', matchData.teamA, 'vs', matchData.teamB);
          } else {
            setLoadError('Match not found in database');
          }
        } catch (error) {
          console.error('Error loading match:', error);
          setLoadError('Failed to load match: ' + error.message);
        }
      }
    };
    
    loadMatch();
  }, [location.search, authenticated]);

  // Load available matches when authenticated but no matchId
  useEffect(() => {
    const loadAvailableMatches = async () => {
      if (authenticated && !matchId) {
        setLoadingMatches(true);
        try {
          const { firestore, collection, getDocs, query, orderBy } = await getFirestoreUtils();
          const matchesRef = collection(firestore, 'scheduledMatches');
          const q = query(matchesRef, orderBy('date', 'asc'));
          const snapshot = await getDocs(q);
          
          const matches = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setAvailableMatches(matches);
        } catch (error) {
          console.error('Error loading matches:', error);
        }
        setLoadingMatches(false);
      }
    };
    
    loadAvailableMatches();
  }, [authenticated, matchId]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timerSeconds > 0 && !timeoutActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            showNotification('Quarter ended!');
            return 0;
          }
          return prev - 1;
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
  }, [isRunning, timerSeconds, timeoutActive]);

  // Timeout timer effect
  useEffect(() => {
    if (timeoutActive && timeoutTimer > 0) {
      const timeoutInterval = setInterval(() => {
        setTimeoutTimer(prev => {
          if (prev <= 1) {
            setTimeoutActive(false);
            setIsRunning(true);
            showNotification('Timeout ended!');
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timeoutInterval);
    }
  }, [timeoutActive, timeoutTimer]);

  // Sync to Firebase Realtime Database (non-score updates sync immediately)
  useEffect(() => {
    if (firebase && matchInfo && stage === 'playing') {
      const syncToFirebase = async () => {
        const updates = {};
        const path = 'matches/current';
        
        // Use swapped teams if sides are swapped
        const displayTeamA = sidesSwapped ? matchInfo.teamB : matchInfo.teamA;
        const displayTeamB = sidesSwapped ? matchInfo.teamA : matchInfo.teamB;
        
        updates[`${path}/teamA`] = displayTeamA;
        updates[`${path}/teamB`] = displayTeamB;
        // Scores are handled separately with delay
        updates[`${path}/quarter`] = quarter;
        updates[`${path}/timerSeconds`] = timerSeconds;
        updates[`${path}/isRunning`] = isRunning;
        updates[`${path}/quarterScores`] = quarterScores;
        updates[`${path}/matchStage`] = 'match';
        updates[`${path}/lastUpdated`] = Date.now();
        
        // Add players
        const playersObj = {};
        [...selectedPlayers.teamA, ...selectedPlayers.teamB].forEach(playerId => {
          const player = allPlayers.find(p => p.id === playerId);
          if (player) {
            playersObj[playerId] = {
              name: player.playerName,
              jersey: player.jerseyNumber,
              team: player.team,
              points: playerStats[playerId]?.points || 0,
              fouls: playerStats[playerId]?.fouls || 0
            };
          }
        });
        updates[`${path}/players`] = playersObj;
        
        try {
          await firebase.update(firebase.ref(firebase.database), updates);
        } catch (error) {
          console.error('Firebase sync error:', error);
        }
      };
      
      syncToFirebase();
    }
  }, [quarter, timerSeconds, isRunning, playerStats, firebase, matchInfo, stage, sidesSwapped]);

  // Score sync with delay
  useEffect(() => {
    if (firebase && matchInfo && stage === 'playing') {
      // Clear any existing timer and interval
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      
      // Clear existing interval
      if (delayIntervalRef.current) {
        clearInterval(delayIntervalRef.current);
      }
      
      // Set pending update
      const pendingUpdate = {
        scoreA: sidesSwapped ? score.teamB : score.teamA,
        scoreB: sidesSwapped ? score.teamA : score.teamB,
        timestamp: Date.now()
      };
      setPendingScoreUpdate(pendingUpdate);
      
      // Start countdown
      let timeRemaining = scoreDelay / 1000; // Convert to seconds
      setDelayTimer(Math.ceil(timeRemaining));
      
      delayIntervalRef.current = setInterval(() => {
        timeRemaining -= 0.1;
        if (timeRemaining > 0) {
          setDelayTimer(Math.ceil(timeRemaining));
        } else {
          if (delayIntervalRef.current) {
            clearInterval(delayIntervalRef.current);
            delayIntervalRef.current = null;
          }
        }
      }, 100);
      
      // Set timeout to sync after delay
      delayTimerRef.current = setTimeout(async () => {
        const updates = {};
        const path = 'matches/current';
        updates[`${path}/scoreA`] = pendingUpdate.scoreA;
        updates[`${path}/scoreB`] = pendingUpdate.scoreB;
        updates[`${path}/lastUpdated`] = Date.now();
        
        try {
          await firebase.update(firebase.ref(firebase.database), updates);
          setPendingScoreUpdate(null);
          setDelayTimer(null);
        } catch (error) {
          console.error('Firebase score sync error:', error);
        }
        if (delayIntervalRef.current) {
          clearInterval(delayIntervalRef.current);
          delayIntervalRef.current = null;
        }
      }, scoreDelay);
      
      return () => {
        if (delayTimerRef.current) {
          clearTimeout(delayTimerRef.current);
          delayTimerRef.current = null;
        }
        if (delayIntervalRef.current) {
          clearInterval(delayIntervalRef.current);
          delayIntervalRef.current = null;
        }
      };
    }
  }, [score, firebase, matchInfo, stage, scoreDelay, sidesSwapped]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
      if (delayIntervalRef.current) {
        clearInterval(delayIntervalRef.current);
      }
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SCORER_PASSWORD) {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
    setPassword('');
  };

  const handleLogout = () => {
    // Show confirmation if match is in progress
    if (stage === 'playing' && matchId) {
      setShowLogoutConfirm(true);
    } else {
      confirmLogout();
    }
  };

  const confirmLogout = () => {
    // Match state is auto-saved, so we can safely logout
    setAuthenticated(false);
    setShowLogoutConfirm(false);
    navigate('/schedule');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSwitchSides = () => {
    const newSwapped = !sidesSwapped;
    setSidesSwapped(newSwapped);
    const newLeftTeam = newSwapped ? matchInfo.teamB : matchInfo.teamA;
    showNotification(`Teams switched! ${newLeftTeam} is now on the left.`);
  };

  const cancelPendingScoreUpdate = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (delayIntervalRef.current) {
      clearInterval(delayIntervalRef.current);
      delayIntervalRef.current = null;
    }
    setPendingScoreUpdate(null);
    setDelayTimer(null);
    showNotification('Pending score update cancelled');
  };

  const togglePlayerSelection = (team, playerId) => {
    setSelectedPlayers(prev => {
      const teamKey = team === 'A' ? 'teamA' : 'teamB';
      const currentSelection = prev[teamKey];
      
      if (currentSelection.includes(playerId)) {
        return {
          ...prev,
          [teamKey]: currentSelection.filter(id => id !== playerId)
        };
      } else if (currentSelection.length < 5) {
        return {
          ...prev,
          [teamKey]: [...currentSelection, playerId]
        };
      } else {
        showNotification('Maximum 5 players per team');
        return prev;
      }
    });
  };

  const startMatch = () => {
    if (selectedPlayers.teamA.length !== 5 || selectedPlayers.teamB.length !== 5) {
      showNotification('Please select exactly 5 players per team');
      return;
    }
    setStage('playing');
    setIsRunning(true);
    showNotification('Match started!');
  };

  const addPoints = (points) => {
    if (!selectedPlayerForScoring) {
      showNotification('Please select a player first!');
      return;
    }
    
    const playerId = selectedPlayerForScoring;
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        points: (prev[playerId]?.points || 0) + points
      }
    }));
    
    const player = allPlayers.find(p => p.id === playerId);
    if (player) {
      setLastScoreNotification(`+${points} points for ${player.playerName}`);
      setTimeout(() => setLastScoreNotification(''), 2000);
      
      if (player.team === 'A') {
        setScore(prev => ({ ...prev, teamA: prev.teamA + points }));
        setQuarterScores(prev => ({
          ...prev,
          [`q${quarter}`]: {
            ...prev[`q${quarter}`],
            teamA: prev[`q${quarter}`].teamA + points
          }
        }));
      } else {
        setScore(prev => ({ ...prev, teamB: prev.teamB + points }));
        setQuarterScores(prev => ({
          ...prev,
          [`q${quarter}`]: {
            ...prev[`q${quarter}`],
            teamB: prev[`q${quarter}`].teamB + points
          }
        }));
      }
    }
  };

  const undoLastScore = () => {
    if (!selectedPlayerForScoring) return;
    
    const playerId = selectedPlayerForScoring;
    const currentPoints = playerStats[playerId]?.points || 0;
    
    if (currentPoints > 0) {
      const player = allPlayers.find(p => p.id === playerId);
      // Assuming last score was the most recent, we'll deduct based on current points
      const deduction = currentPoints >= 3 ? 3 : currentPoints >= 2 ? 2 : 1;
      
      setPlayerStats(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          points: Math.max(0, currentPoints - deduction)
        }
      }));
      
      if (player) {
        if (player.team === 'A') {
          setScore(prev => ({ ...prev, teamA: Math.max(0, prev.teamA - deduction) }));
        } else {
          setScore(prev => ({ ...prev, teamB: Math.max(0, prev.teamB - deduction) }));
        }
      }
      
      showNotification(`Undo: -${deduction} points`);
    }
  };

  const undoLastFoul = () => {
    if (!selectedPlayerForScoring) return;
    
    const playerId = selectedPlayerForScoring;
    const currentFouls = playerStats[playerId]?.fouls || 0;
    
    if (currentFouls > 0) {
      setPlayerStats(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          fouls: currentFouls - 1
        }
      }));
      
      showNotification('Undo: Foul removed');
    }
  };

  const addFoul = () => {
    if (!selectedPlayerForScoring) {
      showNotification('Please select a player first!');
      return;
    }
    
    const playerId = selectedPlayerForScoring;
    const currentFouls = (playerStats[playerId]?.fouls || 0) + 1;
    
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        fouls: currentFouls
      }
    }));
    
    const player = allPlayers.find(p => p.id === playerId);
    
    // Update team fouls automatically
    if (player) {
      const teamKey = player.team === 'A' ? 'teamA' : 'teamB';
      const quarterKey = quarter <= 5 ? `q${quarter}` : 'q5';
      
      setTeamFouls(prev => ({
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          [quarterKey]: (prev[teamKey][quarterKey] || 0) + 1
        }
      }));
      
      // Check if player is disqualified (5 fouls)
      if (currentFouls >= 5) {
        // Disqualify player
        setDisqualifiedPlayers(prev => [...prev, playerId]);
        
        // Remove from selected players
        setSelectedPlayers(prev => ({
          ...prev,
          [teamKey]: prev[teamKey].filter(id => id !== playerId)
        }));
        
        showNotification(`Player ${player.playerName} DISQUALIFIED! 5 fouls. Select substitute.`);
        
        // Auto-open substitution modal - skip step 1, go directly to step 2
        setPlayerToSubOut(playerId);
        setSubstitutionTeam(player.team);
        setSubstitutionStep(2); // Skip "select player out" step
        setShowSubstitution(true);
        setIsRunning(false); // Pause game for substitution
        setSelectedPlayerForScoring(null);
      } else {
        const teamFoulsCount = (teamFouls[teamKey][quarterKey] || 0) + 1;
        showNotification(`Foul: ${player.playerName} (${currentFouls}/5) | Team ${player.team} fouls: ${teamFoulsCount}/5`);
      }
    }
  };

  const openSubstitutionModal = (team) => {
    setSubstitutionTeam(team);
    setSubstitutionStep(1);
    setPlayerToSubOut(null);
    setShowSubstitution(true);
    setIsRunning(false);
  };

  const handleSubstitution = (playerOutId, playerInId) => {
    const playerOut = allPlayers.find(p => p.id === playerOutId);
    const playerIn = allPlayers.find(p => p.id === playerInId);
    
    if (!playerOut || !playerIn) return;
    
    const teamKey = playerOut.team === 'A' ? 'teamA' : 'teamB';
    
    // Remove player going out and add player coming in
    setSelectedPlayers(prev => ({
      ...prev,
      [teamKey]: prev[teamKey].filter(id => id !== playerOutId).concat(playerInId)
    }));
    
    // Initialize stats for new player if needed
    if (!playerStats[playerInId]) {
      setPlayerStats(prev => ({
        ...prev,
        [playerInId]: { points: 0, fouls: 0 }
      }));
    }
    
    showNotification(`${playerOut.playerName} OUT → ${playerIn.playerName} IN`);
    setShowSubstitution(false);
    setPlayerToSubOut(null);
    setSubstitutionTeam(null);
    setIsRunning(true); // Resume game
  };

  const requestTimeout = (team) => {
    const teamKey = team === 'A' ? 'teamA' : 'teamB';
    const quarterKey = `q${quarter}`;
    
    if (timeouts[teamKey][quarterKey] <= 0) {
      showNotification(`No timeouts remaining for ${matchInfo[teamKey]} in Q${quarter}!`);
      return;
    }
    
    // Deduct timeout
    setTimeouts(prev => ({
      ...prev,
      [teamKey]: {
        ...prev[teamKey],
        [quarterKey]: prev[teamKey][quarterKey] - 1
      }
    }));
    
    // Start timeout
    setTimeoutActive(true);
    setTimeoutTimer(60);
    setIsRunning(false);
    showNotification(`Timeout for ${matchInfo[teamKey]}! 1 minute.`);
  };

  const updateQuarterDuration = () => {
    const newDuration = editedMinutes * 60;
    setQuarterDuration(newDuration);
    setTimerSeconds(newDuration);
    setShowTimerEditor(false);
    showNotification(`Quarter duration updated to ${editedMinutes} minutes`);
  };

  const endQuarterEarly = () => {
    if (!window.confirm(`End Quarter ${quarter} early?`)) return;
    
    // Save current quarter scores
    const quarterKey = `q${quarter}`;
    setQuarterScores(prev => ({
      ...prev,
      [quarterKey]: { teamA: score.teamA, teamB: score.teamB }
    }));
    
    nextQuarter();
  };

  const nextQuarter = () => {
    if (quarter < 4) {
      const newQuarter = quarter + 1;
      setQuarter(newQuarter);
      setTimerSeconds(quarterDuration);
      setIsRunning(false);
      showNotification(`Quarter ${newQuarter} ready - Team fouls reset!`);
      // Team fouls are already tracked per quarter, no need to reset
    } else if (quarter === 4) {
      // Check for tie
      if (score.teamA === score.teamB) {
        // Start overtime
        setQuarter(5); // OT
        setTimerSeconds(180); // 3 minutes
        setIsRunning(false);
        showNotification('Game tied! Starting Overtime (3 minutes)');
      } else {
        // Game finished
        setIsRunning(false);
        showNotification('Match finished!');
      }
    } else if (quarter === 5) {
      // End of overtime
      setIsRunning(false);
      showNotification('Overtime finished!');
    }
  };
  
  const openEndMatchModal = () => {
    setIsRunning(false);
    // Auto-select winner based on score
    if (score.teamA > score.teamB) {
      setSelectedWinner('teamA');
    } else if (score.teamB > score.teamA) {
      setSelectedWinner('teamB');
    } else {
      setSelectedWinner('tie');
    }
    setShowEndMatchModal(true);
  };
  
  const discardMatch = () => {
    if (!window.confirm('Are you sure you want to discard this match? All progress will be lost!')) {
      return;
    }
    
    // Clear from Realtime Database
    getFirebaseDatabase().then(({ database, ref, set }) => {
      set(ref(database, 'matches/current'), null);
    });
    
    // Clear localStorage
    localStorage.removeItem(`match_state_${matchInfo.matchId}`);
    
    alert('Match discarded');
    navigate('/schedule');
  };

  const finishMatch = async () => {
    setShowEndMatchModal(false);
    
    try {
      const { firestore, collection, query, where, getDocs, updateDoc, doc } = await getFirestoreUtils();
      
      // Determine winner
      let winnerTeam;
      if (selectedWinner === 'teamA') {
        winnerTeam = matchInfo.teamA;
      } else if (selectedWinner === 'teamB') {
        winnerTeam = matchInfo.teamB;
      } else {
        winnerTeam = 'Tie';
      }
      
      // Find the match document
      const matchesRef = collection(firestore, 'scheduledMatches');
      const q = query(matchesRef, where('matchId', '==', matchInfo.matchId));
      const matchSnapshot = await getDocs(q);
      
      if (!matchSnapshot.empty) {
        const matchDoc = matchSnapshot.docs[0];
        
        // Update match with final scores and status in Firestore
        await updateDoc(doc(firestore, 'scheduledMatches', matchDoc.id), {
          status: 'completed',
          finalScore: {
            teamA: score.teamA,
            teamB: score.teamB
          },
          quarterScores: quarterScores,
          completedAt: new Date(),
          winner: winnerTeam,
          playerStats: playerStats
        });
        
        // Also save to Realtime Database for the live scoreboard
        try {
          const { database, ref, set } = await getFirebaseDatabase();
          
          // Prepare completed match data
          const completedMatchData = {
            matchId: matchInfo.matchId,
            teamA: matchInfo.teamA,
            teamB: matchInfo.teamB,
            scoreA: score.teamA,
            scoreB: score.teamB,
            finalScoreA: score.teamA,
            finalScoreB: score.teamB,
            quarterScores: quarterScores,
            completedAt: Date.now(),
            date: matchInfo.date,
            venue: matchInfo.venue,
            winner: winnerTeam,
            matchStage: 'finished'
          };
          
          // Add players data
          const playersObj = {};
          [...selectedPlayers.teamA, ...selectedPlayers.teamB].forEach(playerId => {
            const player = allPlayers.find(p => p.id === playerId);
            if (player) {
              playersObj[playerId] = {
                name: player.playerName,
                jersey: player.jerseyNumber,
                team: player.team,
                points: playerStats[playerId]?.points || 0,
                fouls: playerStats[playerId]?.fouls || 0
              };
            }
          });
          completedMatchData.players = playersObj;
          
          // Save to completed matches
          const completedKey = `match_${matchInfo.matchId}_${Date.now()}`;
          await set(ref(database, `matches/completed/${completedKey}`), completedMatchData);
          
          // Clear current match
          await set(ref(database, 'matches/current'), null);
          
          console.log('Match saved to Realtime Database completed matches');
        } catch (realtimeError) {
          console.error('Error saving to Realtime Database:', realtimeError);
          // Continue anyway - Firestore save succeeded
        }
        
        // Clear saved match state from localStorage
        localStorage.removeItem(`match_state_${matchInfo.matchId}`);
        
        alert(`Match completed! Winner: ${winnerTeam}\n\n${matchInfo.teamA}: ${score.teamA}\n${matchInfo.teamB}: ${score.teamB}`);
        navigate('/schedule');
      }
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Login Screen
  if (!authenticated) {
    return (
      <div className="scorer-login-container">
        <motion.div 
          className="login-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="login-header">
            <Trophy size={48} />
            <h1>Scorer Portal</h1>
            <p>Enter password to access</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              autoFocus
            />
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="login-btn">Access Portal</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // No match selected - show match selection
  if (!matchId) {
    return (
      <div className="scorer-portal-container">
        {notification && (
          <motion.div className="notification" initial={{ y: -50 }} animate={{ y: 0 }}>
            {notification}
          </motion.div>
        )}
        
        <div className="portal-header">
          <h1><Trophy size={32} /> Select Match</h1>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>

        {loadingMatches ? (
          <div className="loading-matches">
            <p>Loading matches...</p>
          </div>
        ) : availableMatches.length === 0 ? (
          <div className="no-match-selected">
            <AlertTriangle size={64} />
            <h2>No Matches Available</h2>
            <p>No scheduled matches found</p>
          </div>
        ) : (
          <div className="matches-selection-grid">
            {availableMatches.map(match => (
              <motion.div
                key={match.id}
                className="match-selection-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/scorer-portal?matchId=${match.matchId}`)}
              >
                <div className="match-teams-display">
                  <span className="team">{match.teamA}</span>
                  <span className="vs">VS</span>
                  <span className="team">{match.teamB}</span>
                </div>
                <div className="match-info-display">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>{match.date}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <span>{match.time}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{match.venue}</span>
                  </div>
                </div>
                <button className="select-match-btn">
                  Select Match →
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Match selected but not loaded yet
  if (!matchInfo) {
    if (loadError) {
      return (
        <div className="scorer-portal-container">
          <div className="no-match-selected">
            <AlertTriangle size={64} />
            <h2>Error Loading Match</h2>
            <p>{loadError}</p>
            <button onClick={() => navigate('/scorer-portal')} className="back-btn">
              ← Back to Match Selection
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="scorer-portal-container">
        <div className="loading-matches">
          <RefreshCw size={48} className="spinning" />
          <p>Loading match data...</p>
        </div>
      </div>
    );
  }

  // Player Selection Stage
  if (stage === 'select') {
    const teamAPlayers = allPlayers.filter(p => p.team === 'A');
    const teamBPlayers = allPlayers.filter(p => p.team === 'B');
    
    return (
      <div className="scorer-portal-container">
        {notification && (
          <motion.div className="notification" initial={{ y: -50 }} animate={{ y: 0 }}>
            {notification}
          </motion.div>
        )}
        
        <div className="portal-header">
          <h1><Trophy size={32} /> Select Playing 5</h1>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="match-title">
          {matchInfo.teamA} vs {matchInfo.teamB}
        </div>

        <div className="selection-grid">
          <div className="team-selection">
            <h2>{matchInfo.teamA}</h2>
            <div className="selected-count">
              {selectedPlayers.teamA.length} / 5 selected
            </div>
            <div className="players-list">
              {teamAPlayers.map(player => (
                <div
                  key={player.id}
                  className={`player-card ${selectedPlayers.teamA.includes(player.id) ? 'selected' : ''}`}
                  onClick={() => togglePlayerSelection('A', player.id)}
                >
                  <span className="jersey">#{player.jerseyNumber}</span>
                  <span className="name">{player.playerName}</span>
                  {selectedPlayers.teamA.includes(player.id) && <span className="checkmark">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="team-selection">
            <h2>{matchInfo.teamB}</h2>
            <div className="selected-count">
              {selectedPlayers.teamB.length} / 5 selected
            </div>
            <div className="players-list">
              {teamBPlayers.map(player => (
                <div
                  key={player.id}
                  className={`player-card ${selectedPlayers.teamB.includes(player.id) ? 'selected' : ''}`}
                  onClick={() => togglePlayerSelection('B', player.id)}
                >
                  <span className="jersey">#{player.jerseyNumber}</span>
                  <span className="name">{player.playerName}</span>
                  {selectedPlayers.teamB.includes(player.id) && <span className="checkmark">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/schedule')} className="back-btn">
            ← Back to Schedule
          </button>
          <button 
            onClick={startMatch} 
            className="start-match-btn"
            disabled={selectedPlayers.teamA.length !== 5 || selectedPlayers.teamB.length !== 5}
          >
            <Play size={20} />
            Start Match
          </button>
        </div>
      </div>
    );
  }

  // Playing Stage
  const teamAPlaying = selectedPlayers.teamA.map(id => allPlayers.find(p => p.id === id));
  const teamBPlaying = selectedPlayers.teamB.map(id => allPlayers.find(p => p.id === id));

  return (
    <div className="scorer-portal-container playing-stage">
      {notification && (
        <motion.div className="notification" initial={{ y: -50 }} animate={{ y: 0 }}>
          {notification}
        </motion.div>
      )}
      
      <div className="portal-header">
        <h1><Trophy size={32} /> Live Match</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={handleSwitchSides} 
            className="switch-sides-btn"
            title="Switch Team A and Team B positions"
          >
            <ArrowLeftRight size={18} />
            Switch Sides
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Score Delay Indicator */}
      {pendingScoreUpdate && delayTimer !== null && (
        <motion.div 
          className="score-delay-indicator"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="delay-info">
            <Clock size={16} />
            <span>Score will sync in {delayTimer}s</span>
            <button 
              onClick={cancelPendingScoreUpdate}
              className="cancel-delay-btn"
              title="Cancel pending score update"
            >
              <XIcon size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className="team-score">
          <h2>{sidesSwapped ? matchInfo.teamB : matchInfo.teamA}</h2>
          <div className="score">{sidesSwapped ? score.teamB : score.teamA}</div>
          <div className="team-fouls-display">
            Team Fouls: {(sidesSwapped ? teamFouls.teamB : teamFouls.teamA)[`q${quarter <= 5 ? quarter : 5}`] || 0}/5
          </div>
          <div className="timeout-info">
            <button 
              className="timeout-btn"
              onClick={() => requestTimeout(sidesSwapped ? 'B' : 'A')}
              disabled={timeoutActive || (sidesSwapped ? timeouts.teamB : timeouts.teamA)[`q${quarter}`] === 0}
            >
              ⏱️ Timeout ({(sidesSwapped ? timeouts.teamB : timeouts.teamA)[`q${quarter}`]})
            </button>
          </div>
        </div>
        
        <div className="game-info">
          <div className="quarter-display">{quarter === 5 ? 'OT' : `Q${quarter}`}</div>
          {timeoutActive ? (
            <div className="timeout-display">
              <div className="timeout-label">TIMEOUT</div>
              <div className="timeout-timer">{formatTime(timeoutTimer)}</div>
              <button 
                className="end-timeout-btn"
                onClick={() => {
                  setTimeoutActive(false);
                  setTimeoutTimer(60);
                  setIsRunning(true);
                  showNotification('Timeout ended!');
                }}
              >
                End Timeout
              </button>
            </div>
          ) : (
            <div className="timer">{formatTime(timerSeconds)}</div>
          )}
          <div className="timer-controls">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className="timer-btn"
              disabled={timeoutActive}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => setTimerSeconds(quarterDuration)} className="timer-btn">
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={() => setShowTimerEditor(true)} 
              className="timer-btn timer-edit-btn"
              title="Edit Quarter Duration"
            >
              <Clock size={16} />
            </button>
          </div>
          <div className="match-controls">
            <button 
              onClick={endQuarterEarly} 
              className="end-quarter-btn"
              disabled={timeoutActive}
            >
              End Quarter
            </button>
            <button 
              onClick={openEndMatchModal} 
              className="end-match-btn"
            >
              End Match
            </button>
          </div>
        </div>
        
        <div className="team-score">
          <h2>{sidesSwapped ? matchInfo.teamA : matchInfo.teamB}</h2>
          <div className="score">{sidesSwapped ? score.teamA : score.teamB}</div>
          <div className="team-fouls-display">
            Team Fouls: {(sidesSwapped ? teamFouls.teamA : teamFouls.teamB)[`q${quarter <= 5 ? quarter : 5}`] || 0}/5
          </div>
          <div className="timeout-info">
            <button 
              className="timeout-btn"
              onClick={() => requestTimeout(sidesSwapped ? 'A' : 'B')}
              disabled={timeoutActive || (sidesSwapped ? timeouts.teamA : timeouts.teamB)[`q${quarter}`] === 0}
            >
              ⏱️ Timeout ({(sidesSwapped ? timeouts.teamA : timeouts.teamB)[`q${quarter}`]})
            </button>
          </div>
        </div>
      </div>

      {/* Score Notification */}
      {lastScoreNotification && (
        <motion.div 
          className="score-notification"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          {lastScoreNotification}
        </motion.div>
      )}

      {/* Side-by-Side Teams Layout */}
      <div className="teams-side-by-side">
        {/* Left Side Team (swapped based on sidesSwapped) */}
        <div className="team-column">
          <div className="team-header-wide">
            <h3>{sidesSwapped ? matchInfo.teamB : matchInfo.teamA}</h3>
            <button 
              className="substitute-btn-small"
              onClick={() => openSubstitutionModal(sidesSwapped ? 'B' : 'A')}
            >
              <Users size={14} /> Sub
            </button>
          </div>

          {/* Left Team Players - Playing 5 Only */}
          <div className="players-row">
            {(sidesSwapped ? teamBPlaying : teamAPlaying).map((player, index) => (
              <div 
                key={player.id} 
                className={`player-box ${selectedPlayerForScoring === player.id ? 'selected-for-scoring' : ''}`}
                onClick={() => setSelectedPlayerForScoring(player.id)}
              >
                <div className="player-label">P{index + 1}</div>
                <div className="player-name-short">{player.playerName}</div>
                <div className="player-jersey-small">#{player.jerseyNumber}</div>
                <div className="player-stats-small">
                  {playerStats[player.id]?.points || 0}pts | {playerStats[player.id]?.fouls || 0}F
                </div>
              </div>
            ))}
          </div>

          {/* Left Team Scoring Controls */}
          <div className="team-scoring-controls">
            <div className="score-buttons-compact">
              <button 
                onClick={() => {
                  const leftTeamPlaying = sidesSwapped ? teamBPlaying : teamAPlaying;
                  if (!selectedPlayerForScoring || !leftTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamB : matchInfo.teamA} player!`);
                    return;
                  }
                  addPoints(1);
                }} 
                className="score-btn-compact score-1"
              >
                +1
              </button>
              <button 
                onClick={() => {
                  const leftTeamPlaying = sidesSwapped ? teamBPlaying : teamAPlaying;
                  if (!selectedPlayerForScoring || !leftTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamB : matchInfo.teamA} player!`);
                    return;
                  }
                  addPoints(2);
                }} 
                className="score-btn-compact score-2"
              >
                +2
              </button>
              <button 
                onClick={() => {
                  const leftTeamPlaying = sidesSwapped ? teamBPlaying : teamAPlaying;
                  if (!selectedPlayerForScoring || !leftTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamB : matchInfo.teamA} player!`);
                    return;
                  }
                  addPoints(3);
                }} 
                className="score-btn-compact score-3"
              >
                +3
              </button>
              <button 
                onClick={() => {
                  const leftTeamPlaying = sidesSwapped ? teamBPlaying : teamAPlaying;
                  if (!selectedPlayerForScoring || !leftTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamB : matchInfo.teamA} player!`);
                    return;
                  }
                  addFoul();
                }} 
                className="score-btn-compact foul-btn-compact"
              >
                Foul
              </button>
            </div>
            <div className="undo-buttons-compact">
              <button onClick={undoLastScore} className="undo-btn-compact">Undo Score</button>
              <button onClick={undoLastFoul} className="undo-btn-compact">Undo Foul</button>
            </div>
          </div>
        </div>

        {/* Right Side Team (swapped based on sidesSwapped) */}
        <div className="team-column">
          <div className="team-header-wide">
            <h3>{sidesSwapped ? matchInfo.teamA : matchInfo.teamB}</h3>
            <button 
              className="substitute-btn-small"
              onClick={() => openSubstitutionModal(sidesSwapped ? 'A' : 'B')}
            >
              <Users size={14} /> Sub
            </button>
          </div>

          {/* Right Team Players - Playing 5 Only */}
          <div className="players-row">
            {(sidesSwapped ? teamAPlaying : teamBPlaying).map((player, index) => (
              <div 
                key={player.id} 
                className={`player-box ${selectedPlayerForScoring === player.id ? 'selected-for-scoring' : ''}`}
                onClick={() => setSelectedPlayerForScoring(player.id)}
              >
                <div className="player-label">P{index + 1}</div>
                <div className="player-name-short">{player.playerName}</div>
                <div className="player-jersey-small">#{player.jerseyNumber}</div>
                <div className="player-stats-small">
                  {playerStats[player.id]?.points || 0}pts | {playerStats[player.id]?.fouls || 0}F
                </div>
              </div>
            ))}
          </div>

          {/* Right Team Scoring Controls */}
          <div className="team-scoring-controls">
            <div className="score-buttons-compact">
              <button 
                onClick={() => {
                  const rightTeamPlaying = sidesSwapped ? teamAPlaying : teamBPlaying;
                  if (!selectedPlayerForScoring || !rightTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamA : matchInfo.teamB} player!`);
                    return;
                  }
                  addPoints(1);
                }} 
                className="score-btn-compact score-1"
              >
                +1
              </button>
              <button 
                onClick={() => {
                  const rightTeamPlaying = sidesSwapped ? teamAPlaying : teamBPlaying;
                  if (!selectedPlayerForScoring || !rightTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamA : matchInfo.teamB} player!`);
                    return;
                  }
                  addPoints(2);
                }} 
                className="score-btn-compact score-2"
              >
                +2
              </button>
              <button 
                onClick={() => {
                  const rightTeamPlaying = sidesSwapped ? teamAPlaying : teamBPlaying;
                  if (!selectedPlayerForScoring || !rightTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamA : matchInfo.teamB} player!`);
                    return;
                  }
                  addPoints(3);
                }} 
                className="score-btn-compact score-3"
              >
                +3
              </button>
              <button 
                onClick={() => {
                  const rightTeamPlaying = sidesSwapped ? teamAPlaying : teamBPlaying;
                  if (!selectedPlayerForScoring || !rightTeamPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification(`Please select a ${sidesSwapped ? matchInfo.teamA : matchInfo.teamB} player!`);
                    return;
                  }
                  addFoul();
                }} 
                className="score-btn-compact foul-btn-compact"
              >
                Foul
              </button>
            </div>
            <div className="undo-buttons-compact">
              <button onClick={undoLastScore} className="undo-btn-compact">Undo Score</button>
              <button onClick={undoLastFoul} className="undo-btn-compact">Undo Foul</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quarter Control */}
      <div className="quarter-control">
        {quarter < 4 && (
          <button onClick={nextQuarter} className="next-quarter-btn">
            Next Quarter →
          </button>
        )}
        {quarter === 4 && timerSeconds === 0 && (
          <button onClick={nextQuarter} className="next-quarter-btn">
            {score.teamA === score.teamB ? 'Start Overtime →' : 'Finish Match'}
          </button>
        )}
        {quarter === 5 && timerSeconds === 0 && (
          <button onClick={finishMatch} className="finish-btn">
            Finish Match & Save
          </button>
        )}
        {(quarter === 4 || quarter === 5) && timerSeconds === 0 && (
          <button onClick={finishMatch} className="finish-btn">
            Finish Match & Save
          </button>
        )}
      </div>

      {/* Substitution Modal */}
      <AnimatePresence>
        {showSubstitution && substitutionTeam && (
          <div className="modal-overlay" onClick={() => {}}>
            <motion.div
              className="substitution-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {substitutionStep === 1 ? (
                <>
                  <div className="modal-header-sub">
                    <h2>🔄 Substitution - Step 1</h2>
                    <p>Select player to take OUT from {matchInfo[substitutionTeam === 'A' ? 'teamA' : 'teamB']}</p>
                  </div>
                  <div className="bench-players-list">
                    {allPlayers
                      .filter(p => 
                        p.team === substitutionTeam && 
                        selectedPlayers[substitutionTeam === 'A' ? 'teamA' : 'teamB'].includes(p.id)
                      )
                      .map(player => (
                        <div
                          key={player.id}
                          className="bench-player-card"
                          onClick={() => {
                            setPlayerToSubOut(player.id);
                            setSubstitutionStep(2);
                          }}
                        >
                          <span className="jersey">#{player.jerseyNumber}</span>
                          <span className="name">{player.playerName}</span>
                          <span className="player-stats-mini">
                            {playerStats[player.id]?.points || 0}pts | {playerStats[player.id]?.fouls || 0}F
                          </span>
                          <span className="sub-arrow">← Take OUT</span>
                        </div>
                      ))}
                  </div>
                  <button 
                    className="cancel-sub-btn"
                    onClick={() => {
                      setShowSubstitution(false);
                      setSubstitutionTeam(null);
                      setIsRunning(true);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="modal-header-sub">
                    <h2>🔄 Substitution - Step 2</h2>
                    <p>Select player to bring IN from bench</p>
                    {playerToSubOut && (
                      <div className="player-out-display">
                        Taking OUT: {allPlayers.find(p => p.id === playerToSubOut)?.playerName}
                      </div>
                    )}
                  </div>
                  <div className="bench-players-list">
                    {allPlayers
                      .filter(p => 
                        p.team === substitutionTeam && 
                        !selectedPlayers[substitutionTeam === 'A' ? 'teamA' : 'teamB'].includes(p.id) &&
                        !disqualifiedPlayers.includes(p.id)
                      )
                      .map(player => (
                        <div
                          key={player.id}
                          className="bench-player-card"
                          onClick={() => handleSubstitution(playerToSubOut, player.id)}
                        >
                          <span className="jersey">#{player.jerseyNumber}</span>
                          <span className="name">{player.playerName}</span>
                          <span className="sub-arrow">→ Bring IN</span>
                        </div>
                      ))}
                  </div>
                  <button 
                    className="cancel-sub-btn"
                    onClick={() => {
                      setSubstitutionStep(1);
                      setPlayerToSubOut(null);
                    }}
                  >
                    ← Back
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={() => {}}>
            <motion.div
              className="substitution-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="modal-header-sub">
                <h2>⚠️ Confirm Logout</h2>
                <p>Match is in progress. Your progress is automatically saved and you can resume later.</p>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  When you log back in with the same match, you'll be able to continue from where you left off.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                <button 
                  className="cancel-sub-btn"
                  onClick={cancelLogout}
                  style={{ flex: 1, background: '#4CAF50' }}
                >
                  Stay & Continue
                </button>
                <button 
                  className="cancel-sub-btn"
                  onClick={confirmLogout}
                  style={{ flex: 1, background: '#f44336' }}
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Timer Editor Modal */}
      <AnimatePresence>
        {showTimerEditor && (
          <div className="modal-overlay" onClick={() => setShowTimerEditor(false)}>
            <motion.div
              className="substitution-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '400px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-sub">
                <h2>⏱️ Edit Quarter Duration</h2>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  Set the duration for each quarter (in minutes)
                </p>
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#999' }}>
                  Minutes per Quarter:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editedMinutes}
                  onChange={(e) => setEditedMinutes(parseInt(e.target.value) || 10)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '18px',
                    borderRadius: '8px',
                    border: '2px solid #FF6B35',
                    background: '#1a1a1a',
                    color: 'white',
                    textAlign: 'center'
                  }}
                />
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Current: {Math.floor(quarterDuration / 60)} minutes
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="cancel-sub-btn"
                  onClick={() => setShowTimerEditor(false)}
                  style={{ flex: 1, background: '#666' }}
                >
                  Cancel
                </button>
                <button 
                  className="cancel-sub-btn"
                  onClick={updateQuarterDuration}
                  style={{ flex: 1, background: '#FF6B35' }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* End Match Modal */}
      <AnimatePresence>
        {showEndMatchModal && (
          <div className="modal-overlay" onClick={() => {}}>
            <motion.div
              className="substitution-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '600px' }}
            >
              <div className="modal-header-sub">
                <h2>🏆 End Match</h2>
                <p style={{ marginTop: '10px', fontSize: '16px', fontWeight: '600' }}>
                  {matchInfo.teamA} {score.teamA} - {score.teamB} {matchInfo.teamB}
                </p>
              </div>
              
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#FF6B35' }}>Announce Winner:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    className={`winner-option ${selectedWinner === 'teamA' ? 'selected-winner' : ''}`}
                    onClick={() => setSelectedWinner('teamA')}
                    style={{
                      padding: '15px',
                      borderRadius: '10px',
                      border: selectedWinner === 'teamA' ? '3px solid #4CAF50' : '2px solid #333',
                      background: selectedWinner === 'teamA' ? 'rgba(76, 175, 80, 0.2)' : '#1a1a1a',
                      color: 'white',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{matchInfo.teamA}</span>
                    <span style={{ fontSize: '20px', fontWeight: '900' }}>{score.teamA}</span>
                  </button>
                  
                  <button
                    className={`winner-option ${selectedWinner === 'teamB' ? 'selected-winner' : ''}`}
                    onClick={() => setSelectedWinner('teamB')}
                    style={{
                      padding: '15px',
                      borderRadius: '10px',
                      border: selectedWinner === 'teamB' ? '3px solid #4CAF50' : '2px solid #333',
                      background: selectedWinner === 'teamB' ? 'rgba(76, 175, 80, 0.2)' : '#1a1a1a',
                      color: 'white',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{matchInfo.teamB}</span>
                    <span style={{ fontSize: '20px', fontWeight: '900' }}>{score.teamB}</span>
                  </button>
                  
                  <button
                    className={`winner-option ${selectedWinner === 'tie' ? 'selected-winner' : ''}`}
                    onClick={() => setSelectedWinner('tie')}
                    style={{
                      padding: '15px',
                      borderRadius: '10px',
                      border: selectedWinner === 'tie' ? '3px solid #FFC107' : '2px solid #333',
                      background: selectedWinner === 'tie' ? 'rgba(255, 193, 7, 0.2)' : '#1a1a1a',
                      color: 'white',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'center'
                    }}
                  >
                    🤝 Declare Tie
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button 
                  className="cancel-sub-btn"
                  onClick={() => {
                    setShowEndMatchModal(false);
                    setIsRunning(false);
                  }}
                  style={{ flex: 1, background: '#666' }}
                >
                  Cancel
                </button>
                <button 
                  className="cancel-sub-btn"
                  onClick={discardMatch}
                  style={{ flex: 1, background: '#f44336' }}
                >
                  🗑️ Discard
                </button>
                <button 
                  className="cancel-sub-btn"
                  onClick={finishMatch}
                  style={{ flex: 1, background: '#4CAF50', fontSize: '16px', fontWeight: '700' }}
                >
                  ✓ Save & Finish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScorerPortal;
