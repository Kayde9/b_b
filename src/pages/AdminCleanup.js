import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { cleanupOrphanedMatches, clearAllRealtimeMatches } from '../utils/cleanupOrphanedMatches';
import './AdminCleanup.css';

const AdminCleanup = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loginError, setLoginError] = useState('');

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin2025';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
    setPassword('');
  };

  const handleCleanupOrphaned = async () => {
    if (!window.confirm('This will remove matches from the scoreboard that no longer exist in the scheduler. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await cleanupOrphanedMatches();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    }

    setLoading(false);
  };

  const handleClearAll = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL matches from the live scoreboard (both current and completed). Are you absolutely sure?')) {
      return;
    }

    if (!window.confirm('This action cannot be undone! Type YES in your mind and click OK to confirm.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await clearAllRealtimeMatches();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    }

    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="admin-cleanup-container">
        <motion.div 
          className="login-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="login-header">
            <AlertTriangle size={48} color="#FF6B35" />
            <h1>Admin Cleanup</h1>
            <p>Database maintenance tools</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="password-input"
              autoFocus
            />
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="login-btn">
              Access Admin Tools
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-cleanup-container authenticated">
      <motion.div
        className="cleanup-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="panel-header">
          <h1>🛠️ Database Cleanup Tools</h1>
          <p>Maintain sync between Firestore and Realtime Database</p>
        </div>

        <div className="cleanup-actions">
          {/* Cleanup Orphaned Matches */}
          <div className="action-card">
            <div className="action-icon">
              <RefreshCw size={32} color="#FF6B35" />
            </div>
            <h2>Remove Orphaned Matches</h2>
            <p className="action-description">
              Removes matches from the scoreboard that have been deleted from the scheduler.
              This is the <strong>recommended</strong> option.
            </p>
            <button 
              onClick={handleCleanupOrphaned}
              disabled={loading}
              className="action-btn primary"
            >
              {loading ? 'Processing...' : 'Clean Up Orphaned Matches'}
            </button>
          </div>

          {/* Clear All */}
          <div className="action-card danger">
            <div className="action-icon">
              <Trash2 size={32} color="#ef4444" />
            </div>
            <h2>Clear All Scoreboard Data</h2>
            <p className="action-description">
              ⚠️ <strong>DANGER:</strong> This will remove ALL matches from the live scoreboard.
              Use only if you want to start fresh.
            </p>
            <button 
              onClick={handleClearAll}
              disabled={loading}
              className="action-btn danger"
            >
              {loading ? 'Processing...' : 'Clear All Matches'}
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <motion.div
            className={`result-box ${result.success ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="result-icon">
              {result.success ? '✅' : '❌'}
            </div>
            <div className="result-message">
              <h3>{result.success ? 'Success!' : 'Error'}</h3>
              <p>{result.message}</p>
              {result.removedCount !== undefined && (
                <p className="result-detail">
                  Removed: <strong>{result.removedCount}</strong> orphaned match(es)
                </p>
              )}
            </div>
          </motion.div>
        )}

        <div className="info-box">
          <h3>ℹ️ How This Works</h3>
          <ul>
            <li><strong>Orphaned Matches:</strong> Matches that exist in Realtime Database but were deleted from Firestore</li>
            <li><strong>Clean Up:</strong> Compares both databases and removes matches that shouldn't be displayed</li>
            <li><strong>Safe Operation:</strong> Only removes invalid data, keeps valid matches intact</li>
            <li><strong>When to Use:</strong> After deleting matches that are still showing on scoreboard</li>
          </ul>
        </div>

        <div className="back-link">
          <button onClick={() => window.location.href = '/schedule'} className="back-btn">
            ← Back to Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCleanup;


