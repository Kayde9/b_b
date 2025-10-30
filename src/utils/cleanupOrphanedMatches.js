// Utility to clean up orphaned matches in Realtime Database
// Run this once to remove matches that exist in Realtime DB but not in Firestore

import { getFirebaseDatabase } from '../firebase';
import { getFirestoreUtils } from '../firebase';

export const cleanupOrphanedMatches = async () => {
  try {
    console.log('🧹 Starting cleanup of orphaned matches...');
    
    // Get all scheduled matches from Firestore
    const { firestore, collection, getDocs } = await getFirestoreUtils();
    const matchesRef = collection(firestore, 'scheduledMatches');
    const firestoreSnapshot = await getDocs(matchesRef);
    
    const validMatchIds = new Set();
    const validMatchPairs = new Set();
    
    firestoreSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.matchId) {
        validMatchIds.add(data.matchId);
      }
      if (data.teamA && data.teamB) {
        validMatchPairs.add(`${data.teamA}|${data.teamB}`);
      }
    });
    
    console.log(`📋 Found ${validMatchIds.size} valid matches in Firestore`);
    
    // Get Realtime Database data
    const { database, ref, get, set } = await getFirebaseDatabase();
    
    // Check current match
    const currentMatchRef = ref(database, 'matches/current');
    const currentSnapshot = await get(currentMatchRef);
    const currentMatch = currentSnapshot.val();
    
    if (currentMatch) {
      const matchPair = `${currentMatch.teamA}|${currentMatch.teamB}`;
      const isValid = validMatchIds.has(currentMatch.matchId) || 
                      validMatchPairs.has(matchPair);
      
      if (!isValid) {
        console.log(`🗑️ Removing orphaned CURRENT match: ${currentMatch.teamA} vs ${currentMatch.teamB}`);
        await set(currentMatchRef, null);
      } else {
        console.log(`✅ Current match is valid: ${currentMatch.teamA} vs ${currentMatch.teamB}`);
      }
    } else {
      console.log('ℹ️ No current match');
    }
    
    // Check completed matches
    const completedRef = ref(database, 'matches/completed');
    const completedSnapshot = await get(completedRef);
    const completedMatches = completedSnapshot.val();
    
    let removedCount = 0;
    
    if (completedMatches) {
      const updatesToRemove = {};
      
      Object.entries(completedMatches).forEach(([key, match]) => {
        const matchPair = `${match.teamA}|${match.teamB}`;
        const isValid = validMatchIds.has(match.matchId) || 
                        validMatchPairs.has(matchPair);
        
        if (!isValid) {
          console.log(`🗑️ Marking for removal: ${match.teamA} vs ${match.teamB} (${key})`);
          updatesToRemove[`matches/completed/${key}`] = null;
          removedCount++;
        }
      });
      
      if (Object.keys(updatesToRemove).length > 0) {
        const { update } = await getFirebaseDatabase();
        await update(ref(database), updatesToRemove);
        console.log(`✅ Removed ${removedCount} orphaned completed matches`);
      } else {
        console.log('✅ No orphaned completed matches found');
      }
    } else {
      console.log('ℹ️ No completed matches');
    }
    
    return {
      success: true,
      message: `Cleanup complete! Removed ${removedCount} orphaned match(es)`,
      removedCount
    };
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      error
    };
  }
};

// Alternative: Clear ALL matches from Realtime Database
export const clearAllRealtimeMatches = async () => {
  try {
    console.log('⚠️ Clearing ALL matches from Realtime Database...');
    
    const { database, ref, set } = await getFirebaseDatabase();
    
    // Clear current match
    await set(ref(database, 'matches/current'), null);
    console.log('✅ Cleared current match');
    
    // Clear completed matches
    await set(ref(database, 'matches/completed'), null);
    console.log('✅ Cleared completed matches');
    
    return {
      success: true,
      message: 'All Realtime Database matches cleared successfully'
    };
    
  } catch (error) {
    console.error('❌ Error clearing matches:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      error
    };
  }
};


