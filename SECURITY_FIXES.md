# 🛠️ SECURITY FIXES IMPLEMENTATION GUIDE
## Step-by-Step Instructions to Secure Your Application

---

## 🔴 CRITICAL FIX #1: Implement Firebase Authentication

### Current Problem:
Hardcoded password in `src/pages/AdminScoring.js` that anyone can see.

### Solution:

#### Step 1: Enable Firebase Authentication
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `internmimsbasketball`
3. Click "Authentication" in left sidebar
4. Click "Get Started"
5. Enable "Email/Password" authentication
6. Create admin accounts:
   - Click "Add user"
   - Email: `admin@nmims.edu` (or your email)
   - Password: Create a strong password
   - Save the credentials securely

#### Step 2: Set Up Admin Role
1. In Firebase Console, go to "Realtime Database"
2. Click on "Data" tab
3. Add a new node called `admins`
4. Under `admins`, add your user UID as a key with value `true`
   - To get your UID: After creating user, check Authentication > Users tab
   - Example structure:
   ```json
   {
     "admins": {
       "ABC123xyz456": true
     }
   }
   ```

#### Step 3: Update Database Rules
Replace your `database.rules.json` with this:

```json
{
  "rules": {
    "matches": {
      "current": {
        ".read": true,
        ".write": "root.child('admins').child(auth.uid).val() === true",
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'scoreA', 'scoreB', 'timer', 'quarter'])",
        "teamA": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
        },
        "teamB": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
        },
        "scoreA": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 999"
        },
        "scoreB": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 999"
        },
        "timer": {
          ".validate": "newData.isString()"
        },
        "quarter": {
          ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 10"
        },
        "isRunning": {
          ".validate": "newData.isBoolean()"
        },
        "lastUpdated": {
          ".validate": "newData.isNumber()"
        },
        "players": {
          ".read": true,
          ".write": "root.child('admins').child(auth.uid).val() === true",
          "$playerId": {
            ".validate": "newData.hasChildren(['name', 'team', 'points', 'fouls'])",
            "name": {
              ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
            },
            "team": {
              ".validate": "newData.isString() && (newData.val() == 'A' || newData.val() == 'B')"
            },
            "points": {
              ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 999"
            },
            "fouls": {
              ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 6"
            },
            "number": {
              ".validate": "newData.isString() && newData.val().length <= 10"
            }
          }
        }
      },
      "scheduled": {
        ".read": true,
        ".write": "root.child('admins').child(auth.uid).val() === true",
        "$matchId": {
          ".validate": "newData.hasChildren(['teamA', 'teamB', 'date', 'time', 'court', 'status'])"
        }
      },
      "past": {
        ".read": true,
        ".write": "root.child('admins').child(auth.uid).val() === true"
      }
    },
    "admins": {
      ".read": "auth != null && root.child('admins').child(auth.uid).val() === true",
      ".write": false
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only database
```

---

## 🔴 CRITICAL FIX #2: Update AdminScoring.js

Create a new file: `src/pages/AdminScoringSecure.js`

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Lock, LogOut, Users, Trophy, Play, Pause, RotateCcw, Clock, RefreshCw, AlertTriangle, Upload, FileSpreadsheet } from 'lucide-react';
import { getFirebaseDatabase, signInAdmin, signOut, getCurrentUser } from '../firebase';
import * as XLSX from 'xlsx';
import './AdminScoring.css';

const AdminScoring = () => {
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = getCurrentUser();
      if (user) {
        // Verify admin status
        const { database, ref, get } = await getFirebaseDatabase();
        const adminRef = ref(database, `admins/${user.uid}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.val() === true) {
          setAuthenticated(true);
          setIsAdmin(true);
        } else {
          setError('You do not have admin privileges');
          await signOut();
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const user = await signInAdmin(email, password);
      
      // Verify admin status
      const { database, ref, get } = await getFirebaseDatabase();
      const adminRef = ref(database, `admins/${user.uid}`);
      const snapshot = await get(adminRef);
      
      if (snapshot.val() === true) {
        setAuthenticated(true);
        setIsAdmin(true);
        showNotification('Login successful!');
      } else {
        setError('You do not have admin privileges');
        await signOut();
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthenticated(false);
      setIsAdmin(false);
      setEmail('');
      setPassword('');
      showNotification('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Rest of your AdminScoring component code...
  // (Keep all the existing functionality)

  // Update the login form JSX:
  if (!authenticated) {
    return (
      <div className="admin-login">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="login-header">
            <Lock size={48} />
            <h2>Admin Login</h2>
            <p>Enter your credentials to access the scoring system</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nmims.edu"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div className="error-message">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Rest of your component when authenticated...
};

export default AdminScoring;
```

---

## 🔴 CRITICAL FIX #3: Enable Firebase App Check

### Step 1: Enable App Check in Firebase Console
1. Go to Firebase Console
2. Click "App Check" in left sidebar
3. Click "Get Started"
4. For web apps, select "reCAPTCHA v3"
5. Register your domain
6. Get your reCAPTCHA site key

### Step 2: Update firebase.js

Add App Check initialization:

```javascript
// Add to firebase.js after line 28
const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-check.js');

// Initialize App Check
const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

---

## 🟠 HIGH PRIORITY FIX: Add Security Headers

### Update firebase.json:

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains; preload"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## 🟠 HIGH PRIORITY FIX: Add CSP to index.html

Update `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#F97316" />
    
    <!-- Security Headers -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; 
                   script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://api.mapbox.com https://www.google.com https://www.gstatic.com; 
                   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com; 
                   font-src 'self' https://fonts.gstatic.com; 
                   img-src 'self' data: https: blob:; 
                   connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.mapbox.com wss://*.firebaseio.com https://*.firebase.com; 
                   frame-src 'self' https://www.google.com;">
    
    <meta name="description" content="Inter-NMIMS Basketball Tournament 2025 - NMIMS Hyderabad Campus" />
    <!-- Rest of your head content -->
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

---

## 🟡 MEDIUM PRIORITY: Remove Console Logs

### Update package.json:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "GENERATE_SOURCEMAP=false react-scripts build && npm run remove-logs",
    "remove-logs": "echo 'Build complete - console logs removed in production'",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:report": "playwright show-report",
    "eject": "react-scripts eject"
  }
}
```

### Install babel plugin:
```bash
npm install --save-dev babel-plugin-transform-remove-console
```

Create `.babelrc` in project root:
```json
{
  "env": {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}
```

---

## 🟡 MEDIUM PRIORITY: Update robots.txt

Update `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-scoring

Sitemap: https://yourdomain.com/sitemap.xml
```

---

## ✅ DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Firebase Authentication enabled
- [ ] Admin users created in Firebase Console
- [ ] Admin UIDs added to `/admins` node in database
- [ ] Database rules updated and deployed
- [ ] Firebase App Check enabled
- [ ] Security headers added to firebase.json
- [ ] CSP added to index.html
- [ ] Console logs removed from production build
- [ ] Environment variables configured
- [ ] HTTPS enforced
- [ ] Test admin login functionality
- [ ] Test database write permissions
- [ ] Test public read access to scoreboard
- [ ] Monitor Firebase usage quotas
- [ ] Set up billing alerts
- [ ] Create backup admin account
- [ ] Document admin credentials securely

---

## 🧪 TESTING SECURITY

### Test 1: Verify Database Rules
```javascript
// Try to write without authentication (should fail)
// Open browser console on scoreboard page:
const { database, ref, set } = await getFirebaseDatabase();
await set(ref(database, 'matches/current/scoreA'), 999);
// Should get permission denied error
```

### Test 2: Verify Admin Access
```javascript
// After logging in as admin, try to write (should succeed)
await set(ref(database, 'matches/current/scoreA'), 50);
// Should work
```

### Test 3: Check CSP
1. Open browser DevTools
2. Go to Console tab
3. Look for CSP violation warnings
4. Fix any violations

---

## 📞 SUPPORT

If you encounter issues:
1. Check Firebase Console logs
2. Check browser console for errors
3. Verify Firebase rules are deployed
4. Ensure admin UID is correct in database
5. Test with incognito window

---

**Last Updated:** October 24, 2025
