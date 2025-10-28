import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { getFirebaseDatabase } from '../firebase';

const MatchContext = createContext();

// Action types
const ACTIONS = {
  SET_MATCH_DATA: 'SET_MATCH_DATA',
  SET_FIREBASE: 'SET_FIREBASE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MATCH_STAGE: 'SET_MATCH_STAGE',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_SELECTED_COURT: 'SET_SELECTED_COURT',
  UPDATE_SCORE: 'UPDATE_SCORE',
  UPDATE_TIMER: 'UPDATE_TIMER',
  UPDATE_QUARTER: 'UPDATE_QUARTER',
  SET_PLAYING_PLAYERS: 'SET_PLAYING_PLAYERS',
  ADD_PLAYER: 'ADD_PLAYER',
  REMOVE_PLAYER: 'REMOVE_PLAYER',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  SET_TIMER_RUNNING: 'SET_TIMER_RUNNING',
};

// Initial state
const initialState = {
  matchData: null,
  firebase: null,
  loading: true,
  error: null,
  matchStage: 'menu',
  authenticated: false,
  selectedCourt: null,
  timerSeconds: 600,
  quarterDuration: 10,
  teamAPlaying: [],
  teamBPlaying: [],
};

// Reducer function
function matchReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_MATCH_DATA:
      return { ...state, matchData: action.payload };
    
    case ACTIONS.SET_FIREBASE:
      return { ...state, firebase: action.payload, loading: false };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_MATCH_STAGE:
      return { ...state, matchStage: action.payload };
    
    case ACTIONS.SET_AUTHENTICATED:
      return { ...state, authenticated: action.payload };
    
    case ACTIONS.SET_SELECTED_COURT:
      return { ...state, selectedCourt: action.payload };
    
    case ACTIONS.UPDATE_SCORE:
      if (!state.matchData) return state;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          [`score${action.payload.team}`]: action.payload.score,
        },
      };
    
    case ACTIONS.UPDATE_TIMER:
      if (!state.matchData) return state;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          timerSeconds: action.payload,
        },
      };
    
    case ACTIONS.UPDATE_QUARTER:
      if (!state.matchData) return state;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          quarter: action.payload,
        },
      };
    
    case ACTIONS.SET_PLAYING_PLAYERS:
      return {
        ...state,
        teamAPlaying: action.payload.teamA || state.teamAPlaying,
        teamBPlaying: action.payload.teamB || state.teamBPlaying,
      };
    
    case ACTIONS.ADD_PLAYER:
      if (!state.matchData) return state;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          players: {
            ...state.matchData.players,
            [action.payload.id]: action.payload.data,
          },
        },
      };
    
    case ACTIONS.REMOVE_PLAYER:
      if (!state.matchData || !state.matchData.players) return state;
      const { [action.payload]: removed, ...remainingPlayers } = state.matchData.players;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          players: remainingPlayers,
        },
      };
    
    case ACTIONS.UPDATE_PLAYER:
      if (!state.matchData || !state.matchData.players) return state;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          players: {
            ...state.matchData.players,
            [action.payload.id]: {
              ...state.matchData.players[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
      };
    
    case ACTIONS.SET_TIMER_RUNNING:
      if (!state.matchData) return state;
      return {
        ...state,
        matchData: {
          ...state.matchData,
          isRunning: action.payload,
        },
      };
    
    default:
      return state;
  }
}

// Provider component
export const MatchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const prevMatchDataRef = useRef(null);

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { database, ref, onValue, update } = await getFirebaseDatabase();
        dispatch({ type: ACTIONS.SET_FIREBASE, payload: { database, ref, onValue, update } });
      } catch (err) {
        console.error('Firebase initialization error:', err);
        dispatch({ type: ACTIONS.SET_ERROR, payload: err?.message || 'Failed to initialize Firebase' });
      }
    };
    
    initFirebase();
  }, []);

  // Listen to court-specific match data
  useEffect(() => {
    if (!state.firebase || !state.selectedCourt) return;

    const courtPath = getCourtPath(state.selectedCourt);
    const matchRef = state.firebase.ref(state.firebase.database, courtPath);
    
    const unsubscribe = state.firebase.onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const prevData = prevMatchDataRef.current;
        const hasChanged = !prevData || JSON.stringify(data) !== JSON.stringify(prevData);
        
        if (hasChanged) {
          prevMatchDataRef.current = data;
          dispatch({ type: ACTIONS.SET_MATCH_DATA, payload: data });
          dispatch({ type: ACTIONS.SET_MATCH_STAGE, payload: data.matchStage || 'menu' });
          dispatch({ 
            type: ACTIONS.SET_PLAYING_PLAYERS, 
            payload: { teamA: data.teamAPlaying || [], teamB: data.teamBPlaying || [] }
          });
        }
      }
    });

    return () => unsubscribe();
  }, [state.firebase, state.selectedCourt]);

  return (
    <MatchContext.Provider value={{ state, dispatch, ACTIONS }}>
      {children}
    </MatchContext.Provider>
  );
};

// Custom hook to use the match context
export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};

// Helper function
function getCourtPath(court) {
  const courtKey = court ? court.replace(' ', '_').toLowerCase() : 'court_a';
  return `matches/${courtKey}`;
}

export default MatchContext;

