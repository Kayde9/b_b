// Admin Panel JavaScript - Handles scoring controls and match management
let currentMatch = null;
let gameTimer = null;
let timerInterval = null;
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('auth-modal');
const googleSigninBtn = document.getElementById('google-signin');
const signOutBtn = document.getElementById('sign-out');
const userNameEl = document.getElementById('user-name');

// Match setup elements
const teamAInput = document.getElementById('team-a-input');
const teamBInput = document.getElementById('team-b-input');
const updateTeamsBtn = document.getElementById('update-teams');

// Current match display elements
const currentTeamA = document.getElementById('current-team-a');
const currentTeamB = document.getElementById('current-team-b');
const currentScoreA = document.getElementById('current-score-a');
const currentScoreB = document.getElementById('current-score-b');
const currentTimer = document.getElementById('current-timer');
const currentQuarter = document.getElementById('current-quarter');

// Scoring buttons
const teamAButtons = {
    plus1: document.getElementById('team-a-plus-1'),
    plus2: document.getElementById('team-a-plus-2'),
    plus3: document.getElementById('team-a-plus-3'),
    minus1: document.getElementById('team-a-minus-1'),
    reset: document.getElementById('team-a-reset')
};

const teamBButtons = {
    plus1: document.getElementById('team-b-plus-1'),
    plus2: document.getElementById('team-b-plus-2'),
    plus3: document.getElementById('team-b-plus-3'),
    minus1: document.getElementById('team-b-minus-1'),
    reset: document.getElementById('team-b-reset')
};

// Timer control elements
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const nextQuarterBtn = document.getElementById('next-quarter');
const timerMinutes = document.getElementById('timer-minutes');
const timerSeconds = document.getElementById('timer-seconds');
const setTimerBtn = document.getElementById('set-timer');

// Player management elements
const teamAPlayerList = document.getElementById('team-a-player-list');
const teamBPlayerList = document.getElementById('team-b-player-list');
const newPlayerAInput = document.getElementById('new-player-a');
const newPlayerBInput = document.getElementById('new-player-b');
const addPlayerABtn = document.getElementById('add-player-a');
const addPlayerBBtn = document.getElementById('add-player-b');
const teamAPlayersTitle = document.getElementById('team-a-players-title');
const teamBPlayersTitle = document.getElementById('team-b-players-title');

// Quick actions
const newMatchBtn = document.getElementById('new-match');
const endMatchBtn = document.getElementById('end-match');
const exportDataBtn = document.getElementById('export-data');

// Status message
const statusMessage = document.getElementById('status-message');
const statusText = document.getElementById('status-text');

// Initialize admin panel
async function initializeAdmin() {
    try {
        console.log('Initializing admin panel...');
        
        // Wait for Firebase to be ready
        await waitForFirebase();
        
        // Setup authentication
        setupAuthentication();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load current match data
        loadCurrentMatch();
        
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showStatus('Failed to initialize admin panel', 'error');
    }
}

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        const checkFirebase = () => {
            if (window.FirebaseService) {
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
        
        // Timeout after 10 seconds
        setTimeout(() => {
            reject(new Error('Firebase loading timeout'));
        }, 10000);
    });
}

// Setup authentication
function setupAuthentication() {
    // Check authentication state
    console.log('Setting up authentication state listener...');
    window.FirebaseService.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user);
        currentUser = user;
        if (user) {
            // User is signed in
            console.log('User signed in:', user.displayName || user.email);
            userNameEl.textContent = user.displayName || user.email;
            authModal.style.display = 'none';
            showStatus('Authentication successful!', 'success');
        } else {
            // User is signed out
            console.log('User signed out');
            authModal.style.display = 'flex';
        }
    });
    
    // Google sign-in
    googleSigninBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Google sign-in button clicked');
        
        try {
            // Show loading state
            googleSigninBtn.disabled = true;
            googleSigninBtn.textContent = 'Signing in...';
            
            console.log('Calling FirebaseService.signInWithGoogle...');
            await window.FirebaseService.signInWithGoogle();
            showStatus('Successfully signed in!', 'success');
            
        } catch (error) {
            console.error('Sign in error:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Failed to sign in';
            if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup blocked. Please allow popups and try again.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.message) {
                errorMessage = `Sign in failed: ${error.message}`;
            }
            
            showStatus(errorMessage, 'error');
        } finally {
            // Reset button state
            googleSigninBtn.disabled = false;
            googleSigninBtn.textContent = 'Sign in with Google';
        }
    });
    
    // Sign out
    signOutBtn.addEventListener('click', async () => {
        try {
            await window.FirebaseService.signOut();
            showStatus('Successfully signed out', 'success');
        } catch (error) {
            console.error('Sign out error:', error);
            showStatus('Failed to sign out', 'error');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Team setup
    updateTeamsBtn.addEventListener('click', updateTeamNames);
    
    // Scoring buttons - Team A
    teamAButtons.plus1.addEventListener('click', () => addScore('A', 1));
    teamAButtons.plus2.addEventListener('click', () => addScore('A', 2));
    teamAButtons.plus3.addEventListener('click', () => addScore('A', 3));
    teamAButtons.minus1.addEventListener('click', () => addScore('A', -1));
    teamAButtons.reset.addEventListener('click', () => resetScore('A'));
    
    // Scoring buttons - Team B
    teamBButtons.plus1.addEventListener('click', () => addScore('B', 1));
    teamBButtons.plus2.addEventListener('click', () => addScore('B', 2));
    teamBButtons.plus3.addEventListener('click', () => addScore('B', 3));
    teamBButtons.minus1.addEventListener('click', () => addScore('B', -1));
    teamBButtons.reset.addEventListener('click', () => resetScore('B'));
    
    // Timer controls
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    nextQuarterBtn.addEventListener('click', nextQuarter);
    setTimerBtn.addEventListener('click', setCustomTimer);
    
    // Player management
    addPlayerABtn.addEventListener('click', () => addPlayer('A'));
    addPlayerBBtn.addEventListener('click', () => addPlayer('B'));
    
    // Quick actions
    newMatchBtn.addEventListener('click', createNewMatch);
    endMatchBtn.addEventListener('click', endMatch);
    exportDataBtn.addEventListener('click', exportMatchData);
    
    // Enter key handlers
    teamAInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateTeamNames();
    });
    teamBInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateTeamNames();
    });
    newPlayerAInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer('A');
    });
    newPlayerBInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer('B');
    });
}

// Load current match data
function loadCurrentMatch() {
    window.FirebaseService.listenToMatch((data) => {
        if (data) {
            currentMatch = data;
            updateAdminDisplay(data);
        }
    });
}

// Update admin panel display
function updateAdminDisplay(data) {
    const previousData = currentMatch;
    
    // Update team names
    currentTeamA.textContent = data.teamA || 'Team A';
    currentTeamB.textContent = data.teamB || 'Team B';
    
    // Update scores with animation
    if (previousData) {
        updateTeamScoreDisplay('A', data.scoreA || 0, previousData.scoreA || 0);
        updateTeamScoreDisplay('B', data.scoreB || 0, previousData.scoreB || 0);
    } else {
        currentScoreA.textContent = data.scoreA || 0;
        currentScoreB.textContent = data.scoreB || 0;
    }
    
    // Update timer
    currentTimer.textContent = data.timer || '12:00';
    
    // Update quarter
    currentQuarter.textContent = data.quarter || 1;
    
    // Update input fields
    teamAInput.value = data.teamA || '';
    teamBInput.value = data.teamB || '';
    
    // Update scoring button titles
    updateScoringTitles(data.teamA, data.teamB);
    
    // Update player lists
    updatePlayerLists(data.players);
    
    // Update player management titles
    updatePlayerManagementTitles(data.teamA, data.teamB);
}

// Update team names
async function updateTeamNames() {
    if (!currentUser) return;
    
    try {
        const teamA = teamAInput.value.trim() || 'Team A';
        const teamB = teamBInput.value.trim() || 'Team B';
        
        await window.FirebaseService.initializeMatch(teamA, teamB);
        showStatus('Team names updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating team names:', error);
        showStatus('Failed to update team names', 'error');
    }
}

// Add score to team
async function addScore(team, points) {
    if (!currentUser || !currentMatch) return;
    
    try {
        const currentScore = team === 'A' ? (currentMatch.scoreA || 0) : (currentMatch.scoreB || 0);
        const newScore = Math.max(0, currentScore + points); // Prevent negative scores
        
        await window.FirebaseService.updateScore(team, newScore);
        
        const action = points > 0 ? 'added' : 'removed';
        const teamName = team === 'A' ? currentMatch.teamA : currentMatch.teamB;
        showStatus(`${Math.abs(points)} point${Math.abs(points) > 1 ? 's' : ''} ${action} for ${teamName}`, 'success');
    } catch (error) {
        console.error('Error updating score:', error);
        showStatus('Failed to update score', 'error');
    }
}

// Reset team score
async function resetScore(team) {
    if (!currentUser) return;
    
    if (confirm(`Are you sure you want to reset ${team === 'A' ? 'Team A' : 'Team B'} score to 0?`)) {
        try {
            await window.FirebaseService.updateScore(team, 0);
            const teamName = team === 'A' ? currentMatch.teamA : currentMatch.teamB;
            showStatus(`${teamName} score reset to 0`, 'success');
        } catch (error) {
            console.error('Error resetting score:', error);
            showStatus('Failed to reset score', 'error');
        }
    }
}

// Timer functions
async function startTimer() {
    if (!currentUser || !currentMatch) {
        showStatus('Please sign in and set up a match first', 'warning');
        return;
    }
    
    try {
        console.log('Starting timer...');
        
        // Update Firebase state
        await window.FirebaseService.updateGameState(true);
        
        // Update local state
        currentMatch.isRunning = true;
        
        // Clear any existing interval
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Start new timer interval
        timerInterval = setInterval(updateTimer, 1000);
        
        showStatus('⏱️ Timer started!', 'success');
        console.log('Timer started successfully');
        
    } catch (error) {
        console.error('Error starting timer:', error);
        showStatus('Failed to start timer: ' + error.message, 'error');
    }
}

async function pauseTimer() {
    if (!currentUser || !currentMatch) return;
    
    try {
        console.log('Pausing timer...');
        
        // Update Firebase state
        await window.FirebaseService.updateGameState(false);
        
        // Update local state
        currentMatch.isRunning = false;
        
        // Clear interval
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        showStatus('⏸️ Timer paused', 'success');
        console.log('Timer paused successfully');
    } catch (error) {
        console.error('Error pausing timer:', error);
        showStatus('Failed to pause timer: ' + error.message, 'error');
    }
}

async function resetTimer() {
    if (!currentUser || !currentMatch) return;
    
    try {
        console.log('Resetting timer...');
        
        // Clear interval first
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Update Firebase
        await window.FirebaseService.updateTimer('12:00');
        await window.FirebaseService.updateGameState(false);
        
        // Update local state
        currentMatch.timer = '12:00';
        currentMatch.isRunning = false;
        
        // Update display immediately
        if (currentTimer) {
            currentTimer.textContent = '12:00';
        }
        
        showStatus('🔄 Timer reset to 12:00', 'success');
        console.log('Timer reset successfully');
    } catch (error) {
        console.error('Error resetting timer:', error);
        showStatus('Failed to reset timer: ' + error.message, 'error');
    }
}

async function setCustomTimer() {
    if (!currentUser || !currentMatch) return;
    
    try {
        const minutes = Math.max(0, Math.min(99, parseInt(timerMinutes.value) || 0));
        const seconds = Math.max(0, Math.min(59, parseInt(timerSeconds.value) || 0));
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        console.log('Setting custom timer to:', timeString);
        
        // Stop current timer if running
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Update Firebase
        await window.FirebaseService.updateTimer(timeString);
        await window.FirebaseService.updateGameState(false);
        
        // Update local state
        currentMatch.timer = timeString;
        currentMatch.isRunning = false;
        
        // Update display immediately
        if (currentTimer) {
            currentTimer.textContent = timeString;
        }
        
        showStatus(`⏰ Timer set to ${timeString}`, 'success');
        console.log('Custom timer set successfully');
    } catch (error) {
        console.error('Error setting timer:', error);
        showStatus('Failed to set timer: ' + error.message, 'error');
    }
}

async function nextQuarter() {
    if (!currentUser || !currentMatch) return;
    
    try {
        const newQuarter = Math.min(4, (currentMatch.quarter || 1) + 1);
        
        const updates = {};
        updates['matches/current/quarter'] = newQuarter;
        updates['matches/current/timer'] = '12:00';
        updates['matches/current/isRunning'] = false;
        updates['matches/current/lastUpdated'] = Date.now();
        
        // Update using Firebase reference
        const { update, ref } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js');
        await update(ref(window.database), updates);
        
        // Update local match data
        currentMatch.quarter = newQuarter;
        currentMatch.timer = '12:00';
        currentMatch.isRunning = false;
        
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        showStatus(`Advanced to Quarter ${newQuarter}`, 'success');
    } catch (error) {
        console.error('Error advancing quarter:', error);
        showStatus('Failed to advance quarter', 'error');
    }
}

  // Update timer (called by interval)
async function updateTimer() {
    console.log('updateTimer called, currentMatch:', currentMatch);
    
    if (!currentMatch) {
        console.log('No current match, stopping timer');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        return;
    }
    
    if (!currentMatch.isRunning) {
        console.log('Timer not running, skipping update');
        return;
    }
    
    try {
        const timerStr = currentMatch.timer || '12:00';
        console.log('Current timer string:', timerStr);
        
        const [minutes, seconds] = timerStr.split(':').map(Number);
        let totalSeconds = minutes * 60 + seconds;
        
        console.log('Total seconds:', totalSeconds);
        
        if (totalSeconds > 0) {
            totalSeconds--;
            const newMinutes = Math.floor(totalSeconds / 60);
            const newSeconds = totalSeconds % 60;
            const timeString = `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
            
            console.log('New time string:', timeString);
            
            // Update local match data immediately for UI responsiveness
            currentMatch.timer = timeString;
            
            // Update display immediately
            if (currentTimer) {
                currentTimer.textContent = timeString;
            }
            
            // Update Firebase
            try {
                await window.FirebaseService.updateTimer(timeString);
                console.log('Firebase timer updated successfully');
            } catch (fbError) {
                console.error('Firebase timer update failed:', fbError);
                // Continue running locally even if Firebase fails
            }
            
            if (totalSeconds === 0) {
                // Time's up
                console.log('Time is up!');
                await window.FirebaseService.updateGameState(false);
                currentMatch.isRunning = false;
                clearInterval(timerInterval);
                timerInterval = null;
                showStatus('🔔 Time\'s up! Quarter ended.', 'warning');
            }
        }
    } catch (error) {
        console.error('Error updating timer:', error);
        showStatus('Timer update error: ' + error.message, 'error');
    }
}// Player management functions
async function addPlayer(team) {
    if (!currentUser) return;
    
    try {
        const input = team === 'A' ? newPlayerAInput : newPlayerBInput;
        const playerName = input.value.trim();
        
        if (!playerName) {
            showStatus('Please enter a player name', 'warning');
            return;
        }
        
        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const playerData = {
            name: playerName,
            team: team,
            points: 0,
            fouls: 0
        };
        
        // Update player object structure using Firebase imports
        const { update, ref } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js');
        const updates = {};
        updates[`matches/current/players/${playerId}`] = playerData;
        updates['matches/current/lastUpdated'] = Date.now();
        
        await update(ref(window.database), updates);
        
        // Update local match data
        if (!currentMatch.players) currentMatch.players = {};
        currentMatch.players[playerId] = playerData;
        
        input.value = '';
        showStatus(`Player ${playerName} added to Team ${team}`, 'success');
        
        // Refresh player display
        updatePlayerLists(currentMatch.players);
    } catch (error) {
        console.error('Error adding player:', error);
        showStatus('Failed to add player', 'error');
    }
}

// Update player lists in admin panel
function updatePlayerLists(players) {
    if (!players) return;
    
    updateTeamPlayerList('A', players);
    updateTeamPlayerList('B', players);
}

function updateTeamPlayerList(team, players) {
    const container = team === 'A' ? teamAPlayerList : teamBPlayerList;
    if (!container) return;
    
    const teamPlayers = Object.entries(players || {}).filter(([id, player]) => 
        player.team === team
    );
    
    if (teamPlayers.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm">No players added yet</div>';
        return;
    }
    
    container.innerHTML = teamPlayers.map(([id, player]) => {
        const foulStatus = (player.fouls || 0) >= 5 ? 'fouled-out' : '';
        const foulClass = (player.fouls || 0) >= 5 ? 'text-red-600 font-bold' : 'text-red-400';
        
        return `
        <div class="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 ${foulStatus ? 'opacity-60' : ''}">
            <span class="font-medium ${foulStatus ? 'line-through' : ''}">${player.name}</span>
            <div class="flex items-center space-x-2">
                <button onclick="addPlayerPoints('${id}', 1)" 
                        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        ${foulStatus ? 'disabled' : ''}>
                    +1
                </button>
                <button onclick="addPlayerPoints('${id}', 2)" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        ${foulStatus ? 'disabled' : ''}>
                    +2
                </button>
                <button onclick="addPlayerPoints('${id}', 3)" 
                        class="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        ${foulStatus ? 'disabled' : ''}>
                    +3
                </button>
                <button onclick="addPlayerFoul('${id}')" 
                        class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors">
                    +Foul
                </button>
                <span class="text-basketball-orange text-sm font-semibold">${player.points || 0}pts</span>
                <span class="${foulClass} text-sm">${player.fouls || 0}f</span>
                <button onclick="removePlayer('${id}')" 
                        class="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors">
                    ×
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Enhanced player scoring functions that automatically update team totals
window.addPlayerPoints = async function(playerId, pointsToAdd) {
    if (!currentUser || !currentMatch) return;
    
    try {
        const player = currentMatch.players[playerId];
        if (!player) {
            showStatus('Player not found', 'error');
            return;
        }

        const currentPoints = player.points || 0;
        const currentFouls = player.fouls || 0;
        const newPoints = Math.max(0, currentPoints + pointsToAdd);
        
        // Use enhanced Firebase function to update both player and team
        const result = await window.FirebaseService.updatePlayerScoreAndTeam(
            playerId, 
            newPoints, 
            currentFouls, 
            player.team
        );
        
        // Update local data
        currentMatch.players[playerId].points = newPoints;
        if (player.team === 'A') {
            currentMatch.scoreA = result.teamTotal;
        } else {
            currentMatch.scoreB = result.teamTotal;
        }
        
        // Show success with details
        const playerName = player.name || 'Player';
        const teamName = player.team === 'A' ? currentMatch.teamA : currentMatch.teamB;
        showStatus(`${playerName} scored ${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''}! ${teamName}: ${result.teamTotal}`, 'success');
        
        // Add basketball bounce animation
        addBasketballAnimation();
        
    } catch (error) {
        console.error('Error adding player points:', error);
        showStatus('Failed to update player score', 'error');
    }
};

window.addPlayerFoul = async function(playerId) {
    if (!currentUser || !currentMatch) return;
    
    try {
        const player = currentMatch.players[playerId];
        if (!player) {
            showStatus('Player not found', 'error');
            return;
        }

        const currentPoints = player.points || 0;
        const currentFouls = player.fouls || 0;
        const newFouls = currentFouls + 1;
        
        // Update player fouls (no team score change for fouls)
        const { update, ref } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js');
        const updates = {};
        updates[`matches/current/players/${playerId}/fouls`] = newFouls;
        updates['matches/current/lastUpdated'] = Date.now();
        
        await update(ref(window.database), updates);
        
        // Update local data
        currentMatch.players[playerId].fouls = newFouls;
        
        // Show warning if player has too many fouls
        const playerName = player.name || 'Player';
        if (newFouls >= 5) {
            showStatus(`⚠️ ${playerName} has ${newFouls} fouls - FOULED OUT!`, 'warning');
        } else {
            showStatus(`${playerName} committed a foul (${newFouls}/5)`, 'warning');
        }
        
    } catch (error) {
        console.error('Error adding player foul:', error);
        showStatus('Failed to update player foul', 'error');
    }
};

// Legacy functions for backward compatibility (now call enhanced versions)
window.updatePlayerPoints = async function(playerId, newPoints) {
    if (!currentUser || !currentMatch) return;
    
    const player = currentMatch.players[playerId];
    if (!player) return;
    
    const currentPoints = player.points || 0;
    const pointsToAdd = newPoints - currentPoints;
    
    if (pointsToAdd !== 0) {
        await window.addPlayerPoints(playerId, pointsToAdd);
    }
};

window.updatePlayerFouls = async function(playerId, newFouls) {
    if (!currentUser || !currentMatch) return;
    
    const player = currentMatch.players[playerId];
    if (!player) return;
    
    const currentFouls = player.fouls || 0;
    const foulsToAdd = newFouls - currentFouls;
    
    for (let i = 0; i < foulsToAdd; i++) {
        await window.addPlayerFoul(playerId);
    }
};

window.removePlayer = async function(playerId) {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to remove this player?')) {
        try {
            const { update, ref } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js');
            const updates = {};
            updates[`matches/current/players/${playerId}`] = null;
            updates['matches/current/lastUpdated'] = Date.now();
            
            await update(ref(window.database), updates);
            
            // Update local data
            if (currentMatch.players && currentMatch.players[playerId]) {
                delete currentMatch.players[playerId];
            }
            
            showStatus('Player removed', 'success');
            
            // Refresh player display
            updatePlayerLists(currentMatch.players);
        } catch (error) {
            console.error('Error removing player:', error);
            showStatus('Failed to remove player', 'error');
        }
    }
};

// Update scoring button titles
function updateScoringTitles(teamA, teamB) {
    const teamATitleEl = document.getElementById('team-a-title');
    const teamBTitleEl = document.getElementById('team-b-title');
    
    if (teamATitleEl) teamATitleEl.textContent = `${teamA || 'Team A'} Scoring`;
    if (teamBTitleEl) teamBTitleEl.textContent = `${teamB || 'Team B'} Scoring`;
}

// Update player management titles
function updatePlayerManagementTitles(teamA, teamB) {
    if (teamAPlayersTitle) teamAPlayersTitle.textContent = `${teamA || 'Team A'} Players`;
    if (teamBPlayersTitle) teamBPlayersTitle.textContent = `${teamB || 'Team B'} Players`;
}

// Quick actions
async function createNewMatch() {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to create a new match? This will reset all current data.')) {
        try {
            await window.FirebaseService.initializeMatch('Team A', 'Team B');
            teamAInput.value = '';
            teamBInput.value = '';
            showStatus('New match created successfully!', 'success');
        } catch (error) {
            console.error('Error creating new match:', error);
            showStatus('Failed to create new match', 'error');
        }
    }
}

async function endMatch() {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to end the current match?')) {
        try {
            await window.FirebaseService.updateGameState(false);
            
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            showStatus('Match ended', 'success');
        } catch (error) {
            console.error('Error ending match:', error);
            showStatus('Failed to end match', 'error');
        }
    }
}

function exportMatchData() {
    if (!currentMatch) {
        showStatus('No match data to export', 'error');
        return;
    }
    
    try {
        const dataStr = JSON.stringify(currentMatch, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `match_data_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showStatus('Match data exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showStatus('Failed to export match data', 'error');
    }
}

// Show status message with enhanced feedback
function showStatus(message, type = 'info') {
    statusText.textContent = message;
    
    // Set color based on type
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-basketball-orange'
    };
    
    // Add basketball icon for scoring success
    const icon = type === 'success' && message.includes('scored') ? '🏀 ' : '';
    
    statusMessage.className = `fixed bottom-4 right-4 z-50`;
    statusMessage.innerHTML = `
        <div class="${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300">
            <div class="font-medium">${icon}${message}</div>
        </div>
    `;
    
    statusMessage.classList.remove('hidden');
    
    // Add bounce animation for success
    if (type === 'success') {
        statusMessage.classList.add('animate-bounce');
        setTimeout(() => {
            statusMessage.classList.remove('animate-bounce');
        }, 1000);
    }
    
    // Hide after 4 seconds (longer for better visibility)
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 4000);
}

// Add basketball animation for scoring
function addBasketballAnimation() {
    // Find basketball icon in the interface
    const basketballIcons = document.querySelectorAll('.animate-pulse');
    basketballIcons.forEach(icon => {
        icon.classList.add('animate-bounce-basketball');
        setTimeout(() => {
            icon.classList.remove('animate-bounce-basketball');
        }, 1200);
    });
}

// Enhanced team score display with animations
function updateTeamScoreDisplay(team, newScore, oldScore) {
    const scoreElement = team === 'A' ? currentScoreA : currentScoreB;
    if (!scoreElement) return;
    
    // Add flash animation if score increased
    if (newScore > oldScore) {
        scoreElement.classList.add('score-flash');
        setTimeout(() => {
            scoreElement.classList.remove('score-flash');
        }, 1000);
    }
    
    scoreElement.textContent = newScore;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
    initializeAdmin();
}

// Handle page unload - cleanup timer
window.addEventListener('beforeunload', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});

// Export for debugging
window.AdminApp = {
    currentMatch,
    addScore,
    showStatus,
    updateTimer
};