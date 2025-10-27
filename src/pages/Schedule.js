import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFirebaseDatabase } from '../firebase';
import LiveScoreboard from '../components/LiveScoreboard';
import './Schedule.css';

const Schedule = () => {
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchFilter, setMatchFilter] = useState('upcoming'); // 'upcoming' or 'past'
  const navigate = useNavigate();

  // Load scheduled matches from Firebase
  useEffect(() => {
    const loadScheduledMatches = async () => {
      try {
        const { database, ref, onValue } = await getFirebaseDatabase();
        const scheduledRef = ref(database, 'matches/scheduled');
        
        onValue(scheduledRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const matchesArray = Object.values(data).sort((a, b) => {
              // Sort by date and time
              const dateA = new Date(`${a.date} ${a.time}`);
              const dateB = new Date(`${b.date} ${b.time}`);
              return dateA - dateB;
            });
            setScheduledMatches(matchesArray);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error loading scheduled matches:', error);
        setLoading(false);
      }
    };

    loadScheduledMatches();
  }, []);


  // Filter matches based on status
  const upcomingMatches = scheduledMatches.filter(m => m.status === 'upcoming' || m.status === 'live');
  const pastMatches = scheduledMatches.filter(m => m.status === 'completed');

  const displayedMatches = matchFilter === 'upcoming' ? upcomingMatches : pastMatches;

  const handleViewScore = (matchId) => {
    // Navigate to live scoreboard or match detail page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="schedule page-container dark-theme">
      {/* Live Scoreboard */}
      <section className="section" style={{ paddingTop: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title" style={{ marginBottom: '2rem' }}>
            LIVE MATCH SCOREBOARD
          </h2>
          <LiveScoreboard />
        </motion.div>
      </section>

      {/* Scheduled Matches from Firebase */}
      <section className="schedule-section section">
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
          📅 SCHEDULED MATCHES
        </h2>

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
                  <div className="match-type">{match.roundType}</div>
                  <div className={`match-status ${match.status === 'live' ? 'live' : match.hasScore ? 'completed' : 'upcoming'}`}>
                    {match.status === 'live' ? 'LIVE' : match.hasScore ? 'Completed' : 'Upcoming'}
                  </div>
                </div>

                <div className="match-teams">
                  <div className={`team team-1 ${match.status === 'completed' && match.finalScoreA > match.finalScoreB ? 'winner' : ''}`}>
                    <div className="team-logo">🏀</div>
                    <div className="team-name">{match.teamA} ({match.matchType})</div>
                    {match.status === 'completed' && (
                      <div className="final-score">{match.finalScoreA}</div>
                    )}
                  </div>

                  <div className="vs-divider">
                    <span className="vs-text">{match.status === 'completed' ? 'FINAL' : 'VS'}</span>
                  </div>

                  <div className={`team team-2 ${match.status === 'completed' && match.finalScoreB > match.finalScoreA ? 'winner' : ''}`}>
                    <div className="team-logo">🏀</div>
                    <div className="team-name">{match.teamB} ({match.matchType})</div>
                    {match.status === 'completed' && (
                      <div className="final-score">{match.finalScoreB}</div>
                    )}
                  </div>
                </div>

                {/* Winner Badge for Past Matches */}
                {match.status === 'completed' && (
                  <div className="winner-badge">
                    Winner: {match.finalScoreA > match.finalScoreB ? match.teamA : match.finalScoreB > match.finalScoreA ? match.teamB : 'Tie'}
                  </div>
                )}

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
                    <span>{match.court}</span>
                  </div>
                </div>

                <button 
                  className="view-score-btn"
                  onClick={() => handleViewScore(match.id)}
                >
                  <Eye size={18} />
                  {match.status === 'completed' ? 'View Stats' : 'View Score'}
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
    </div>
  );
};

export default Schedule;
