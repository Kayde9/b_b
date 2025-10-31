import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Edit2, Trash2, Plus, X, LogOut, Upload, Download } from 'lucide-react';
import { getFirestoreUtils, generateMatchId, getFirebaseDatabase } from '../firebase';
import * as XLSX from 'xlsx';
import './MatchScheduler.css';

const MatchScheduler = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedMatchForPlayers, setSelectedMatchForPlayers] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Password for match scheduler access
  const SCHEDULER_PASSWORD = process.env.REACT_APP_SCHEDULER_PASSWORD || 'scheduler2025';
  
  // Form states
  const [matchForm, setMatchForm] = useState({
    teamA: '',
    teamB: '',
    date: '',
    time: '',
    venue: '',
    matchType: 'Knockout',
    gender: 'Boys'
  });
  
  const [players, setPlayers] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Load scheduled matches only when authenticated
  useEffect(() => {
    if (authenticated) {
      loadMatches();
    }
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SCHEDULER_PASSWORD) {
      setAuthenticated(true);
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
  };

  const loadMatches = async () => {
    try {
      const { firestore, collection, getDocs, query, orderBy } = await getFirestoreUtils();
      const matchesRef = collection(firestore, 'scheduledMatches');
      const q = query(matchesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMatches(matchesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading matches:', error);
      setLoading(false);
    }
  };

  const handleScheduleMatch = async (e) => {
    e.preventDefault();
    
    try {
      const { firestore, collection, addDoc, doc, updateDoc, serverTimestamp } = await getFirestoreUtils();
      const matchId = generateMatchId();
      
      const matchData = {
        matchId,
        ...matchForm,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingMatch) {
        // Update existing match
        const matchRef = doc(firestore, 'scheduledMatches', editingMatch.id);
        await updateDoc(matchRef, {
          ...matchForm,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new match
        await addDoc(collection(firestore, 'scheduledMatches'), matchData);
      }

      // Reset form
      setMatchForm({ teamA: '', teamB: '', date: '', time: '', venue: '', matchType: 'Knockout', gender: 'Boys' });
      setShowScheduleForm(false);
      setEditingMatch(null);
      loadMatches();
    } catch (error) {
      console.error('Error scheduling match:', error);
      alert('Failed to schedule match. Please try again.');
    }
  };

  const handleAddPlayers = async (e) => {
    e.preventDefault();
    
    if (!selectedMatchForPlayers) return;
    
    try {
      const { firestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } = await getFirestoreUtils();
      const playersRef = collection(firestore, 'players');
      
      // Check if players already exist
      const q = query(playersRef, where('matchId', '==', selectedMatchForPlayers.matchId));
      const existingSnapshot = await getDocs(q);
      
      if (!existingSnapshot.empty) {
        const confirmReplace = window.confirm(
          `Players already exist for this match (${existingSnapshot.size} players). Do you want to replace them?`
        );
        
        if (!confirmReplace) {
          return;
        }
        
        // Delete existing players
        const deletePromises = existingSnapshot.docs.map(docSnap => 
          deleteDoc(doc(firestore, 'players', docSnap.id))
        );
        await Promise.all(deletePromises);
      }
      
      // Add all players to Firestore
      const addPromises = players.map(player => {
        if (player.playerName && player.jerseyNumber) {
          return addDoc(playersRef, {
            jerseyNumber: player.jerseyNumber,
            playerName: player.playerName,
            team: player.team,
            matchId: selectedMatchForPlayers.matchId,
            createdAt: new Date()
          });
        }
        return null;
      }).filter(Boolean);
      
      await Promise.all(addPromises);
      
      alert(`Successfully added ${addPromises.length} players to the match!`);
      setShowPlayerForm(false);
      setPlayers([]);
      setUploadedFileName('');
    } catch (error) {
      console.error('Error adding players:', error);
      alert('Failed to add players. Please try again.');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match? This will also remove it from the live scoreboard if it exists there.')) return;
    
    try {
      const { firestore, doc, deleteDoc, collection, query, where, getDocs } = await getFirestoreUtils();
      
      // Get match data before deleting
      const match = matches.find(m => m.id === matchId);
      
      if (!match) {
        alert('Match not found');
        return;
      }

      console.log('Deleting match:', match);
      
      // Delete from Realtime Database FIRST (before Firestore)
      try {
        const { database, ref, get, set, update } = await getFirebaseDatabase();
        
        // Check if this match is the current live match
        const currentMatchRef = ref(database, 'matches/current');
        const currentSnapshot = await get(currentMatchRef);
        const currentMatch = currentSnapshot.val();
        
        console.log('Current live match:', currentMatch);
        
        // If the deleted match is currently live, clear it
        if (currentMatch) {
          const isCurrentMatch = 
            currentMatch.matchId === match.matchId ||
            (currentMatch.teamA === match.teamA && currentMatch.teamB === match.teamB) ||
            (currentMatch.teamA?.toLowerCase().includes(match.teamA?.toLowerCase()) && 
             currentMatch.teamB?.toLowerCase().includes(match.teamB?.toLowerCase()));
          
          if (isCurrentMatch) {
            console.log('Removing from live scoreboard...');
            await set(currentMatchRef, null);
            console.log('✅ Removed match from live scoreboard');
          }
        }
        
        // Check and remove from completed matches
        const completedRef = ref(database, 'matches/completed');
        const completedSnapshot = await get(completedRef);
        const completedMatches = completedSnapshot.val();
        
        if (completedMatches) {
          const updatesToRemove = {};
          Object.entries(completedMatches).forEach(([key, completedMatch]) => {
            const isMatch = 
              completedMatch.matchId === match.matchId ||
              (completedMatch.teamA === match.teamA && completedMatch.teamB === match.teamB);
            
            if (isMatch) {
              updatesToRemove[`matches/completed/${key}`] = null;
              console.log('Marking completed match for removal:', key);
            }
          });
          
          if (Object.keys(updatesToRemove).length > 0) {
            await update(ref(database), updatesToRemove);
            console.log('✅ Removed from completed matches');
          }
        }
      } catch (realtimeError) {
        console.error('Error removing from Realtime Database:', realtimeError);
        alert('Warning: Could not remove from live scoreboard. Error: ' + realtimeError.message);
      }
      
      // Delete associated players from Firestore
      const playersRef = collection(firestore, 'players');
      const q = query(playersRef, where('matchId', '==', match.matchId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${deletePromises.length} players`);
      
      // Delete match from Firestore
      await deleteDoc(doc(firestore, 'scheduledMatches', matchId));
      console.log('✅ Deleted match from Firestore');
      
      alert('Match deleted successfully from all locations!');
      loadMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match. Error: ' + error.message);
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setMatchForm({
      teamA: match.teamA,
      teamB: match.teamB,
      date: match.date,
      time: match.time,
      venue: match.venue,
      matchType: match.matchType || 'Knockout',
      gender: match.gender || 'Boys'
    });
    setShowScheduleForm(true);
  };

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map Excel data to players array - accept any number of players
        const uploadedPlayers = data
          .filter(row => row['Player Name'] && row['Player Name'].trim() !== '') // Only include rows with player names
          .map(row => ({
            jerseyNumber: row['Jersey Number']?.toString() || '',
            playerName: row['Player Name']?.trim() || '',
            team: row['Team']?.toString().toUpperCase() === 'B' ? 'B' : 'A'
          }));

        if (uploadedPlayers.length === 0) {
          alert('No valid player data found in Excel file. Please ensure the file has columns: "Jersey Number", "Player Name", and "Team".');
          return;
        }

        setPlayers(uploadedPlayers);
        alert(`Successfully loaded ${uploadedPlayers.length} players from Excel!\nTeam A: ${uploadedPlayers.filter(p => p.team === 'A').length} players\nTeam B: ${uploadedPlayers.filter(p => p.team === 'B').length} players`);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Failed to read Excel file. Please ensure it has columns: "Jersey Number", "Player Name", and "Team".');
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset file input
    e.target.value = '';
  };

  // Show login screen if not authenticated
  if (!authenticated) {
    return (
      <div className="scheduler-login-container">
        <motion.div 
          className="login-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="login-header">
            <Calendar size={48} />
            <h1>Match Scheduler</h1>
            <p>Enter password to access</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
              />
            </div>
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}
            <button type="submit" className="login-btn">
              Access Scheduler
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="scheduler-loading">
        <p>Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="match-scheduler-container">
      <div className="scheduler-header">
        <h1 className="scheduler-title">Match Scheduler</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#ef4444',
              border: '2px solid #ef4444',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Logout
          </button>
          <button 
          className="schedule-btn"
          onClick={() => {
            setShowScheduleForm(true);
            setEditingMatch(null);
            setMatchForm({ teamA: '', teamB: '', date: '', time: '', venue: '', matchType: 'Knockout', gender: 'Boys' });
          }}
        >
          <Plus size={20} />
          Schedule Match
        </button>
        </div>
      </div>

      {/* Scheduled Matches List */}
      <div className="matches-list">
        {matches.length === 0 ? (
          <div className="no-matches-scheduled">
            <Calendar size={48} />
            <p>No matches scheduled yet</p>
          </div>
        ) : (
          matches.map((match) => (
            <motion.div
              key={match.id}
              className="match-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="match-card-header">
                <div className="match-teams">
                  <span className="team-name">{match.teamA}</span>
                  <span className="vs">VS</span>
                  <span className="team-name">{match.teamB}</span>
                </div>
                <div className="match-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditMatch(match)}
                    title="Edit Match"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMatch(match.id)}
                    title="Delete Match"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="match-card-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{match.date} at {match.time}</span>
                </div>
                <div className="detail-item">
                  <span>📍 {match.venue}</span>
                </div>
                {(match.matchType || match.gender) && (
                  <div className="detail-item">
                    <span style={{ 
                      backgroundColor: match.matchType === 'Finals' ? '#ef4444' : match.matchType === 'Semi Final' ? '#f59e0b' : '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginRight: '0.5rem'
                    }}>
                      {match.matchType || 'Knockout'}
                    </span>
                    <span style={{ 
                      backgroundColor: match.gender === 'Girls' ? '#ec4899' : '#3b82f6',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {match.gender || 'Boys'}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="match-id">Match ID: {match.matchId}</span>
                </div>
              </div>
              <button
                className="add-players-btn"
                onClick={async () => {
                  setSelectedMatchForPlayers(match);
                  
                  // Check if players already exist
                  try {
                    const { firestore, collection, query, where, getDocs } = await getFirestoreUtils();
                    const playersRef = collection(firestore, 'players');
                    const q = query(playersRef, where('matchId', '==', match.matchId));
                    const snapshot = await getDocs(q);
                    
                    if (!snapshot.empty) {
                      // Players exist, load them
                      const existingPlayers = [];
                      snapshot.forEach(doc => {
                        existingPlayers.push(doc.data());
                      });
                      
                      setPlayers(existingPlayers);
                      setUploadedFileName('Players already added for this match');
                    } else {
                      // No players, reset
                      setPlayers([]);
                      setUploadedFileName('');
                    }
                  } catch (error) {
                    console.error('Error loading players:', error);
                  }
                  
                  setShowPlayerForm(true);
                }}
              >
                <Users size={18} />
                Add Players
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Schedule Match Modal */}
      <AnimatePresence>
        {showScheduleForm && (
          <div className="modal-overlay" onClick={() => setShowScheduleForm(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingMatch ? 'Edit Match' : 'Schedule New Match'}</h2>
                <button className="modal-close-btn" onClick={() => setShowScheduleForm(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleScheduleMatch} className="schedule-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Team A</label>
                    <input
                      type="text"
                      value={matchForm.teamA}
                      onChange={(e) => setMatchForm({ ...matchForm, teamA: e.target.value })}
                      required
                      placeholder="Enter Team A name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Team B</label>
                    <input
                      type="text"
                      value={matchForm.teamB}
                      onChange={(e) => setMatchForm({ ...matchForm, teamB: e.target.value })}
                      required
                      placeholder="Enter Team B name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={matchForm.date}
                      onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={matchForm.time}
                      onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    value={matchForm.venue}
                    onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                    required
                    placeholder="Enter venue"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Match Type</label>
                    <select
                      value={matchForm.matchType}
                      onChange={(e) => setMatchForm({ ...matchForm, matchType: e.target.value })}
                      required
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #374151',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Knockout">Knockout</option>
                      <option value="Semi Final">Semi Final</option>
                      <option value="Finals">Finals</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gender Category</label>
                    <select
                      value={matchForm.gender}
                      onChange={(e) => setMatchForm({ ...matchForm, gender: e.target.value })}
                      required
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #374151',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowScheduleForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingMatch ? 'Update Match' : 'Schedule Match'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Players Modal */}
      <AnimatePresence>
        {showPlayerForm && selectedMatchForPlayers && (
          <div className="modal-overlay" onClick={() => setShowPlayerForm(false)}>
            <motion.div
              className="modal-content players-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Add Players - {selectedMatchForPlayers.teamA} vs {selectedMatchForPlayers.teamB}</h2>
                <button className="modal-close-btn" onClick={() => setShowPlayerForm(false)}>
                  <X size={24} />
                </button>
              </div>
              
              {/* Excel Upload Section */}
              <div className="excel-upload-section">
                <label className="upload-excel-btn-large">
                  <Upload size={24} />
                  <span>Upload Excel File</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {uploadedFileName && (
                  <p className="uploaded-file-name">
                    📄 {uploadedFileName}
                  </p>
                )}
                <p className="excel-help-text">
                  Upload an Excel file with columns: <strong>Jersey Number</strong>, <strong>Player Name</strong>, <strong>Team</strong> (A or B)
                </p>
              </div>

              {/* Display Uploaded Players */}
              {players.length > 0 && (
                <form onSubmit={handleAddPlayers} className="players-form">
                  <div className="players-display-grid">
                    <div className="team-players-display">
                      <h3>Team A - {selectedMatchForPlayers.teamA}</h3>
                      <div className="players-count">
                        {players.filter(p => p.team === 'A').length} players
                      </div>
                      <div className="players-list-display">
                        {players.filter(p => p.team === 'A').map((player, index) => (
                          <div key={index} className="player-display-row">
                            <span className="player-jersey">#{player.jerseyNumber}</span>
                            <span className="player-name">{player.playerName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="team-players-display">
                      <h3>Team B - {selectedMatchForPlayers.teamB}</h3>
                      <div className="players-count">
                        {players.filter(p => p.team === 'B').length} players
                      </div>
                      <div className="players-list-display">
                        {players.filter(p => p.team === 'B').map((player, index) => (
                          <div key={index} className="player-display-row">
                            <span className="player-jersey">#{player.jerseyNumber}</span>
                            <span className="player-name">{player.playerName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="submit-btn">
                    Save {players.length} Players to Match
                  </button>
                </form>
              )}

              {players.length === 0 && (
                <div className="no-players-message">
                  <Users size={48} />
                  <p>No players uploaded yet</p>
                  <p className="hint">Upload an Excel file to add players</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchScheduler;
