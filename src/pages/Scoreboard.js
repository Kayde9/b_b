import React from 'react';
import { motion } from 'framer-motion';
import LiveScoreboard from '../components/LiveScoreboard';
import './Scoreboard.css';

const Scoreboard = () => {
  return (
    <div className="scoreboard-page page-container dark-theme">
      {/* Page Header */}
      <section className="scoreboard-header section">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="page-title">
            🏀 LIVE SCOREBOARD
          </h1>
          <p className="page-subtitle">
            Real-time match scores and updates
          </p>
        </motion.div>
      </section>

      {/* Live Scoreboard Component */}
      <section className="scoreboard-content section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LiveScoreboard />
        </motion.div>
      </section>

      {/* Info Section */}
      <section className="scoreboard-info section">
        <motion.div
          className="info-box glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3>📊 About Live Scores</h3>
          <p>
            This scoreboard displays real-time updates from ongoing matches. 
            Scores are updated automatically as the game progresses.
          </p>
          <ul>
            <li>✅ Live score updates</li>
            <li>✅ Quarter-by-quarter breakdown</li>
            <li>✅ Real-time synchronization</li>
            <li>✅ Match status indicators</li>
          </ul>
        </motion.div>
      </section>
    </div>
  );
};

export default Scoreboard;
