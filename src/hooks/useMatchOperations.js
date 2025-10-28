import { useCallback } from 'react';
import { useMatch } from '../contexts/MatchContext';

/**
 * Custom hook for match operations (scores, timer, players, etc.)
 */
export const useMatchOperations = () => {
  const { state, dispatch, ACTIONS } = useMatch();
  const { firebase, matchData, selectedCourt } = state;

  // Helper to get court path
  const getCourtPath = useCallback(() => {
    const courtKey = selectedCourt ? selectedCourt.replace(' ', '_').toLowerCase() : 'court_a';
    return `matches/${courtKey}`;
  }, [selectedCourt]);

  // Update any match field
  const updateMatchField = useCallback(async (field, value) => {
    if (!firebase || !selectedCourt) return;
    
    const courtPath = getCourtPath();
    const updates = {};
    updates[`${courtPath}/${field}`] = value;
    updates[`${courtPath}/lastUpdated`] = Date.now();

    try {
      await firebase.update(firebase.ref(firebase.database), updates);
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  }, [firebase, selectedCourt, getCourtPath]);

  // Update score
  const updateScore = useCallback(async (team, score) => {
    await updateMatchField(`score${team}`, score);
    dispatch({ type: ACTIONS.UPDATE_SCORE, payload: { team, score } });
  }, [updateMatchField, dispatch, ACTIONS]);

  // Add points to score
  const addScore = useCallback(async (team, points) => {
    if (!matchData) return;
    const currentScore = matchData[`score${team}`] || 0;
    const newScore = Math.max(0, currentScore + points);
    await updateScore(team, newScore);
  }, [matchData, updateScore]);

  // Update timer
  const updateTimer = useCallback(async (seconds) => {
    await updateMatchField('timerSeconds', seconds);
    dispatch({ type: ACTIONS.UPDATE_TIMER, payload: seconds });
  }, [updateMatchField, dispatch, ACTIONS]);

  // Start/stop timer
  const setTimerRunning = useCallback(async (isRunning) => {
    await updateMatchField('isRunning', isRunning);
    dispatch({ type: ACTIONS.SET_TIMER_RUNNING, payload: isRunning });
  }, [updateMatchField, dispatch, ACTIONS]);

  // Update quarter
  const updateQuarter = useCallback(async (quarter) => {
    await updateMatchField('quarter', quarter);
    dispatch({ type: ACTIONS.UPDATE_QUARTER, payload: quarter });
  }, [updateMatchField, dispatch, ACTIONS]);

  // Next quarter
  const nextQuarter = useCallback(async () => {
    if (!matchData) return;
    const newQuarter = Math.min(4, (matchData.quarter || 1) + 1);
    const courtPath = getCourtPath();
    const updates = {};
    updates[`${courtPath}/quarter`] = newQuarter;
    updates[`${courtPath}/timerSeconds`] = (matchData.quarterDuration || 10) * 60;
    updates[`${courtPath}/isRunning`] = false;
    updates[`${courtPath}/lastUpdated`] = Date.now();
    
    await firebase.update(firebase.ref(firebase.database), updates);
  }, [firebase, matchData, getCourtPath]);

  // Add player
  const addPlayer = useCallback(async (playerData) => {
    if (!firebase) return;
    
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const courtPath = getCourtPath();
    const updates = {};
    updates[`${courtPath}/players/${playerId}`] = playerData;
    updates[`${courtPath}/lastUpdated`] = Date.now();
    
    await firebase.update(firebase.ref(firebase.database), updates);
    dispatch({ type: ACTIONS.ADD_PLAYER, payload: { id: playerId, data: playerData } });
    
    return playerId;
  }, [firebase, getCourtPath, dispatch, ACTIONS]);

  // Remove player
  const removePlayer = useCallback(async (playerId) => {
    if (!firebase) return;
    
    const courtPath = getCourtPath();
    const updates = {};
    updates[`${courtPath}/players/${playerId}`] = null;
    updates[`${courtPath}/lastUpdated`] = Date.now();
    
    await firebase.update(firebase.ref(firebase.database), updates);
    dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: playerId });
  }, [firebase, getCourtPath, dispatch, ACTIONS]);

  // Update player
  const updatePlayer = useCallback(async (playerId, updates) => {
    if (!firebase || !matchData) return;
    
    const courtPath = getCourtPath();
    const dbUpdates = {};
    Object.keys(updates).forEach(key => {
      dbUpdates[`${courtPath}/players/${playerId}/${key}`] = updates[key];
    });
    dbUpdates[`${courtPath}/lastUpdated`] = Date.now();
    
    await firebase.update(firebase.ref(firebase.database), dbUpdates);
    dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: { id: playerId, updates } });
  }, [firebase, matchData, getCourtPath, dispatch, ACTIONS]);

  // Update player score and team total
  const updatePlayerScoreAndTeam = useCallback(async (playerId, points, fouls, team) => {
    if (!firebase || !matchData) return;

    // Calculate team total
    let teamTotal = 0;
    const players = matchData.players || {};
    
    for (const [id, player] of Object.entries(players)) {
      if (player.team === team) {
        if (id === playerId) {
          teamTotal += points;
        } else {
          teamTotal += (player.points || 0);
        }
      }
    }

    const courtPath = getCourtPath();
    const updates = {};
    updates[`${courtPath}/players/${playerId}/points`] = points;
    updates[`${courtPath}/players/${playerId}/fouls`] = fouls;
    updates[`${courtPath}/score${team}`] = teamTotal;
    updates[`${courtPath}/lastUpdated`] = Date.now();

    await firebase.update(firebase.ref(firebase.database), updates);
    
    return { playerPoints: points, teamTotal };
  }, [firebase, matchData, getCourtPath]);

  // Initialize new match
  const initializeMatch = useCallback(async (teamA, teamB, court) => {
    if (!firebase) return;
    
    const courtKey = court ? court.replace(' ', '_').toLowerCase() : 'court_a';
    const matchData = {
      teamA: teamA || 'Team A',
      teamB: teamB || 'Team B',
      scoreA: 0,
      scoreB: 0,
      timerSeconds: 600,
      quarterDuration: 10,
      isRunning: false,
      quarter: 1,
      matchStage: 'menu',
      status: 'upcoming',
      players: {},
      teamAPlaying: [],
      teamBPlaying: [],
      lastUpdated: Date.now(),
      createdAt: Date.now()
    };
    
    const { set } = await import('firebase/database');
    await set(firebase.ref(firebase.database, `matches/${courtKey}`), matchData);
  }, [firebase]);

  // Update match stage
  const updateMatchStage = useCallback(async (stage) => {
    await updateMatchField('matchStage', stage);
    dispatch({ type: ACTIONS.SET_MATCH_STAGE, payload: stage });
  }, [updateMatchField, dispatch, ACTIONS]);

  // Set playing players
  const setPlayingPlayers = useCallback(async (teamA, teamB) => {
    const courtPath = getCourtPath();
    const updates = {};
    if (teamA !== undefined) updates[`${courtPath}/teamAPlaying`] = teamA;
    if (teamB !== undefined) updates[`${courtPath}/teamBPlaying`] = teamB;
    updates[`${courtPath}/lastUpdated`] = Date.now();
    
    await firebase.update(firebase.ref(firebase.database), updates);
    dispatch({ type: ACTIONS.SET_PLAYING_PLAYERS, payload: { teamA, teamB } });
  }, [firebase, getCourtPath, dispatch, ACTIONS]);

  return {
    updateScore,
    addScore,
    updateTimer,
    setTimerRunning,
    updateQuarter,
    nextQuarter,
    addPlayer,
    removePlayer,
    updatePlayer,
    updatePlayerScoreAndTeam,
    initializeMatch,
    updateMatchStage,
    setPlayingPlayers,
    updateMatchField,
  };
};

export default useMatchOperations;

