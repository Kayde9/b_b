import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Plus, Minus, Users, Trophy, 
  Clock, LogOut, Home, AlertTriangle, RefreshCw, Calendar, MapPin
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
  const [isRunning, setIsRunning] = useState(false);
  const [quarterScores, setQuarterScores] = useState({
    q1: { teamA: 0, teamB: 0 },
    q2: { teamA: 0, teamB: 0 },
    q3: { teamA: 0, teamB: 0 },
    q4: { teamA: 0, teamB: 0 }
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

  // Sync to Firebase Realtime Database
  useEffect(() => {
    if (firebase && matchInfo && stage === 'playing') {
      const syncToFirebase = async () => {
        const updates = {};
        const path = 'matches/current';
        
        updates[`${path}/teamA`] = matchInfo.teamA;
        updates[`${path}/teamB`] = matchInfo.teamB;
        updates[`${path}/scoreA`] = score.teamA;
        updates[`${path}/scoreB`] = score.teamB;
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
  }, [score, quarter, timerSeconds, isRunning, playerStats, firebase, matchInfo, stage]);

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
    setAuthenticated(false);
    navigate('/schedule');
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
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
    
    if (currentFouls >= 5) {
      // Disqualify player
      setDisqualifiedPlayers(prev => [...prev, playerId]);
      
      // Remove from selected players
      if (player) {
        const teamKey = player.team === 'A' ? 'teamA' : 'teamB';
        setSelectedPlayers(prev => ({
          ...prev,
          [teamKey]: prev[teamKey].filter(id => id !== playerId)
        }));
        
        showNotification(`Player ${player.playerName} DISQUALIFIED! 5 fouls. Please substitute.`);
        setPlayerToSubOut(playerId);
        setSubstitutionTeam(player.team);
        setShowSubstitution(true);
        setIsRunning(false); // Pause game for substitution
        setSelectedPlayerForScoring(null);
      }
    } else if (player) {
      showNotification(`Foul added to ${player.playerName} (${currentFouls}/5)`);
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

  const nextQuarter = () => {
    if (quarter < 4) {
      setQuarter(prev => prev + 1);
      setTimerSeconds(600);
      setIsRunning(false);
      showNotification(`Quarter ${quarter + 1} ready`);
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

  const finishMatch = async () => {
    if (!window.confirm('Are you sure you want to finish this match? This will save the final score.')) {
      return;
    }

    try {
      const { firestore, collection, query, where, getDocs, updateDoc, doc } = await getFirestoreUtils();
      
      // Find the match document
      const matchesRef = collection(firestore, 'scheduledMatches');
      const q = query(matchesRef, where('matchId', '==', matchInfo.matchId));
      const matchSnapshot = await getDocs(q);
      
      if (!matchSnapshot.empty) {
        const matchDoc = matchSnapshot.docs[0];
        
        // Update match with final scores and status
        await updateDoc(doc(firestore, 'scheduledMatches', matchDoc.id), {
          status: 'completed',
          finalScore: {
            teamA: score.teamA,
            teamB: score.teamB
          },
          quarterScores: quarterScores,
          completedAt: new Date(),
          winner: score.teamA > score.teamB ? matchInfo.teamA : score.teamB > score.teamA ? matchInfo.teamB : 'Tie',
          playerStats: playerStats
        });
        
        alert('Match completed and saved successfully!');
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
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className="team-score">
          <h2>{matchInfo.teamA}</h2>
          <div className="score">{score.teamA}</div>
          <div className="timeout-info">
            <button 
              className="timeout-btn"
              onClick={() => requestTimeout('A')}
              disabled={timeoutActive || timeouts.teamA[`q${quarter}`] === 0}
            >
              ⏱️ Timeout ({timeouts.teamA[`q${quarter}`]})
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
            <button onClick={() => setTimerSeconds(600)} className="timer-btn">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
        
        <div className="team-score">
          <h2>{matchInfo.teamB}</h2>
          <div className="score">{score.teamB}</div>
          <div className="timeout-info">
            <button 
              className="timeout-btn"
              onClick={() => requestTimeout('B')}
              disabled={timeoutActive || timeouts.teamB[`q${quarter}`] === 0}
            >
              ⏱️ Timeout ({timeouts.teamB[`q${quarter}`]})
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
        {/* Team A - Left Side */}
        <div className="team-column">
          <div className="team-header-wide">
            <h3>{matchInfo.teamA}</h3>
            <button 
              className="substitute-btn-small"
              onClick={() => openSubstitutionModal('A')}
            >
              <Users size={14} /> Sub
            </button>
          </div>

          {/* Team A Players - Playing 5 Only */}
          <div className="players-row">
            {teamAPlaying.map((player, index) => (
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

          {/* Team A Scoring Controls */}
          <div className="team-scoring-controls">
            <div className="score-buttons-compact">
              <button 
                onClick={() => {
                  if (!selectedPlayerForScoring || !teamAPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team A player!');
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
                  if (!selectedPlayerForScoring || !teamAPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team A player!');
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
                  if (!selectedPlayerForScoring || !teamAPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team A player!');
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
                  if (!selectedPlayerForScoring || !teamAPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team A player!');
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

        {/* Team B - Right Side */}
        <div className="team-column">
          <div className="team-header-wide">
            <h3>{matchInfo.teamB}</h3>
            <button 
              className="substitute-btn-small"
              onClick={() => openSubstitutionModal('B')}
            >
              <Users size={14} /> Sub
            </button>
          </div>

          {/* Team B Players - Playing 5 Only */}
          <div className="players-row">
            {teamBPlaying.map((player, index) => (
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

          {/* Team B Scoring Controls */}
          <div className="team-scoring-controls">
            <div className="score-buttons-compact">
              <button 
                onClick={() => {
                  if (!selectedPlayerForScoring || !teamBPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team B player!');
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
                  if (!selectedPlayerForScoring || !teamBPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team B player!');
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
                  if (!selectedPlayerForScoring || !teamBPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team B player!');
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
                  if (!selectedPlayerForScoring || !teamBPlaying.find(p => p.id === selectedPlayerForScoring)) {
                    showNotification('Please select a Team B player!');
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
    </div>
  );
};

export default ScorerPortal;
