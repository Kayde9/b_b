# 🏀 Inter-NMIMS Basketball Tournament 2025

A web application for the Inter-NMIMS Basketball Tournament 2025. Features real-time basketball scoring, admin panel for match control, and tournament information pages.

## ✨ Features

### Public Pages
- **Home Page** - Landing page with 3D basketball animation
- **Schedule** - Match schedule display
- **Gallery** - Tournament photo gallery
- **Getting Here** - Venue directions and map
- **Contact** - Contact information

### Live Scoreboard System
- **Public Scoreboard** (`/scoreboard/index.html`) - Real-time score display for spectators
- **Admin Panel** (`/scoreboard/admin.html`) - Complete match control system

### Admin Panel Features
- Real-time score updates
- Player management (add, track points, fouls)
- Match timer control (quarters, overtime)
- Substitution system
- Timeout management
- Match scheduling
- Save and view past matches
- Excel player import/export

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase account

### Installation & Running

```bash
# Install dependencies
npm install

# Start React app (Main website)
npm start
# Runs on http://localhost:3000

# Start Scoreboard (In separate terminal)
cd scoreboard
python -m http.server 8000
# Runs on http://localhost:8000
```

### Environment Variables
Create `.env` file in root:
```env
REACT_APP_ADMIN_PASSWORD=your_password
```

---

## 📁 Project Structure

```
InterNMIMS/
├── public/                  # Static files
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── LiveScoreboard.js
│   │   ├── Basketball3D.js
│   │   └── LoadingScreen.js
│   ├── pages/              # Page components
│   │   ├── Home.js
│   │   ├── Schedule.js
│   │   ├── AdminScoring.js  # Main admin panel
│   │   ├── Gallery.js
│   │   ├── Contact.js
│   │   ├── GettingHere.js
│   │   └── JourneyAnimation.js
│   ├── firebase.js         # Firebase config
│   ├── App.js
│   └── index.js
├── scoreboard/              # Standalone scoring system
│   ├── index.html          # Public scoreboard view
│   ├── admin.html          # Admin control panel
│   ├── css/
│   │   └── tailwind.css
│   ├── js/
│   │   ├── firebase.js
│   │   ├── scoreboard.js
│   │   └── admin.js
│   └── assets/
├── database.rules.json     # Firebase security rules
├── firebase.json
├── package.json
└── README.md
```

---

## 🔧 Technologies

- **React 18.2.0** - Frontend framework
- **React Router 6.20.0** - Routing
- **Firebase 11.0.1** - Real-time database
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **XLSX** - Excel import/export
- **TailwindCSS** - Styling

---

## 🎮 Using the Admin Panel

### Access
1. Navigate to `http://localhost:3000/admin-scoring`
2. Login with password (set in `.env`)

### Match Control Flow
1. **Menu** → Schedule match, add players
2. **Setup** → Review teams and players  
3. **Select Playing 5** → Choose starting lineup
4. **Match** → Live scoring with timer control

### Features
- Add/remove players
- Track points (1pt, 2pt, 3pt)
- Track fouls (max 6 per player)
- Substitute players
- Control quarter timer
- Request timeouts
- Save match history

---

## � Firebase Setup

### Database Structure
```json
{
  "matches": {
    "current": {
      "teamA": "Team Name",
      "teamB": "Team Name",
      "scoreA": 0,
      "scoreB": 0,
      "quarter": 1,
      "timerSeconds": 600,
      "isRunning": false,
      "players": {...},
      "teamAPlaying": [...],
      "teamBPlaying": [...]
    },
    "scheduled": {...},
    "past": {...}
  }
}
```

### Security Rules
- Public read for current match (scoreboard view)
- Authenticated write for admin operations
- See `database.rules.json` for details

---
