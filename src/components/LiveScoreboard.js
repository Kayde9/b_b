import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirebaseDatabase } from '../firebase';
import './LiveScoreboard.css';

const LiveScoreboard = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCompleted, setVisibleCompleted] = useState(4);
  const navigate = useNavigate();
  
  const prevMatchDataRef = useRef(null);

  const getTeamInitials = (teamName) => {
    if (!teamName) return '?';
    const words = teamName.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return teamName.substring(0, 2).toUpperCase();
  };

  const handleViewLeaderboard = () => {
    // Navigate to leaderboard page (you can create this route later)
    navigate('/leaderboard');
  };

  const handleSeeMore = () => {
    setVisibleCompleted(prev => prev + 4);
  };

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { database, ref, onValue } = await getFirebaseDatabase();
        
        // Listen to current live match
        const liveMatchRef = ref(database, 'matches/current');
        const liveUnsubscribe = onValue(liveMatchRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.matchStage !== 'finished') {
            setLiveMatches([{
              id: 'current',
              teamA: data.teamA || 'Team A',
              teamB: data.teamB || 'Team B',
              scoreA: data.scoreA || 0,
              scoreB: data.scoreB || 0,
              isRunning: data.isRunning,
              quarter: data.quarter
            }]);
          } else {
            setLiveMatches([]);
          }
          setLoading(false);
        });

        // Listen to completed matches
        const completedRef = ref(database, 'matches/completed');
        const completedUnsubscribe = onValue(completedRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const matchesArray = Object.entries(data).map(([id, match]) => ({
              id,
              teamA: match.teamA || 'Team A',
              teamB: match.teamB || 'Team B',
              scoreA: match.finalScoreA || match.scoreA || 0,
              scoreB: match.finalScoreB || match.scoreB || 0,
              date: match.completedAt || match.date
            })).sort((a, b) => (b.date || 0) - (a.date || 0));
            setCompletedMatches(matchesArray);
          }
        });

        return () => {
          liveUnsubscribe();
          completedUnsubscribe();
        };
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError('Failed to connect to live data');
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  if (loading) {
    return (
      <div className="live-scoreboard-loading">
        <p>Loading scoreboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-scoreboard-error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="scorecard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <div className="scorecard-header">
        <button className="view-leaderboard-btn" onClick={handleViewLeaderboard}>
          VIEW LEADERBOARD
        </button>
      </div>

      {/* Live Matches Section */}
      <div className="matches-section">
        <h2 className="section-title">Live</h2>
        <div className="matches-grid">
          {liveMatches.length > 0 ? (
            liveMatches.map((match) => (
              <MatchPanel
                key={match.id}
                match={match}
                isLive={true}
                getTeamInitials={getTeamInitials}
              />
            ))
          ) : (
            <div className="no-matches">No live matches at the moment</div>
          )}
        </div>
      </div>

      {/* Completed Matches Section */}
      <div className="matches-section">
        <h2 className="section-title">Completed Matches</h2>
        <div className="matches-grid">
          {completedMatches.length > 0 ? (
            completedMatches.slice(0, visibleCompleted).map((match) => (
              <MatchPanel
                key={match.id}
                match={match}
                isLive={false}
                getTeamInitials={getTeamInitials}
              />
            ))
          ) : (
            <div className="no-matches">No completed matches yet</div>
          )}
        </div>
        {completedMatches.length > visibleCompleted && (
          <div className="see-more-container">
            <button className="see-more-btn" onClick={handleSeeMore}>
              SEE MORE
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Match Panel Component
const MatchPanel = ({ match, isLive, getTeamInitials }) => {
  const [showDetailedView, setShowDetailedView] = useState(false);

  return (
    <>
      <motion.div
        className="match-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="match-teams">
          <div className="team-info">
            <div className="team-circle">
              <span className="team-initials">{getTeamInitials(match.teamA)}</span>
            </div>
            <span className="team-name-label">{match.teamA}</span>
          </div>
          
          <div className="match-score-center">
            <div className="score-display">
              <span className="score-number">{match.scoreA}</span>
              <span className="score-divider">-</span>
              <span className="score-number">{match.scoreB}</span>
            </div>
            {!isLive && <div className="final-badge">Final</div>}
          </div>
          
          <div className="team-info">
            <div className="team-circle">
              <span className="team-initials">{getTeamInitials(match.teamB)}</span>
            </div>
            <span className="team-name-label">{match.teamB}</span>
          </div>
        </div>
        
        <button 
          className="view-match-btn"
          onClick={() => setShowDetailedView(true)}
        >
          View Match
        </button>
      </motion.div>

      {/* Detailed Match Modal */}
      {showDetailedView && (
        <DetailedMatchModal 
          match={match} 
          onClose={() => setShowDetailedView(false)}
        />
      )}
    </>
  );
};

// Detailed Match Modal Component
const DetailedMatchModal = ({ match, onClose }) => {
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('A');

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const { database, ref, get } = await getFirebaseDatabase();
        
        // Fetch from current match or completed matches
        let matchData;
        if (match.id === 'current') {
          const currentRef = ref(database, 'matches/current');
          const snapshot = await get(currentRef);
          matchData = snapshot.val();
        } else {
          const completedRef = ref(database, `matches/completed/${match.id}`);
          const snapshot = await get(completedRef);
          matchData = snapshot.val();
        }
        
        setMatchDetails(matchData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching match details:', error);
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [match.id]);

  const getPlayersByTeam = (team) => {
    if (!matchDetails?.players) return [];
    return Object.entries(matchDetails.players)
      .filter(([_, player]) => player.team === team)
      .sort((a, b) => (b[1].points || 0) - (a[1].points || 0));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Match Details</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading match details...</div>
        ) : (
          <div className="modal-body">
            {/* Match Score Header */}
            <div className="modal-score-header">
              <div className="modal-team-section">
                <h3 className="modal-team-name">{match.teamA}</h3>
                <div className="modal-team-score">{match.scoreA}</div>
              </div>
              <div className="modal-vs">VS</div>
              <div className="modal-team-section">
                <h3 className="modal-team-name">{match.teamB}</h3>
                <div className="modal-team-score">{match.scoreB}</div>
              </div>
            </div>

            {/* Player Statistics with Team Dropdown */}
            <div className="player-statistics-single">
              <div className="team-selector">
                <h4 className="stats-section-title">Player Statistics</h4>
                <select 
                  className="team-dropdown"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="A">{match.teamA}</option>
                  <option value="B">{match.teamB}</option>
                </select>
              </div>

              <div className="players-table-container">
                <table className="players-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Points</th>
                      <th>Fouls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPlayersByTeam(selectedTeam).length > 0 ? (
                      getPlayersByTeam(selectedTeam).map(([id, player]) => (
                        <tr key={id}>
                          <td className="player-name">{player.name || 'Player'}</td>
                          <td className="points-cell">{player.points || 0}</td>
                          <td className="fouls-cell">{player.fouls || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" className="no-data">No player data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quarter Breakdown */}
            {matchDetails?.quarterScores && (
              <div className="quarter-breakdown">
                <h4 className="breakdown-title">Quarter Breakdown</h4>
                <table className="quarter-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Q1</th>
                      <th>Q2</th>
                      <th>Q3</th>
                      <th>Q4</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{match.teamA}</td>
                      <td>{matchDetails.quarterScores.q1?.teamA || 0}</td>
                      <td>{matchDetails.quarterScores.q2?.teamA || 0}</td>
                      <td>{matchDetails.quarterScores.q3?.teamA || 0}</td>
                      <td>{matchDetails.quarterScores.q4?.teamA || 0}</td>
                      <td className="total-score">{match.scoreA}</td>
                    </tr>
                    <tr>
                      <td>{match.teamB}</td>
                      <td>{matchDetails.quarterScores.q1?.teamB || 0}</td>
                      <td>{matchDetails.quarterScores.q2?.teamB || 0}</td>
                      <td>{matchDetails.quarterScores.q3?.teamB || 0}</td>
                      <td>{matchDetails.quarterScores.q4?.teamB || 0}</td>
                      <td className="total-score">{match.scoreB}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveScoreboard;
