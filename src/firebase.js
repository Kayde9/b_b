// Centralized Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, update, set, get } from 'firebase/database';

let firebaseApp = null;
let firebaseDatabase = null;
let firebaseAuth = null;
let firebaseInitialized = false;
let authInitialized = false;

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Debug: Log config to help diagnose issues (remove in production)
console.log('🔍 Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasDatabaseURL: !!firebaseConfig.databaseURL,
  hasProjectId: !!firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase only once
export const initializeFirebase = async () => {
  if (firebaseInitialized) {
    console.log('Firebase already initialized, returning existing instance');
    return { app: firebaseApp, database: firebaseDatabase };
  }

  try {
    console.log('Starting Firebase initialization...');
    
    // Check if app already exists
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('Using existing Firebase app');
      firebaseApp = existingApps[0];
    } else {
      console.log('Creating new Firebase app');
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    console.log('Initializing database...');
    firebaseDatabase = getDatabase(firebaseApp);
    
    console.log('Initializing auth...');
    try {
      const { getAuth } = await import('firebase/auth');
      firebaseAuth = getAuth(firebaseApp);
      console.log('Auth initialized successfully');
    } catch (authError) {
      console.warn('Auth initialization skipped:', authError.message);
      firebaseAuth = null;
    }
    
    firebaseInitialized = true;
    console.log('Firebase initialization complete!');
    
    return { app: firebaseApp, database: firebaseDatabase, auth: firebaseAuth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Error details:', error.message, error.code);
    throw error;
  }
};

// Get Firebase database reference functions
export const getFirebaseDatabase = async () => {
  if (!firebaseInitialized) {
    console.log('Firebase not initialized, initializing now...');
    await initializeFirebase();
  }
  
  return {
    database: firebaseDatabase,
    ref,
    onValue,
    update,
    set,
    get
  };
};

// Authentication functions for admin access
export const signInAdmin = async (email, password) => {
  if (!firebaseInitialized) {
    await initializeFirebase();
  }
  
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    authInitialized = true;
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Anonymous sign in for read-only access (scoreboard)
export const signInAnonymously = async () => {
  if (!firebaseInitialized) {
    await initializeFirebase();
  }
  
  if (authInitialized) {
    return firebaseAuth.currentUser;
  }
  
  try {
    const { signInAnonymously: firebaseSignInAnonymously } = await import('firebase/auth');
    const userCredential = await firebaseSignInAnonymously(firebaseAuth);
    authInitialized = true;
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  if (!firebaseInitialized) {
    return;
  }
  
  try {
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(firebaseAuth);
    authInitialized = false;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return firebaseAuth?.currentUser || null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return authInitialized && firebaseAuth?.currentUser !== null;
};

export { firebaseConfig };
