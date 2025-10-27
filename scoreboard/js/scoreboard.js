// Scoreboard JavaScript - Handles real-time display of match data
let matchData = null;
let updateInterval = null;

// DOM Elements
const gameTimer = document.getElementById('game-timer');
const scoreA = document.getElementById('score-a');
const scoreB = document.getElementById('score-b');
const teamAName = document.getElementById('team-a-name');
const teamBName = document.getElementById('team-b-name');
const matchTitle = document.getElementById('match-title');
const matchQuarter = document.getElementById('match-quarter');
const matchStatus = document.getElementById('match-status');
const timerStatus = document.getElementById('timer-status');
const teamAPlayers = document.getElementById('team-a-players');
const teamBPlayers = document.getElementById('team-b-players');
const teamAPlayersTitle = document.getElementById('team-a-players-title');
const teamBPlayersTitle = document.getElementById('team-b-players-title');
const liveUpdates = document.getElementById('live-updates');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize scoreboard
async function initializeScoreboard() {
    try {
        console.log('Initializing scoreboard...');
        
        // Wait for Firebase to be ready
        await waitForFirebase();
        
        // Initialize default match if none exists
        try {
            await window.FirebaseService.initializeMatch('NMIMS Mumbai', 'NMIMS Hyderabad');
            console.log('Default match initialized');
        } catch (error) {
            console.log('Match may already exist:', error.message);
        }
        
        // Start listening to match data
        window.FirebaseService.listenToMatch((data) => {
            console.log('Received match data:', data);
            if (data) {
                updateScoreboard(data);
            } else {
                console.log('No match data available');
                displayNoMatchMessage();
            }
        });
        
        // Hide loading overlay after 3 seconds
        setTimeout(() => {
            hideLoading();
        }, 3000);
        
    } catch (error) {
        console.error('Error initializing scoreboard:', error);
        hideLoading();
        showError('Failed to connect to live data');
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

// Update scoreboard with match data
function updateScoreboard(data) {
    console.log('Updating scoreboard with data:', data);
    
    const previousData = matchData;
    matchData = data;
    
    // Update basic match info
    if (teamAName && data.teamA) teamAName.textContent = data.teamA;
    if (teamBName && data.teamB) teamBName.textContent = data.teamB;
    
    // Update scores with animation
    updateScore('A', data.scoreA || 0, previousData?.scoreA);
    updateScore('B', data.scoreB || 0, previousData?.scoreB);
    
    // Update timer
    if (gameTimer && data.timer) {
        gameTimer.textContent = data.timer;
    }
    
    // Update quarter
    if (matchQuarter && data.quarter) {
        matchQuarter.textContent = `Quarter ${data.quarter}`;
    }
    
    // Update match status
    updateMatchStatus(data.isRunning);
    
    // Update timer status
    updateTimerStatus(data.isRunning);
    
    // Update player stats
    updatePlayerStats(data.players);
    
    // Update player titles
    updatePlayerTitles(data.teamA, data.teamB);
    
    // Add live update
    addLiveUpdate(data, previousData);
}

// Update individual score with animation
function updateScore(team, newScore, previousScore) {
    const scoreElement = team === 'A' ? scoreA : scoreB;
    if (!scoreElement) return;
    
    // Check if score changed
    if (previousScore !== undefined && newScore !== previousScore) {
        // Add flash animation
        scoreElement.classList.add('score-updated');
        setTimeout(() => {
            scoreElement.classList.remove('score-updated');
        }, 1500);
        
        // Add basketball bounce animation to VS separator
        const basketballIcon = document.querySelector('.animate-pulse');
        if (basketballIcon) {
            basketballIcon.classList.add('animate-bounce-basketball');
            setTimeout(() => {
                basketballIcon.classList.remove('animate-bounce-basketball');
            }, 1000);
        }
    }
    
    scoreElement.textContent = newScore;
}

// Update match status indicator
function updateMatchStatus(isRunning) {
    if (!matchStatus) return;
    
    if (isRunning) {
        matchStatus.textContent = '● LIVE';
        matchStatus.className = 'text-lg font-semibold text-green-400';
    } else {
        matchStatus.textContent = '⏸ PAUSED';
        matchStatus.className = 'text-lg font-semibold text-yellow-400';
    }
}

// Update timer status
function updateTimerStatus(isRunning) {
    if (!timerStatus) return;
    
    if (isRunning) {
        timerStatus.textContent = 'Game Time - Running';
        timerStatus.className = 'text-lg text-green-400';
    } else {
        timerStatus.textContent = 'Game Time - Paused';
        timerStatus.className = 'text-lg text-gray-300';
    }
}

// Update player statistics
function updatePlayerStats(players) {
    if (!players) return;
    
    // Update Team A players
    updateTeamPlayers('A', players);
    
    // Update Team B players  
    updateTeamPlayers('B', players);
}

// Update players for a specific team
function updateTeamPlayers(team, players) {
    const container = team === 'A' ? teamAPlayers : teamBPlayers;
    if (!container) return;
    
    // Filter players by team
    const teamPlayers = Object.entries(players || {}).filter(([id, player]) => 
        player.team === team
    );
    
    if (teamPlayers.length === 0) {
        container.innerHTML = `
            <div class="flex justify-between items-center bg-gray-800/50 rounded-lg p-3">
                <span class="font-medium text-gray-400">No players added yet</span>
                <div class="flex space-x-4">
                    <span class="text-basketball-orange">0 pts</span>
                    <span class="text-red-400">0 fouls</span>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = teamPlayers.map(([id, player]) => `
        <div class="flex justify-between items-center bg-gray-800/50 rounded-lg p-3">
            <span class="font-medium">${player.name || 'Player'}</span>
            <div class="flex space-x-4">
                <span class="text-basketball-orange">${player.points || 0} pts</span>
                <span class="text-red-400">${player.fouls || 0} fouls</span>
            </div>
        </div>
    `).join('');
}

// Update player section titles
function updatePlayerTitles(teamANameStr, teamBNameStr) {
    if (teamAPlayersTitle && teamANameStr) {
        teamAPlayersTitle.textContent = `${teamANameStr} Players`;
    }
    if (teamBPlayersTitle && teamBNameStr) {
        teamBPlayersTitle.textContent = `${teamBNameStr} Players`;
    }
}

// Add live update message
function addLiveUpdate(currentData, previousData) {
    if (!liveUpdates || !previousData) return;
    
    const updates = [];
    
    // Check for score changes
    if (currentData.scoreA !== previousData.scoreA) {
        const diff = currentData.scoreA - previousData.scoreA;
        updates.push(`${currentData.teamA} scored ${diff} point${diff > 1 ? 's' : ''}!`);
    }
    
    if (currentData.scoreB !== previousData.scoreB) {
        const diff = currentData.scoreB - previousData.scoreB;
        updates.push(`${currentData.teamB} scored ${diff} point${diff > 1 ? 's' : ''}!`);
    }
    
    // Check for timer changes
    if (currentData.isRunning !== previousData.isRunning) {
        updates.push(currentData.isRunning ? 'Game resumed' : 'Game paused');
    }
    
    // Add updates to the feed
    updates.forEach(update => {
        const updateElement = document.createElement('div');
        updateElement.className = 'text-gray-300 text-sm bg-gray-800/30 rounded p-2 animate-fade-in';
        updateElement.innerHTML = `
            <span class="text-basketball-orange">${new Date().toLocaleTimeString()}</span> - ${update}
        `;
        
        liveUpdates.insertBefore(updateElement, liveUpdates.firstChild);
        
        // Remove old updates (keep only last 10)
        while (liveUpdates.children.length > 10) {
            liveUpdates.removeChild(liveUpdates.lastChild);
        }
    });
}

// Display no match message
function displayNoMatchMessage() {
    if (matchTitle) matchTitle.textContent = 'No Active Match';
    if (gameTimer) gameTimer.textContent = '--:--';
    if (scoreA) scoreA.textContent = '-';
    if (scoreB) scoreB.textContent = '-';
    if (teamAName) teamAName.textContent = 'Team A';
    if (teamBName) teamBName.textContent = 'Team B';
    if (matchStatus) {
        matchStatus.textContent = '● Waiting';
        matchStatus.className = 'text-lg font-semibold text-gray-400';
    }
}

// Hide loading overlay
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    console.error(message);
    
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    errorOverlay.innerHTML = `
        <div class="text-center text-white p-8">
            <div class="text-6xl mb-4">⚠️</div>
            <div class="text-xl font-bold text-red-400 mb-2">${message}</div>
            <div class="text-gray-400">Please check your connection and try again</div>
            <button onclick="location.reload()" class="mt-4 bg-basketball-orange hover:bg-basketball-dark-orange text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Retry
            </button>
        </div>
    `;
    
    document.body.appendChild(errorOverlay);
}

// Format time display
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Add CSS animation classes
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
        animation: fade-in 0.5s ease-out;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScoreboard);
} else {
    initializeScoreboard();
}

// Handle page visibility changes to maintain connection
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible, refresh connection
        console.log('Page visible, refreshing connection...');
        // The Firebase listener should automatically reconnect
    }
});

// Export for debugging
window.ScoreboardApp = {
    matchData,
    updateScoreboard,
    formatTime
};