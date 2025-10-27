// Centralized Firebase configuration and initialization
let firebaseApp = null;
let firebaseDatabase = null;
let firebaseAuth = null;
let firebaseInitialized = false;
let authInitialized = false;

const firebaseConfig = {
  apiKey: "AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY",
  authDomain: "internmimsbasketball.firebaseapp.com",
  databaseURL: "https://internmimsbasketball-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "internmimsbasketball",
  storageBucket: "internmimsbasketball.firebasestorage.app",
  messagingSenderId: "97822648007",
  appId: "1:97822648007:web:cfc93e3a6fb8233c6c40e2",
  measurementId: "G-KM2NGQ30TJ"
};

// Initialize Firebase only once
export const initializeFirebase = async () => {
  if (firebaseInitialized) {
    return { app: firebaseApp, database: firebaseDatabase };
  }

  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
    
    // Check if app already exists
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    firebaseDatabase = getDatabase(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    firebaseInitialized = true;
    
    return { app: firebaseApp, database: firebaseDatabase, auth: firebaseAuth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Get Firebase database reference functions
export const getFirebaseDatabase = async () => {
  if (!firebaseInitialized) {
    await initializeFirebase();
  }
  
  const { ref, onValue, update, set, get } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js');
  
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
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
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
    const { signInAnonymously: firebaseSignInAnonymously } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
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
    const { signOut: firebaseSignOut } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
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
