# Admin Scoring Panel - Quick Guide

## 🎮 Admin Panel Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🏆 Admin Scoring Panel              [Logout Button]        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ⏰ Timer Controls          │  Quarter Controls              │
│  ┌──────────────────────┐  │  ┌──────────────────────┐     │
│  │ 🕐 12:00             │  │  │ Quarter                │     │
│  │ [Start] [Reset]      │  │  │ [Q1] [Q2] [Q3] [Q4]   │     │
│  └──────────────────────┘  │  └──────────────────────┘     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Team A Name: [NMIMS Mumbai    ]                             │
│                                                               │
│       85        VS        72                                 │
│                                                               │
│  Team B Name: [NMIMS Hyderabad ]                             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 Quarter Scores                                           │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                            │
│  │ Q1 │  │ Q2 │  │ Q3 │  │ Q4 │                            │
│  │20-18│  │22-20│  │21-19│  │22-15│                        │
│  └────┘  └────┘  └────┘  └────┘                            │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [+ Add New Player]                                          │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  👥 NMIMS Mumbai - 85 pts    │  👥 NMIMS Hyderabad - 72 pts │
│                               │                               │
│  ┌──────────────────────┐    │  ┌──────────────────────┐   │
│  │ #9  KEVIN            │    │  │ #5  ABHISHEK         │   │
│  │ 9 pts  6 fouls       │    │  │ 9 pts  0 fouls       │   │
│  │                      │    │  │                      │   │
│  │ [+1] [+2] [+3]       │    │  │ [+1] [+2] [+3]       │   │
│  │ [Foul] [🔄 Undo]     │    │  │ [Foul] [🔄 Undo]     │   │
│  │ [🔄 -1] [🗑️ Delete]   │    │  │ [🔄 -1] [🗑️ Delete]   │   │
│  └──────────────────────┘    │  └──────────────────────┘   │
│                               │                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Button Functions

### Timer Controls:
- **🟢 Start**: Begins the countdown timer
- **🟡 Pause**: Pauses the timer
- **⚪ Reset**: Resets timer to 12:00

### Quarter Controls:
- **Q1, Q2, Q3, Q4**: Switch between quarters
- Active quarter is highlighted in **orange**
- Changing quarters automatically saves current scores

### Player Controls:
- **+1, +2, +3**: Add points to player
- **Foul**: Add a foul to player
- **🔄 (next to Foul)**: Undo last foul
- **🔄 -1**: Undo last point (removes 1)
- **🗑️ Delete**: Remove player from game

---

## 📝 Step-by-Step Workflow

### 1. Start of Game
```
1. Login to admin panel
2. Add players for Team A
3. Add players for Team B
4. Set team names (if needed)
5. Click [Start] to begin timer
```

### 2. During Game
```
When a player scores:
1. Find player card
2. Click [+1], [+2], or [+3]
3. Score updates automatically

When a player fouls:
1. Find player card
2. Click [Foul]
3. Foul count increases

If you make a mistake:
1. Click [🔄 -1] to undo points
2. Click [🔄] next to Foul to undo foul
```

### 3. Quarter Changes
```
End of Q1:
1. Click [Pause] to stop timer
2. Click [Q2] button
3. Scores for Q1 are saved
4. Timer resets to 12:00
5. Click [Start] to begin Q2

Repeat for Q3 and Q4
```

### 4. End of Game
```
1. Click [Pause] to stop timer
2. Review final scores
3. Check quarter scores
4. [Logout] when done
```

---

## 🎨 Color Coding

- **🟠 Orange**: Active quarter, current team, primary actions
- **🟢 Green**: Start button, positive actions
- **🟡 Yellow**: Pause button, undo actions
- **🔴 Red**: Delete button, fouls
- **⚪ Gray**: Reset button, inactive states

---

## ⚠️ Important Notes

1. **Undo buttons are disabled** when there's nothing to undo
2. **Timer automatically stops** at 0:00
3. **Quarter scores are saved** when you change quarters
4. **All changes sync** to live scoreboard instantly
5. **Team totals update** automatically when you add/undo points

---

## 🔄 Real-time Updates

Everything updates in real-time:
- ✅ Timer countdown
- ✅ Player scores
- ✅ Team totals
- ✅ Foul counts
- ✅ Quarter scores
- ✅ Current quarter indicator

Viewers see updates **instantly** on the live scoreboard!

---

## 📱 Mobile View

On mobile devices:
- Timer and quarter controls stack vertically
- Player cards display in single column
- All buttons remain accessible
- Touch-friendly button sizes

---

## 🆘 Troubleshooting

**Timer not starting?**
- Check if timer is already at 0:00
- Try clicking Reset first

**Undo button disabled?**
- Player has no points/fouls to undo
- This is normal behavior

**Scores not updating?**
- Check internet connection
- Refresh the page
- Check Firebase permissions

**Quarter not changing?**
- Make sure you clicked the quarter button
- Check for notification message
- Refresh if needed

---

## 🔐 Security

- Password required: `nmims2025`
- Only admins can access this panel
- Public users see live scoreboard only
- All actions are logged with timestamps

---

## 💡 Pro Tips

1. **Use Pause** during timeouts or breaks
2. **Double-check** before clicking Delete
3. **Use Undo** instead of manually adjusting
4. **Change quarters** at the right time
5. **Reset timer** at start of each quarter
6. **Keep an eye** on foul counts (max 5 per player)

---

**Need Help?** Contact the system administrator.

**Last Updated**: October 14, 2025
