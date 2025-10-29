import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFirestoreUtils } from '../firebase';
import './Schedule.css';

const Schedule = () => {
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchFilter, setMatchFilter] = useState('upcoming'); // 'upcoming' or 'past'
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const navigate = useNavigate();

  // Load scheduled matches from Firestore
  useEffect(() => {
    const loadScheduledMatches = async () => {
      try {
        const { firestore, collection, getDocs, query, orderBy } = await getFirestoreUtils();
        const matchesRef = collection(firestore, 'scheduledMatches');
        const q = query(matchesRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        
        const matchesArray = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Determine status based on date
          status: determineMatchStatus(doc.data().date, doc.data().time)
        }));
        
        setScheduledMatches(matchesArray);
        setLoading(false);
      } catch (error) {
        console.error('Error loading scheduled matches:', error);
        setLoading(false);
      }
    };

    loadScheduledMatches();
  }, []);

  // Helper function to determine match status
  const determineMatchStatus = (matchDate, matchTime) => {
    const now = new Date();
    const matchDateTime = new Date(`${matchDate} ${matchTime}`);
    
    if (matchDateTime > now) {
      return 'upcoming';
    } else {
      return 'completed';
    }
  };


  // Filter matches based on status
  const upcomingMatches = scheduledMatches.filter(m => m.status === 'upcoming' || m.status === 'live');
  const pastMatches = scheduledMatches.filter(m => m.status === 'completed');

  const displayedMatches = matchFilter === 'upcoming' ? upcomingMatches : pastMatches;

  const handleViewMatchDetails = async (match) => {
    setSelectedMatch(match);
    setShowMatchDetails(true);
    
    // Load players for this match
    try {
      const { firestore, collection, query, where, getDocs } = await getFirestoreUtils();
      const playersRef = collection(firestore, 'players');
      const q = query(playersRef, where('matchId', '==', match.matchId));
      const snapshot = await getDocs(q);
      
      const players = [];
      snapshot.forEach(doc => {
        players.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Loaded players for match:', match.matchId);
      console.log('Total players found:', players.length);
      console.log('Team A players:', players.filter(p => p.team === 'A').length);
      console.log('Team B players:', players.filter(p => p.team === 'B').length);
      console.log('All players:', players);
      
      setMatchPlayers(players);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  return (
    <div className="schedule page-container dark-theme">
      {/* Scheduled Matches from Firebase */}
      <section className="schedule-section section" style={{ paddingTop: '100px' }}>

        {/* Tab Buttons */}
        <div className="match-filter-tabs">
          <motion.button
            className={`filter-tab ${matchFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setMatchFilter('upcoming')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-label">Upcoming Matches</span>
            <span className="tab-count">{upcomingMatches.length}</span>
          </motion.button>
          <motion.button
            className={`filter-tab ${matchFilter === 'past' ? 'active' : ''}`}
            onClick={() => setMatchFilter('past')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-label">Past Matches</span>
            <span className="tab-count">{pastMatches.length}</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="loading-container glass-card">
            <p>Loading matches...</p>
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="no-matches-container glass-card">
            <p>{matchFilter === 'upcoming' ? 'No upcoming matches scheduled.' : 'No past matches yet.'}</p>
          </div>
        ) : (
          <div className="matches-grid">
            {displayedMatches.map((match, index) => (
              <motion.div
                key={match.id}
                className="match-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="match-header">
                  <div className="match-type">Basketball</div>
                  <div className={`match-status ${match.status === 'live' ? 'live' : match.status === 'completed' ? 'completed' : 'upcoming'}`}>
                    {match.status === 'live' ? 'LIVE' : match.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </div>
                </div>

                <div className="match-teams">
                  <div className="team team-1">
                    <div className="team-logo">🏀</div>
                    <div className="team-name">{match.teamA}</div>
                  </div>

                  <div className="vs-divider">
                    <span className="vs-text">VS</span>
                  </div>

                  <div className="team team-2">
                    <div className="team-logo">🏀</div>
                    <div className="team-name">{match.teamB}</div>
                  </div>
                </div>

                <div className="match-details">
                  <div className="detail">
                    <Calendar size={18} />
                    <span>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="detail">
                    <Clock size={18} />
                    <span>{match.time}</span>
                  </div>
                  <div className="detail">
                    <MapPin size={18} />
                    <span>{match.venue}</span>
                  </div>
                </div>

                {match.status === 'completed' && match.finalScore && (
                  <div className="match-score-display">
                    <div className="score-item">
                      <span className="score-team">{match.teamA}</span>
                      <span className="score-value">{match.finalScore.teamA}</span>
                    </div>
                    <div className="score-divider">-</div>
                    <div className="score-item">
                      <span className="score-value">{match.finalScore.teamB}</span>
                      <span className="score-team">{match.teamB}</span>
                    </div>
                  </div>
                )}

                <button 
                  className="view-details-btn"
                  onClick={() => handleViewMatchDetails(match)}
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>


      {/* Tournament Info */}
      <section className="tournament-info section">
        <h2 className="section-title">TOURNAMENT FORMAT</h2>
        <div className="info-grid">
          <motion.div
            className="info-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="info-icon">
              <Calendar size={40} />
            </div>
            <h3 className="info-title">Knockout Round</h3>
            <p className="info-description">
              Day 1 features knockout matches for both boys and girls teams. Win or go home - only the strongest advance!
            </p>
          </motion.div>

          <motion.div
            className="info-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
                        <div className="info-icon">
              <Trophy size={40} />
            </div>
            <h3 className="info-title">Semi Finals</h3>
            <p className="info-description">
              Day 2 morning brings intense semi-finals for both boys and girls tournaments. The final four battle for championship spots!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Match Details Modal */}
      {showMatchDetails && selectedMatch && (
        <div className="modal-overlay" onClick={() => setShowMatchDetails(false)}>
          <motion.div 
            className="match-details-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>MATCH DETAILS</h2>
              <button className="close-modal-btn" onClick={() => setShowMatchDetails(false)}>✕</button>
            </div>

            <div className="modal-content">
              {/* Match Info */}
              <div className="match-info-section">
                <div className="teams-display">
                  <div className="team-display">
                    <h3>{selectedMatch.teamA}</h3>
                    <div className="final-score">{selectedMatch.finalScore?.teamA || 0}</div>
                  </div>
                  <div className="vs-text-large">VS</div>
                  <div className="team-display">
                    <h3>{selectedMatch.teamB}</h3>
                    <div className="final-score">{selectedMatch.finalScore?.teamB || 0}</div>
                  </div>
                </div>

                {selectedMatch.winner && (
                  <div className="winner-display">
                    🏆 Winner: <strong>{selectedMatch.winner}</strong>
                  </div>
                )}
              </div>

              {/* Quarter Breakdown */}
              {selectedMatch.quarterScores && (
                <div className="quarter-breakdown-section">
                  <h3>QUARTER BREAKDOWN</h3>
                  <table className="quarter-table">
                    <thead>
                      <tr>
                        <th>TEAM</th>
                        <th>Q1</th>
                        <th>Q2</th>
                        <th>Q3</th>
                        <th>Q4</th>
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{selectedMatch.teamA}</td>
                        <td>{selectedMatch.quarterScores.q1?.teamA || 0}</td>
                        <td>{selectedMatch.quarterScores.q2?.teamA || 0}</td>
                        <td>{selectedMatch.quarterScores.q3?.teamA || 0}</td>
                        <td>{selectedMatch.quarterScores.q4?.teamA || 0}</td>
                        <td className="total-score">{selectedMatch.finalScore?.teamA || 0}</td>
                      </tr>
                      <tr>
                        <td>{selectedMatch.teamB}</td>
                        <td>{selectedMatch.quarterScores.q1?.teamB || 0}</td>
                        <td>{selectedMatch.quarterScores.q2?.teamB || 0}</td>
                        <td>{selectedMatch.quarterScores.q3?.teamB || 0}</td>
                        <td>{selectedMatch.quarterScores.q4?.teamB || 0}</td>
                        <td className="total-score">{selectedMatch.finalScore?.teamB || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Players List */}
              {matchPlayers.length > 0 ? (
                <div className="players-section">
                  <h3>{selectedMatch.teamA} PLAYERS ({matchPlayers.filter(p => p.team === 'A').length} total)</h3>
                  <table className="players-table">
                    <thead>
                      <tr>
                        <th>PLAYER</th>
                        <th>POINTS</th>
                        <th>FOULS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchPlayers
                        .filter(p => p.team === 'A')
                        .map(player => (
                          <tr key={player.id}>
                            <td>{player.playerName}</td>
                            <td>{selectedMatch.playerStats?.[player.id]?.points || 0}</td>
                            <td>{selectedMatch.playerStats?.[player.id]?.fouls || 0}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  <h3>{selectedMatch.teamB} PLAYERS ({matchPlayers.filter(p => p.team === 'B').length} total)</h3>
                  <table className="players-table">
                    <thead>
                      <tr>
                        <th>PLAYER</th>
                        <th>POINTS</th>
                        <th>FOULS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchPlayers
                        .filter(p => p.team === 'B')
                        .map(player => (
                          <tr key={player.id}>
                            <td>{player.playerName}</td>
                            <td>{selectedMatch.playerStats?.[player.id]?.points || 0}</td>
                            <td>{selectedMatch.playerStats?.[player.id]?.fouls || 0}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="players-section">
                  <p style={{color: '#9ca3af', textAlign: 'center', padding: '2rem'}}>
                    No players found for this match. Players need to be added in the Match Scheduler.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
