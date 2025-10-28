/**
 * Unified Match Service
 * This service handles all match-related operations and can be used by both
 * React components and vanilla JavaScript (scoreboard)
 */

class MatchService {
  constructor(firebase) {
    this.firebase = firebase;
    this.listeners = new Map();
  }

  /**
   * Get court-specific path
   */
  getCourtPath(court = 'Court A') {
    const courtKey = court.replace(' ', '_').toLowerCase();
    return `matches/${courtKey}`;
  }

  /**
   * Initialize a new match
   */
  async initializeMatch(teamA, teamB, court = 'Court A', options = {}) {
    const courtPath = this.getCourtPath(court);
    const matchData = {
      teamA: teamA || 'Team A',
      teamB: teamB || 'Team B',
      scoreA: 0,
      scoreB: 0,
      timerSeconds: options.timerSeconds || 600,
      quarterDuration: options.quarterDuration || 10,
      isRunning: false,
      quarter: 1,
      matchStage: 'menu',
      status: 'upcoming',
      players: {},
      teamAPlaying: [],
      teamBPlaying: [],
      matchType: options.matchType || 'Boys',
      roundType: options.roundType || 'Knockout',
      date: options.date || '',
      time: options.time || '',
      court: court,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      ...options,
    };

    const { set } = this.firebase;
    await set(this.firebase.ref(this.firebase.database, courtPath), matchData);
    return matchData;
  }

  /**
   * Listen to match updates
   */
  listenToMatch(court, callback) {
    const courtPath = this.getCourtPath(court);
    const matchRef = this.firebase.ref(this.firebase.database, courtPath);
    
    const unsubscribe = this.firebase.onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    this.listeners.set(court, unsubscribe);
    return unsubscribe;
  }

  /**
   * Stop listening to match updates
   */
  stopListening(court) {
    const unsubscribe = this.listeners.get(court);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(court);
    }
  }

  /**
   * Update multiple match fields atomically
   */
  async updateMatch(court, updates) {
    const courtPath = this.getCourtPath(court);
    const dbUpdates = {};
    
    Object.keys(updates).forEach(key => {
      dbUpdates[`${courtPath}/${key}`] = updates[key];
    });
    
    dbUpdates[`${courtPath}/lastUpdated`] = Date.now();

    const { update, ref } = this.firebase;
    await update(ref(this.firebase.database), dbUpdates);
  }

  /**
   * Update score
   */
  async updateScore(court, team, score) {
    await this.updateMatch(court, { [`score${team}`]: score });
  }

  /**
   * Add points to score
   */
  async addScore(court, team, points, currentScore) {
    const newScore = Math.max(0, currentScore + points);
    await this.updateScore(court, team, newScore);
    return newScore;
  }

  /**
   * Update timer
   */
  async updateTimer(court, seconds) {
    await this.updateMatch(court, { timerSeconds: seconds });
  }

  /**
   * Start/stop timer
   */
  async setTimerRunning(court, isRunning) {
    await this.updateMatch(court, { isRunning });
  }

  /**
   * Update quarter
   */
  async updateQuarter(court, quarter) {
    await this.updateMatch(court, { quarter });
  }

  /**
   * Next quarter
   */
  async nextQuarter(court, currentQuarter, quarterDuration) {
    const newQuarter = Math.min(4, currentQuarter + 1);
    await this.updateMatch(court, {
      quarter: newQuarter,
      timerSeconds: quarterDuration * 60,
      isRunning: false,
    });
    return newQuarter;
  }

  /**
   * Update match stage
   */
  async updateMatchStage(court, stage) {
    await this.updateMatch(court, { matchStage: stage });
  }

  /**
   * Add player
   */
  async addPlayer(court, playerData) {
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const courtPath = this.getCourtPath(court);
    
    const updates = {};
    updates[`${courtPath}/players/${playerId}`] = {
      name: playerData.name,
      jersey: playerData.jersey || '',
      team: playerData.team,
      points: playerData.points || 0,
      fouls: playerData.fouls || 0,
    };
    updates[`${courtPath}/lastUpdated`] = Date.now();

    const { update, ref } = this.firebase;
    await update(ref(this.firebase.database), updates);
    
    return playerId;
  }

  /**
   * Remove player
   */
  async removePlayer(court, playerId) {
    const courtPath = this.getCourtPath(court);
    const updates = {};
    updates[`${courtPath}/players/${playerId}`] = null;
    updates[`${courtPath}/lastUpdated`] = Date.now();

    const { update, ref } = this.firebase;
    await update(ref(this.firebase.database), updates);
  }

  /**
   * Update player
   */
  async updatePlayer(court, playerId, playerUpdates) {
    const courtPath = this.getCourtPath(court);
    const updates = {};
    
    Object.keys(playerUpdates).forEach(key => {
      updates[`${courtPath}/players/${playerId}/${key}`] = playerUpdates[key];
    });
    updates[`${courtPath}/lastUpdated`] = Date.now();

    const { update, ref } = this.firebase;
    await update(ref(this.firebase.database), updates);
  }

  /**
   * Update player score and recalculate team total
   */
  async updatePlayerScoreAndTeam(court, playerId, points, fouls, team, allPlayers) {
    // Calculate new team total
    let teamTotal = 0;
    
    for (const [id, player] of Object.entries(allPlayers)) {
      if (player.team === team) {
        if (id === playerId) {
          teamTotal += points;
        } else {
          teamTotal += (player.points || 0);
        }
      }
    }

    // Update both player and team score
    const courtPath = this.getCourtPath(court);
    const updates = {};
    updates[`${courtPath}/players/${playerId}/points`] = points;
    updates[`${courtPath}/players/${playerId}/fouls`] = fouls;
    updates[`${courtPath}/score${team}`] = teamTotal;
    updates[`${courtPath}/lastUpdated`] = Date.now();

    const { update, ref } = this.firebase;
    await update(ref(this.firebase.database), updates);

    return { playerPoints: points, teamTotal };
  }

  /**
   * Set playing players
   */
  async setPlayingPlayers(court, teamAPlaying, teamBPlaying) {
    const updates = {};
    if (teamAPlaying !== undefined) updates.teamAPlaying = teamAPlaying;
    if (teamBPlaying !== undefined) updates.teamBPlaying = teamBPlaying;
    
    await this.updateMatch(court, updates);
  }

  /**
   * Substitute player
   */
  async substitutePlayer(court, team, playerOutId, playerInId, currentPlaying) {
    const newPlaying = currentPlaying.map(id => 
      id === playerOutId ? playerInId : id
    );
    
    const fieldName = team === 'A' ? 'teamAPlaying' : 'teamBPlaying';
    await this.updateMatch(court, { [fieldName]: newPlaying });
    
    return newPlaying;
  }

  /**
   * Request timeout
   */
  async requestTimeout(court, team) {
    await this.updateMatch(court, {
      timeoutActive: true,
      timeoutTeam: team,
      timeoutStartTime: Date.now(),
    });
  }

  /**
   * End timeout
   */
  async endTimeout(court) {
    await this.updateMatch(court, {
      timeoutActive: false,
      timeoutTeam: null,
      timeoutStartTime: null,
    });
  }

  /**
   * Save match to history
   */
  async saveMatch(court, matchData) {
    const matchId = `match_${Date.now()}`;
    const historyPath = `matches/history/${matchId}`;
    
    const { set } = this.firebase;
    await set(
      this.firebase.ref(this.firebase.database, historyPath),
      { ...matchData, completedAt: Date.now() }
    );
    
    return matchId;
  }

  /**
   * Get match history
   */
  async getMatchHistory(limit = 10) {
    const { get, ref, query, orderByChild, limitToLast } = await import('firebase/database');
    
    const historyRef = ref(this.firebase.database, 'matches/history');
    const historyQuery = query(historyRef, orderByChild('completedAt'), limitToLast(limit));
    
    const snapshot = await get(historyQuery);
    return snapshot.val() || {};
  }

  /**
   * Batch import players from array
   */
  async batchImportPlayers(court, players) {
    const courtPath = this.getCourtPath(court);
    const updates = {};
    
    players.forEach((player, index) => {
      const playerId = `player_${Date.now()}_${index}`;
      updates[`${courtPath}/players/${playerId}`] = {
        name: player.name,
        jersey: player.jersey || '',
        team: player.team,
        points: 0,
        fouls: 0,
      };
    });
    
    updates[`${courtPath}/lastUpdated`] = Date.now();

    const { update, ref } = this.firebase;
    await update(ref(this.firebase.database), updates);
  }

  /**
   * Reset match (keep teams and players, reset scores)
   */
  async resetMatch(court) {
    await this.updateMatch(court, {
      scoreA: 0,
      scoreB: 0,
      quarter: 1,
      timerSeconds: 600,
      isRunning: false,
      matchStage: 'menu',
    });
  }

  /**
   * End match
   */
  async endMatch(court) {
    await this.updateMatch(court, {
      status: 'completed',
      isRunning: false,
      completedAt: Date.now(),
    });
  }
}

// Export for both ES modules and CommonJS
export default MatchService;

// Also attach to window for vanilla JS usage
if (typeof window !== 'undefined') {
  window.MatchService = MatchService;
}

