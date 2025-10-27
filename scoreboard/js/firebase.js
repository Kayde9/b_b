// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getDatabase, ref, onValue, set, update, push } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY",
  authDomain: "internmimsbasketball.firebaseapp.com",
  databaseURL: "https://internmimsbasketball-default-rtdb.firebaseio.com",
  projectId: "internmimsbasketball",
  storageBucket: "internmimsbasketball.firebasestorage.app",
  messagingSenderId: "97822648007",
  appId: "1:97822648007:web:cfc93e3a6fb8233c6c40e2",
  measurementId: "G-KM2NGQ30TJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Database helper functions
class FirebaseService {
  // Get current match data
  static async getCurrentMatch() {
    const matchRef = ref(database, 'matches/current');
    return new Promise((resolve, reject) => {
      onValue(matchRef, (snapshot) => {
        resolve(snapshot.val());
      }, (error) => {
        reject(error);
      });
    });
  }

  // Listen to match updates in real-time
  static listenToMatch(callback) {
    const matchRef = ref(database, 'matches/current');
    return onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });
  }

  // Update team score
  static async updateScore(team, newScore) {
    const updates = {};
    updates[`matches/current/score${team.toUpperCase()}`] = newScore;
    updates[`matches/current/lastUpdated`] = Date.now();
    return update(ref(database), updates);
  }

  // Update timer
  static async updateTimer(timeString) {
    const updates = {};
    updates['matches/current/timer'] = timeString;
    updates['matches/current/lastUpdated'] = Date.now();
    return update(ref(database), updates);
  }

  // Update player fouls
  static async updatePlayerFouls(playerId, fouls) {
    const updates = {};
    updates[`matches/current/fouls/${playerId}`] = fouls;
    updates['matches/current/lastUpdated'] = Date.now();
    return update(ref(database), updates);
  }

  // Add player stats
  static async updatePlayerStats(playerId, points, fouls) {
    const updates = {};
    updates[`matches/current/players/${playerId}/points`] = points;
    updates[`matches/current/players/${playerId}/fouls`] = fouls;
    updates['matches/current/lastUpdated'] = Date.now();
    return update(ref(database), updates);
  }

  // Update player score and automatically update team total
  static async updatePlayerScoreAndTeam(playerId, newPlayerPoints, newPlayerFouls, team) {
    try {
      // Get current match data
      const matchRef = ref(database, 'matches/current');
      return new Promise((resolve, reject) => {
        onValue(matchRef, async (snapshot) => {
          const currentMatch = snapshot.val();
          if (!currentMatch) {
            reject(new Error('No current match found'));
            return;
          }

          // Calculate new team total by summing all players' points
          let teamTotal = 0;
          const players = currentMatch.players || {};
          
          for (const [id, player] of Object.entries(players)) {
            if (player.team === team) {
              if (id === playerId) {
                // Use new points for the updated player
                teamTotal += newPlayerPoints;
              } else {
                // Use existing points for other players
                teamTotal += (player.points || 0);
              }
            }
          }

          // Prepare updates
          const updates = {};
          updates[`matches/current/players/${playerId}/points`] = newPlayerPoints;
          updates[`matches/current/players/${playerId}/fouls`] = newPlayerFouls;
          updates[`matches/current/score${team.toUpperCase()}`] = teamTotal;
          updates['matches/current/lastUpdated'] = Date.now();

          // Execute updates
          await update(ref(database), updates);
          resolve({ playerPoints: newPlayerPoints, teamTotal: teamTotal });
        }, { once: true });
      });
    } catch (error) {
      throw error;
    }
  }

  // Initialize new match
  static async initializeMatch(teamA, teamB) {
    const matchData = {
      teamA: teamA || 'Team A',
      teamB: teamB || 'Team B',
      scoreA: 0,
      scoreB: 0,
      timer: "12:00",
      isRunning: false,
      quarter: 1,
      fouls: {},
      players: {},
      lastUpdated: Date.now(),
      createdAt: Date.now()
    };
    console.log('Initializing match with data:', matchData);
    return set(ref(database, 'matches/current'), matchData);
  }

  // Update game state
  static async updateGameState(isRunning) {
    const updates = {};
    updates['matches/current/isRunning'] = isRunning;
    updates['matches/current/lastUpdated'] = Date.now();
    return update(ref(database), updates);
  }

  // Authentication functions
  static async signInWithGoogle() {
    try {
      console.log('Attempting Google sign-in...');
      
      // Configure the provider with additional settings
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters
      provider.setCustomParameters({
        'prompt': 'select_account'
      });
      
      console.log('Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Detailed sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked! Please allow popups for this site and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
      } else {
        alert(`Authentication failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }
}

// Export for use in other files
window.FirebaseService = FirebaseService;
window.database = database;
window.auth = auth;

// Initialize with default match if none exists
FirebaseService.getCurrentMatch().then(data => {
  if (!data) {
    console.log('No current match found, initializing default match...');
    FirebaseService.initializeMatch('NMIMS Mumbai', 'NMIMS Hyderabad');
  }
}).catch(error => {
  console.error('Error checking current match:', error);
});