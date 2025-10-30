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
    </div>
  );
};

export default Scoreboard;
