# 🔒 Security Setup Guide

This guide explains how to properly configure Firebase credentials for the InterNMIMS Basketball application.

## ⚠️ CRITICAL: Never Commit Credentials

**NEVER** commit the following files to version control:
- `.env` (root directory)
- `scoreboard/js/firebase-config.js`

These files are already listed in `.gitignore` to prevent accidental commits.

---

## 📝 Step 1: Create `.env` File (For React App)

Create a file named `.env` in the **root directory** of the project with the following content:

```env
# Firebase Configuration
# IMPORTANT: Keep these credentials secure and never commit this file to git

# Firebase API Key
REACT_APP_FIREBASE_API_KEY=AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY

# Firebase Auth Domain
REACT_APP_FIREBASE_AUTH_DOMAIN=internmimsbasketball.firebaseapp.com

# Firebase Database URL
REACT_APP_FIREBASE_DATABASE_URL=https://internmimsbasketball-default-rtdb.firebaseio.com

# Firebase Project ID
REACT_APP_FIREBASE_PROJECT_ID=internmimsbasketball

# Firebase Storage Bucket
REACT_APP_FIREBASE_STORAGE_BUCKET=internmimsbasketball.firebasestorage.app

# Firebase Messaging Sender ID
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=97822648007

# Firebase App ID
REACT_APP_FIREBASE_APP_ID=1:97822648007:web:cfc93e3a6fb8233c6c40e2

# Firebase Measurement ID
REACT_APP_FIREBASE_MEASUREMENT_ID=G-KM2NGQ30TJ
```

---

## 📝 Step 2: Create Scoreboard Firebase Config

Navigate to `scoreboard/js/` and create `firebase-config.js`:

1. Copy the example file:
   ```bash
   cp scoreboard/js/firebase-config.example.js scoreboard/js/firebase-config.js
   ```

2. Edit `scoreboard/js/firebase-config.js` and replace the placeholder values:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY",
  authDomain: "internmimsbasketball.firebaseapp.com",
  databaseURL: "https://internmimsbasketball-default-rtdb.firebaseio.com",
  projectId: "internmimsbasketball",
  storageBucket: "internmimsbasketball.firebasestorage.app",
  messagingSenderId: "97822648007",
  appId: "1:97822648007:web:cfc93e3a6fb8233c6c40e2",
  measurementId: "G-KM2NGQ30TJ"
};
```

---

## 🔐 Step 3: Verify Security

### Check that credentials are NOT in source code:
1. Open `src/firebase.js` - should NOT contain hardcoded credentials
2. Open `scoreboard/js/firebase.js` - should import config from `firebase-config.js`

### Check .gitignore:
Ensure these lines are present in `.gitignore`:
```
.env
.env.local
scoreboard/js/firebase-config.js
.firebase/
```

### Verify Git Status:
Run:
```bash
git status
```

Make sure `.env` and `firebase-config.js` do NOT appear in the list of files to be committed.

---

## 🚀 Step 4: Test the Configuration

### For React App:
```bash
npm start
```

If you see error messages about missing environment variables, check that your `.env` file is:
1. In the root directory
2. Named exactly `.env` (no .txt extension)
3. Contains all required variables

### For Scoreboard:
Open `scoreboard/index.html` in a browser. Check the console:
- If you see Firebase config errors, verify `firebase-config.js` exists and has correct values
- Should NOT see placeholder values like "YOUR_API_KEY_HERE"

---

## ⚠️ Database Security Rules

**IMPORTANT**: Your current Firebase database rules allow public write access, which is a security risk!

Current rules (INSECURE):
```json
{
  "matches": {
    "current": {
      ".read": true,
      ".write": true  // ⚠️ Anyone can write!
    }
  }
}
```

### Recommended: Update Database Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `internmimsbasketball`
3. Navigate to: **Realtime Database** → **Rules**
4. Update rules to require authentication for writes:

```json
{
  "rules": {
    "matches": {
      "current": {
        ".read": true,
        ".write": "auth != null"
      },
      "completed": {
        ".read": true,
        ".write": "auth != null"
      },
      "scheduled": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "admins": {
      ".read": "auth != null",
      ".write": false
    }
  }
}
```

This ensures:
- ✅ Anyone can READ match data (for public scoreboard)
- ✅ Only authenticated users can WRITE (admin/scorer access)
- ✅ Admin list cannot be modified through the database

---

## 🔍 Troubleshooting

### Error: "Missing required environment variables"
- Check that `.env` file exists in root directory
- Verify all `REACT_APP_*` variables are present
- Restart the development server (`npm start`)

### Error: "Firebase configuration not found"
- Check that `scoreboard/js/firebase-config.js` exists
- Verify it exports `firebaseConfig` object
- Check that values are not placeholders

### Credentials still visible in browser
- Firebase API keys are meant to be public (they're in the client-side code)
- Security is enforced through Firebase Security Rules, not by hiding the API key
- What's important: Database rules and authentication

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Environment Variables in Create React App](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

---

## ✅ Security Checklist

- [ ] `.env` file created and contains all credentials
- [ ] `scoreboard/js/firebase-config.js` created with credentials
- [ ] Both files are listed in `.gitignore`
- [ ] Verified files are NOT in git status
- [ ] Removed hardcoded credentials from source code
- [ ] Updated Firebase database rules to require auth for writes
- [ ] Tested React app starts without errors
- [ ] Tested scoreboard loads without errors
- [ ] Confirmed debug logs only show in development mode

---

**Last Updated**: October 30, 2025


