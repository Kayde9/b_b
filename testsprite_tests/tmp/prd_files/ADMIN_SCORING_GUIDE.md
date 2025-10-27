# Admin Scoring Panel Guide

## 🔐 Access Information

**URL:** `/admin-scoring`

**Password:** `nmims2025`

## 📋 Features

### 1. **Player Management**
- Add new players with:
  - Player Name
  - Jersey Number
  - Team Assignment (Team A or Team B)
- Delete players
- View all players organized by team

### 2. **Live Scoring**
- **+1 Point Button:** For free throws
- **+2 Point Button:** For field goals
- **+3 Point Button:** For three-pointers
- Scores automatically update team totals
- Real-time sync with public scoreboard

### 3. **Foul Tracking**
- Add fouls to individual players
- Track total fouls per player
- Visible on both admin and public scoreboards

### 4. **Match Management**
- Edit team names
- View current scores
- Real-time updates via Firebase

## 🎯 How to Use

### Step 1: Login
1. Navigate to `/admin-scoring`
2. Enter password: `nmims2025`
3. Click "Login"

### Step 2: Add Players
1. Click "Add New Player" button
2. Enter player name (e.g., "John Smith")
3. Enter jersey number (e.g., "23")
4. Select team (Team A or Team B)
5. Click "Save"

### Step 3: Score Points
1. Find the player in their team section
2. Click the appropriate scoring button:
   - **+1** for free throw
   - **+2** for field goal
   - **+3** for three-pointer
3. Score updates instantly on both admin and public views

### Step 4: Add Fouls
1. Find the player
2. Click "Foul" button
3. Foul count increases by 1

### Step 5: Manage Players
1. To remove a player, click the trash icon
2. Confirm deletion

## 🔄 Real-Time Updates

All changes made in the admin panel are instantly reflected on:
- Public scoreboard (Schedule page)
- Any connected devices viewing the scoreboard
- Firebase database

## 🎨 Visual Features

- **Jersey Numbers:** Displayed in orange badges
- **Player Stats:** Points (orange) and Fouls (red)
- **Score Buttons:** Color-coded (Green +1, Blue +2, Purple +3)
- **Notifications:** Success messages for all actions
- **Responsive Design:** Works on desktop and mobile

## 🔒 Security Notes

- Password authentication required
- Admin access only for authorized users
- Session-based authentication
- Logout button available in header

## 📱 Mobile Support

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🆘 Troubleshooting

**Can't login?**
- Verify password: `nmims2025`
- Check internet connection

**Scores not updating?**
- Check Firebase connection
- Refresh the page
- Verify internet connection

**Players not showing?**
- Ensure you've added players first
- Check team assignment
- Refresh the page

## 🎯 Best Practices

1. **Add all players before the match starts**
2. **Use correct jersey numbers** for easy identification
3. **Double-check team assignments**
4. **Test scoring before live match**
5. **Keep admin panel open during match**
6. **Have backup device ready**

## 🔗 Quick Links

- **Public Scoreboard:** Navigate to Schedule page
- **Admin Panel:** `/admin-scoring`
- **Main Site:** `/`

---

**Need Help?** Contact the technical team for support.
