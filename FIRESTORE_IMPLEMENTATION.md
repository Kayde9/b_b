# Firestore Database Implementation Guide

## Overview
This document outlines the Firestore database implementation for match scheduling, player management, and match editing functionality.

---

## 🔥 Firebase Configuration

### Updated Files
- **`src/firebase.js`**: Added Firestore initialization alongside Realtime Database

### New Firestore Functions
```javascript
import { getFirestore, generateMatchId } from './firebase';
```

### Key Features
- **Dual Database Support**: Both Realtime Database (for live scoring) and Firestore (for match scheduling)
- **Unique Match IDs**: Auto-generated using `generateMatchId()`
- **Server Timestamps**: Automatic timestamp management

---

## 📅 Match Scheduler Component

### Location
- **Component**: `src/components/MatchScheduler.js`
- **Styles**: `src/components/MatchScheduler.css`
- **Route**: `/match-scheduler`

### Features Implemented

#### 1. **Schedule New Match**
- Create matches with unique Match IDs
- Store match details:
  - Team A name
  - Team B name
  - Date and time
  - Venue
  - Match ID (auto-generated)
  - Status (scheduled/live/completed)
  - Timestamps (created/updated)

#### 2. **Edit Scheduled Matches**
- Click edit icon on any match card
- Modify match details
- Updates timestamp automatically
- Preserves Match ID

#### 3. **Delete Matches**
- Remove scheduled matches
- Automatically deletes associated players
- Confirmation dialog for safety

#### 4. **Add Players (20 per match)**
- Add up to 10 players per team (20 total)
- Player information stored:
  - Jersey Number
  - Player Name
  - Team (A or B)
  - Match ID (links to specific match)
  - Timestamp

---

## 🗄️ Firestore Database Structure

### Collections

#### **scheduledMatches**
```json
{
  "matchId": "match_1730217600000_abc123",
  "teamA": "Warriors",
  "teamB": "Lakers",
  "date": "2025-10-30",
  "time": "18:00",
  "venue": "Main Court",
  "status": "scheduled",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

#### **players**
```json
{
  "jerseyNumber": "23",
  "playerName": "John Doe",
  "team": "A",
  "matchId": "match_1730217600000_abc123",
  "createdAt": "Timestamp"
}
```

---

## 📱 Mobile Responsiveness

### Breakpoints Implemented
- **1024px**: Tablet landscape
- **768px**: Tablet portrait
- **640px**: Mobile landscape
- **400px**: Small mobile devices

### Mobile-Specific Features

#### iOS Optimizations
- Touch scrolling support
- Native input styling removed
- Minimum tap target size (44px)
- Date/time picker optimizations

#### Android Optimizations
- Minimum touch target sizes
- Proper input handling
- Smooth scrolling
- Material design compatibility

### Responsive Features
- ✅ Single column layout on mobile
- ✅ Full-screen modals on small screens
- ✅ Stacked form inputs
- ✅ Touch-friendly buttons
- ✅ Optimized font sizes
- ✅ Adaptive spacing
- ✅ Horizontal scrolling prevention

---

## 🎨 UI/UX Features

### Design Consistency
- Black-orange theme maintained
- Glowing effects on interactive elements
- Smooth animations and transitions
- Card-based layout
- Modal dialogs for forms

### Interactive Elements
- Hover effects on desktop
- Touch feedback on mobile
- Loading states
- Empty states with icons
- Confirmation dialogs

---

## 🚀 Usage Instructions

### Access Match Scheduler
1. Navigate to `/match-scheduler`
2. Click "Schedule Match" button

### Schedule a Match
1. Fill in team names
2. Select date and time
3. Enter venue
4. Click "Schedule Match"
5. Match ID is auto-generated

### Add Players
1. Click "Add Players" on any match card
2. Enter jersey numbers and player names
3. Team A: First 10 slots
4. Team B: Last 10 slots
5. Click "Add Players" to save

### Edit Match
1. Click edit icon (pencil) on match card
2. Modify details
3. Click "Update Match"

### Delete Match
1. Click delete icon (trash) on match card
2. Confirm deletion
3. Match and all players are removed

---

## 🔐 Security Considerations

### Firestore Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all
    match /{document=**} {
      allow read: if true;
    }
    
    // Restrict write access to authenticated users
    match /scheduledMatches/{matchId} {
      allow write: if request.auth != null;
    }
    
    match /players/{playerId} {
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🔄 Integration with Existing System

### Realtime Database (Live Scoring)
- Continues to use `matches/current` for live matches
- Real-time updates during games
- Player stats tracking

### Firestore (Match Management)
- Pre-match scheduling
- Player roster management
- Match history
- Edit capabilities

### Data Flow
1. **Schedule**: Match created in Firestore
2. **Pre-Game**: Players added to Firestore
3. **Game Start**: Data copied to Realtime Database
4. **Live**: Realtime Database handles scoring
5. **Post-Game**: Results stored in both databases

---

## 📊 Query Examples

### Get All Scheduled Matches
```javascript
const { firestore, collection, getDocs, query, orderBy } = await getFirestore();
const matchesRef = collection(firestore, 'scheduledMatches');
const q = query(matchesRef, orderBy('createdAt', 'desc'));
const snapshot = await getDocs(q);
```

### Get Players for a Match
```javascript
const { firestore, collection, query, where, getDocs } = await getFirestore();
const playersRef = collection(firestore, 'players');
const q = query(playersRef, where('matchId', '==', 'match_123'));
const snapshot = await getDocs(q);
```

### Update Match
```javascript
const { firestore, doc, updateDoc, serverTimestamp } = await getFirestore();
const matchRef = doc(firestore, 'scheduledMatches', matchId);
await updateDoc(matchRef, {
  teamA: 'New Team Name',
  updatedAt: serverTimestamp()
});
```

---

## 🐛 Troubleshooting

### Common Issues

#### Firestore Not Initialized
- Ensure Firebase config is correct
- Check `.env` file has all required variables
- Verify Firestore is enabled in Firebase Console

#### Players Not Saving
- Check Match ID is valid
- Verify at least one player has data
- Ensure Firestore rules allow writes

#### Mobile Layout Issues
- Clear browser cache
- Test on actual devices
- Check viewport meta tag

---

## 🎯 Next Steps

### Recommended Enhancements
1. **Search/Filter**: Add search for matches
2. **Bulk Import**: CSV upload for players
3. **Match Templates**: Save common match setups
4. **Notifications**: Email/SMS reminders
5. **Statistics**: Match history analytics
6. **Export**: PDF generation for rosters

---

## 📝 Testing Checklist

### Desktop
- [ ] Schedule match
- [ ] Edit match
- [ ] Delete match
- [ ] Add players
- [ ] Form validation
- [ ] Modal interactions

### Mobile (iOS)
- [ ] Touch interactions
- [ ] Date/time pickers
- [ ] Modal scrolling
- [ ] Form inputs
- [ ] Button tap targets

### Mobile (Android)
- [ ] Touch interactions
- [ ] Date/time pickers
- [ ] Modal scrolling
- [ ] Form inputs
- [ ] Button tap targets

---

## 📚 Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

**Last Updated**: October 29, 2025
**Version**: 1.0.0
