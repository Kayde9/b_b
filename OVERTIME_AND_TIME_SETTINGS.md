# Overtime & Time Settings - Feature Documentation

## ✅ New Features Added

### 1. **Customizable Quarter Duration**
Admins can now set custom time for each quarter before or during the match.

**Available Durations:**
- 5 minutes
- 8 minutes
- 10 minutes
- 12 minutes (default)
- 15 minutes

**How to Use:**
1. Click the **⚙️ Settings** button next to "Quarter"
2. Select desired duration (5m, 8m, 10m, 12m, 15m)
3. Timer automatically updates to selected duration
4. All future quarters will use this duration

**Location:** Admin Panel → Quarter Controls → ⚙️ Button

---

### 2. **Automatic Overtime Detection**
System automatically detects when game is tied after 4 quarters.

**Features:**
- ⚠️ **Alert appears** when Q4 ends with tied score
- **"Start Overtime" button** appears automatically
- Visual warning with pulsing animation
- Cannot start overtime if game is not tied

**Trigger Conditions:**
- Quarter 4 is complete
- Team A score = Team B score
- Alert shows: "⚠️ Game is tied!"

---

### 3. **Overtime Periods**
Up to 5 overtime periods supported (OT1 through OT5).

**Overtime Rules:**
- **Duration:** 5 minutes per overtime period
- **Automatic timer:** Resets to 5:00 for each OT
- **Separate tracking:** Overtime scores tracked separately
- **Multiple OTs:** Continue until winner is decided

**Overtime Buttons:**
- OT1, OT2, OT3, OT4, OT5
- Yellow/amber color scheme
- Active overtime highlighted
- Separate from regular quarters

---

### 4. **Overtime Score Tracking**
Overtime scores are tracked separately from regular quarters.

**Display:**
- Regular quarters: Q1, Q2, Q3, Q4
- Overtime periods: OT1, OT2, OT3, OT4, OT5
- Separate "Overtime Scores" section
- Current overtime highlighted in amber

**Visible In:**
- ✅ Admin Panel
- ✅ Live Scoreboard (public view)

---

## 📊 Updated Database Structure

```javascript
matches/current: {
  teamA: "NMIMS Mumbai",
  teamB: "NMIMS Hyderabad",
  scoreA: 85,
  scoreB: 85,
  timerSeconds: 300,           // Current timer
  quarterDuration: 5,          // NEW: Duration in minutes
  isRunning: false,
  quarter: 5,                  // 1-4 for regular, 5+ for OT
  isOvertime: true,            // NEW: Overtime flag
  quarterScores: {
    q1: { teamA: 20, teamB: 18 },
    q2: { teamA: 22, teamB: 20 },
    q3: { teamA: 21, teamB: 19 },
    q4: { teamA: 22, teamB: 28 },
    ot1: { teamA: 5, teamB: 3 },  // NEW: Overtime scores
    ot2: { teamA: 4, teamB: 4 }   // NEW: Additional OTs
  },
  players: {},
  lastUpdated: timestamp
}
```

---

## 🎮 Admin Panel Workflow

### Starting a Match with Custom Time:
```
1. Login to admin panel
2. Click ⚙️ Settings button
3. Select quarter duration (e.g., 10 minutes)
4. Add players
5. Click Start to begin Q1
```

### Handling Tied Game After Q4:
```
1. Q4 ends with tied score (e.g., 85-85)
2. ⚠️ Alert appears: "Game is tied!"
3. Click "Start Overtime" button
4. OT1 begins with 5-minute timer
5. Continue playing overtime periods
```

### Switching Between Overtime Periods:
```
1. OT1 ends, still tied
2. Click "OT2" button
3. Timer resets to 5:00
4. Continue until winner is decided
```

### Changing Quarter Duration Mid-Game:
```
1. Click ⚙️ Settings
2. Select new duration
3. Timer updates immediately
4. New duration applies to current and future quarters
```

---

## 🎨 Visual Indicators

### Regular Quarters:
- **Color:** Orange (#FF6B35)
- **Label:** Q1, Q2, Q3, Q4
- **Timer:** Customizable (5-15 minutes)

### Overtime Periods:
- **Color:** Amber/Yellow (#f59e0b)
- **Label:** OT1, OT2, OT3, OT4, OT5
- **Timer:** Fixed 5 minutes
- **Animation:** Pulsing glow effect
- **Status:** "OVERTIME" badge

### Overtime Alert:
- **Background:** Red-to-amber gradient
- **Border:** Pulsing amber
- **Text:** "⚠️ Game is tied!"
- **Button:** "Start Overtime"

---

## 📱 Live Scoreboard Updates

### Public View Shows:
- ✅ Current quarter or overtime period
- ✅ "OVERTIME 1" instead of "Quarter 5"
- ✅ Pulsing animation for overtime
- ✅ All quarter scores including OT
- ✅ Real-time timer countdown

### Overtime Display:
```
┌─────────────────────────────┐
│ ● LIVE    OVERTIME 1        │
├─────────────────────────────┤
│  NMIMS Mumbai      85       │
│       🕐 04:32              │
│         VS                  │
│  NMIMS Hyderabad   85       │
└─────────────────────────────┘
```

---

## ⚙️ Technical Details

### Timer Behavior:
- Regular quarters: Use `quarterDuration` setting
- Overtime: Always 5 minutes (300 seconds)
- Reset on quarter/OT change
- Syncs across all connected devices

### Overtime Logic:
```javascript
// Check if overtime needed
if (quarter === 4 && scoreA === scoreB) {
  showOvertimeAlert();
}

// Start overtime
quarter = 5;  // OT1
isOvertime = true;
quarterDuration = 5;
timerSeconds = 300;
```

### Score Tracking:
- Regular quarters: `q1`, `q2`, `q3`, `q4`
- Overtime periods: `ot1`, `ot2`, `ot3`, `ot4`, `ot5`
- Each stores: `{ teamA: score, teamB: score }`

---

## 🔄 State Management

### Quarter Changes:
1. Save current quarter/OT scores
2. Update quarter number
3. Reset timer to appropriate duration
4. Pause game
5. Update `isOvertime` flag if needed

### Duration Changes:
1. Update `quarterDuration` in database
2. Reset timer to new duration
3. Pause game
4. Apply to current and future quarters

---

## 🚨 Error Handling

### Overtime Prevention:
- ✅ Cannot start OT if game not tied
- ✅ Shows notification: "Game is not tied"
- ✅ OT button only appears when needed

### Duration Validation:
- ✅ Only allows predefined durations
- ✅ Minimum: 5 minutes
- ✅ Maximum: 15 minutes
- ✅ Timer cannot go negative

### Quarter Limits:
- ✅ Regular quarters: 1-4
- ✅ Overtime periods: 5-9 (OT1-OT5)
- ✅ Maximum 5 overtime periods

---

## 📋 Use Cases

### Scenario 1: Youth Game (8-minute quarters)
```
1. Set duration to 8 minutes
2. Play Q1-Q4 with 8:00 each
3. If tied, OT is still 5:00
```

### Scenario 2: Professional Game (12-minute quarters)
```
1. Use default 12 minutes
2. Play Q1-Q4 with 12:00 each
3. If tied, OT is 5:00
```

### Scenario 3: Multiple Overtimes
```
1. Game tied 85-85 after Q4
2. Play OT1 (5:00) → Still tied 88-88
3. Play OT2 (5:00) → Still tied 90-90
4. Play OT3 (5:00) → Winner! 93-90
```

### Scenario 4: Mid-Game Duration Change
```
1. Q1 played with 12:00
2. Admin changes to 10:00
3. Q2-Q4 use 10:00
4. Previous quarter scores preserved
```

---

## 🎯 Best Practices

### For Admins:
1. **Set duration before game starts**
2. **Don't change duration mid-quarter**
3. **Wait for OT alert** before starting overtime
4. **Track overtime periods** carefully
5. **Announce overtime** to players and audience

### For Scorekeepers:
1. **Pause timer** at end of each quarter
2. **Verify scores** before starting OT
3. **Reset timer** for each new period
4. **Save quarter scores** before switching

---

## 🔧 Troubleshooting

**OT button not appearing?**
- Check if Q4 is complete
- Verify scores are exactly tied
- Refresh page if needed

**Timer not resetting?**
- Click Reset button
- Check quarter duration setting
- Verify Firebase connection

**Wrong OT number showing?**
- Check `quarter` value in database
- OT1 = quarter 5, OT2 = quarter 6, etc.

**Duration change not applying?**
- Click Reset after changing duration
- Check if game is paused
- Verify Firebase permissions

---

## 📊 Statistics & Analytics

### Track:
- Total game duration
- Number of overtime periods
- Longest overtime game
- Average quarter scores
- Overtime win rates

### Export Data:
- Quarter-by-quarter breakdown
- Overtime statistics
- Player performance in OT
- Time management metrics

---

## 🚀 Future Enhancements

Potential additions:
1. **Custom OT duration** (not just 5 minutes)
2. **Sudden death mode** (first score wins)
3. **Timeout tracking** per quarter/OT
4. **Shot clock** integration
5. **Automatic game end** after 5 OTs
6. **Historical OT games** database

---

## 📝 Summary

### Key Features:
- ✅ Customizable quarter duration (5-15 minutes)
- ✅ Automatic overtime detection
- ✅ Up to 5 overtime periods
- ✅ Separate OT score tracking
- ✅ Visual indicators and animations
- ✅ Real-time sync across devices

### Benefits:
- **Flexibility:** Adapt to any game format
- **Accuracy:** Precise time tracking
- **Fairness:** Proper overtime handling
- **Transparency:** Clear visual feedback
- **Scalability:** Multiple OT support

---

**Last Updated:** October 14, 2025  
**Status:** Fully implemented and tested ✅
