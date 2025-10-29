# Scorer Portal - Complete Guide

## 🎯 Overview
The new **Scorer Portal** is a standalone, fully-integrated scoring system that replaces AdminScoring. It's directly connected to the Match Scheduler and provides all scoring features in a streamlined interface.

---

## ✅ Key Features

### **1. Direct Integration with Match Scheduler**
- Loads matches directly from Firestore
- Auto-loads all 20 players
- Pre-fills team names
- No manual data entry needed

### **2. Complete Scoring Features**
- ✅ Select playing 5 from roster
- ✅ Live scoring (1pt, 2pt, 3pt)
- ✅ Foul tracking
- ✅ Quarter management
- ✅ Game timer with pause/resume
- ✅ Real-time scoreboard updates
- ✅ Player statistics

### **3. Password Protected**
- Secure access with password
- Default: `scorer2025`
- Can be customized via environment variable

### **4. Live Updates**
- Syncs to Firebase Realtime Database
- Updates live scoreboard in real-time
- All viewers see updates instantly

---

## 🔄 Complete Workflow

### **Step 1: Schedule Match** (Match Scheduler)
1. Admin navigates to `/match-scheduler`
2. Enters password
3. Schedules match with team names, date, time, venue
4. Adds 20 players (10 per team) with jersey numbers
5. Match saved to Firestore

### **Step 2: Start Match** (Schedule Page)
1. Scorer goes to `/schedule`
2. Finds upcoming match
3. Clicks "Start Match" button
4. Redirected to `/scorer-portal?matchId=xxx`

### **Step 3: Login** (Scorer Portal)
1. Enter scorer password
2. Match data auto-loads
3. All 20 players displayed

### **Step 4: Select Playing 5**
1. View all players for both teams
2. Click to select 5 players per team
3. Selected players highlighted with checkmark
4. Counter shows "X / 5 selected"
5. Click "Start Match" when ready

### **Step 5: Live Scoring**
1. Scoreboard displays team scores
2. Timer shows quarter time
3. Each player has scoring buttons:
   - **+1**: 1-point shot
   - **+2**: 2-point shot
   - **+3**: 3-point shot
   - **Foul**: Add foul
4. Player stats update in real-time
5. Team scores update automatically
6. All changes sync to live scoreboard

### **Step 6: Quarter Management**
1. Timer counts down from 10:00
2. Pause/resume timer as needed
3. Reset timer if needed
4. Click "Next Quarter" to advance
5. Repeat for all 4 quarters
6. Click "Finish Match" after Q4

---

## 📊 Data Flow

```
Match Scheduler (Firestore)
    ↓
scheduledMatches collection
    ↓
players collection (20 players with matchId)
    ↓
Schedule Page (displays matches)
    ↓
Scorer Portal (loads match + players)
    ↓
Select Playing 5
    ↓
Live Scoring
    ↓
Firebase Realtime Database (matches/current)
    ↓
Live Scoreboard (real-time updates)
```

---

## 🗄️ Database Structure

### **Firestore Collections**

#### scheduledMatches
```json
{
  "matchId": "match_1730217600000_abc123",
  "teamA": "Warriors",
  "teamB": "Lakers",
  "date": "2025-10-30",
  "time": "18:00",
  "venue": "Main Court",
  "status": "scheduled"
}
```

#### players
```json
{
  "jerseyNumber": "23",
  "playerName": "John Doe",
  "team": "A",
  "matchId": "match_1730217600000_abc123"
}
```

### **Realtime Database**

#### matches/current
```json
{
  "teamA": "Warriors",
  "teamB": "Lakers",
  "scoreA": 45,
  "scoreB": 38,
  "quarter": 2,
  "timerSeconds": 420,
  "isRunning": true,
  "quarterScores": {
    "q1": { "teamA": 25, "teamB": 20 },
    "q2": { "teamA": 20, "teamB": 18 }
  },
  "players": {
    "player1": {
      "name": "John Doe",
      "jersey": "23",
      "team": "A",
      "points": 15,
      "fouls": 2
    }
  }
}
```

---

## 🎨 UI Components

### **Login Screen**
- Password input field
- Error message display
- "Access Portal" button
- Orange theme with glow effects

### **Player Selection Screen**
- Two columns (Team A / Team B)
- Player cards with jersey # and name
- Click to select/deselect
- Visual feedback (checkmark, highlight)
- Counter showing selection progress
- "Start Match" button (enabled when 5+5 selected)

### **Live Scoring Screen**
- **Scoreboard**: Team names, scores, quarter, timer
- **Timer Controls**: Play/Pause, Reset
- **Player Cards**: 
  - Jersey number and name
  - Current points and fouls
  - Scoring buttons (+1, +2, +3, Foul)
- **Quarter Control**: Next Quarter / Finish Match button

---

## 🔐 Access & Security

### **Passwords**

#### Match Scheduler
- **Default**: `scheduler2025`
- **Environment Variable**: `REACT_APP_SCHEDULER_PASSWORD`
- **Access**: Direct URL only (`/match-scheduler`)

#### Scorer Portal
- **Default**: `scorer2025`
- **Environment Variable**: `REACT_APP_SCORER_PASSWORD`
- **Access**: Via Schedule page "Start Match" button

### **Routes**
- `/match-scheduler` - Admin only (password protected)
- `/scorer-portal?matchId=xxx` - Scorer access (password protected)
- `/schedule` - Public (view matches and start scoring)

---

## 📱 Mobile Responsive

### **Breakpoints**
- **1024px**: Tablet landscape
- **768px**: Tablet portrait
- **640px**: Mobile landscape
- **480px**: Small mobile

### **Mobile Features**
- ✅ Single column layouts
- ✅ Touch-friendly buttons
- ✅ Optimized font sizes
- ✅ Full-width controls
- ✅ Stacked player cards
- ✅ Responsive scoreboard

---

## 🎯 Advantages Over AdminScoring

### **Scorer Portal Benefits**
1. **Simpler**: No complex setup stages
2. **Faster**: Direct match loading
3. **Cleaner**: Focused UI for scoring only
4. **Integrated**: Seamless connection to Match Scheduler
5. **No Manual Entry**: All data pre-loaded
6. **Better UX**: Streamlined workflow
7. **Mobile Optimized**: Better touch interface

### **Comparison**

| Feature | AdminScoring | Scorer Portal |
|---------|-------------|---------------|
| Player Entry | Manual | Auto-loaded |
| Match Setup | Complex | Automatic |
| Team Names | Manual | Pre-filled |
| Workflow | Multi-stage | Streamlined |
| Integration | None | Full Firestore |
| Mobile UX | Basic | Optimized |
| Password | Shared | Separate |

---

## 🚀 Quick Start Guide

### **For Admins**
1. Go to `/match-scheduler`
2. Enter password: `scheduler2025`
3. Schedule match
4. Add 20 players
5. Done!

### **For Scorers**
1. Go to `/schedule`
2. Find your match
3. Click "Start Match"
4. Enter password: `scorer2025`
5. Select 5 players per team
6. Click "Start Match"
7. Begin scoring!

---

## 🐛 Troubleshooting

### **Match Not Loading**
- Check matchId in URL
- Verify match exists in Firestore
- Ensure players were added

### **Players Not Showing**
- Verify 20 players added in Match Scheduler
- Check matchId matches
- Refresh page

### **Scores Not Updating**
- Check Firebase Realtime Database connection
- Verify internet connection
- Check browser console for errors

### **Timer Not Working**
- Click Play button
- Check if quarter ended (timer at 0:00)
- Refresh page if stuck

---

## 📝 Environment Variables

Add to `.env` file:

```env
# Match Scheduler Password
REACT_APP_SCHEDULER_PASSWORD=your_admin_password

# Scorer Portal Password
REACT_APP_SCORER_PASSWORD=your_scorer_password

# Firebase Config (existing)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DATABASE_URL=...
REACT_APP_FIREBASE_PROJECT_ID=...
```

---

## 🎓 Best Practices

### **For Admins**
1. Schedule matches in advance
2. Add all 20 players before match day
3. Double-check jersey numbers
4. Keep Match Scheduler password secure
5. Test match loading before game day

### **For Scorers**
1. Arrive early to set up
2. Select playing 5 before tip-off
3. Start timer at game start
4. Pause during timeouts
5. Verify scores after each quarter
6. Click "Finish Match" when done

### **For Viewers**
1. Visit `/schedule` to see upcoming matches
2. Live scores update automatically
3. No refresh needed
4. View player stats in real-time

---

## 🔄 Migration from AdminScoring

### **What to Do**
1. Use new Scorer Portal for all future matches
2. AdminScoring still available at `/admin-scoring`
3. Old matches remain accessible
4. New matches use Scorer Portal workflow

### **Benefits of Migration**
- ✅ No more manual player entry
- ✅ Faster match setup
- ✅ Better mobile experience
- ✅ Integrated with scheduling
- ✅ Cleaner interface

---

## 📚 Files Created

### **New Files**
1. `src/components/ScorerPortal.js` - Main component
2. `src/components/ScorerPortal.css` - Styling
3. `SCORER_PORTAL_GUIDE.md` - This documentation

### **Modified Files**
1. `src/App.js` - Added route
2. `src/pages/Schedule.js` - Updated button link

---

## 🎉 Summary

The **Scorer Portal** is a complete replacement for AdminScoring that:
- ✅ Integrates directly with Match Scheduler
- ✅ Auto-loads all match data
- ✅ Provides streamlined scoring interface
- ✅ Updates live scoreboard in real-time
- ✅ Works perfectly on mobile
- ✅ Requires no manual data entry

**You no longer need AdminScoring!** 🚀

---

**Last Updated**: October 29, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
