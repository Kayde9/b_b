import React from 'react';
import { motion } from 'framer-motion';
import Basketball3D from './Basketball3D';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="basketball-container">
        <Basketball3D />
      </div>
      <motion.h1
        className="loading-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        🏀 INTER-NMIMS BASKETBALL 2025
      </motion.h1>
      <motion.div
        className="loading-bar"
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <motion.div
          className="loading-bar-fill"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.p
        className="loading-subtext"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading the court...
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;
