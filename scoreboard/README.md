# 🏀 Live Basketball Scoreboard System

A complete responsive live basketball scoring website with Firebase integration for the Inter-NMIMS Basketball Tournament 2025.

## 🌟 Features

### Public Scoreboard (`index.html`)
- **Real-time score display** with LED-style digital fonts
- **Live game timer** with pause/resume indicators
- **Team names and scores** with animated updates
- **Player statistics** showing points and fouls
- **Live updates feed** with timestamped events
- **Mobile responsive design** with basketball theme
- **Auto-updating** without page refresh

### Admin Panel (`admin.html`)
- **Secure Google authentication** for admin access
- **Team name management** and match setup
- **Score controls** (+1, +2, +3 points, -1, reset)
- **Game timer controls** (start, pause, reset, custom time)
- **Player management** (add players, track points/fouls)
- **Quarter progression** and match status
- **Data export** functionality
- **Real-time sync** with public scoreboard

## 🚀 Quick Start

### 1. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project: `nmims-basketball-scoreboard`

2. **Enable Realtime Database**
   - Go to Realtime Database → Create database
   - Choose "Start in test mode" for development
   - Note your database URL

3. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Google" sign-in provider
   - Add your domain to authorized domains

4. **Get Firebase Config**
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config object

5. **Update Firebase Config**
   ```javascript
   // Edit js/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### 2. File Structure
```
/scoreboard/
├── index.html          # Public live scoreboard
├── admin.html          # Admin scoring panel
├── js/
│   ├── firebase.js     # Firebase configuration
│   ├── scoreboard.js   # Public scoreboard logic
│   └── admin.js        # Admin panel logic
├── css/
│   └── tailwind.css    # Custom styles (optional)
└── assets/
    └── logo.png        # NMIMS logo (optional)
```

### 3. Deployment Options

#### Option A: Local Development
1. Use a local web server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # VS Code Live Server extension
   ```
2. Open `http://localhost:8000`

#### Option B: Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize hosting: `firebase init hosting`
3. Deploy: `firebase deploy`

#### Option C: Netlify/Vercel
1. Drag and drop the `/scoreboard` folder
2. Or connect your GitHub repository

### 4. Usage

1. **Admin Access**
   - Open `admin.html`
   - Sign in with Google
   - Set up team names and match details

2. **Public Scoreboard**
   - Open `index.html` 
   - Displays real-time updates from admin panel
   - Share this URL with viewers

3. **Live Scoring**
   - Use admin panel to update scores
   - Control game timer
   - Manage player stats
   - Changes appear instantly on public scoreboard

## 🎨 Customization

### Colors & Branding
The system uses basketball-themed colors:
- **Primary Orange**: `#FF6B35` (basketball-orange)
- **Dark Orange**: `#E55529` (basketball-dark-orange)
- **Background**: Dark gradient with orange accents

### Typography
- **Digital Scores**: Orbitron font for LED-style numbers
- **UI Text**: Inter font for modern readability

### Animations
- **Score Updates**: Flash animation on score changes
- **Basketball Icon**: Bounce animation on scoring
- **Glow Effects**: Pulsing borders and shadows

## 📱 Mobile Responsiveness

The scoreboard is fully responsive with:
- **Breakpoints**: Mobile-first design with md/lg breakpoints
- **Touch-friendly**: Large buttons for mobile admin controls
- **Readable text**: Scaled fonts and spacing for small screens
- **Optimized layout**: Stacked elements on mobile

## 🔧 Technical Details

### Firebase Database Structure
```json
{
  "matches": {
    "current": {
      "teamA": "NMIMS Mumbai",
      "teamB": "NMIMS Hyderabad",
      "scoreA": 54,
      "scoreB": 52,
      "timer": "07:45",
      "isRunning": true,
      "quarter": 2,
      "players": {
        "player1": {
          "name": "Player Name",
          "team": "A",
          "points": 12,
          "fouls": 2
        }
      },
      "lastUpdated": 1635968400000
    }
  }
}
```

### Real-time Updates
- Uses Firebase Realtime Database listeners
- Automatic reconnection on connection loss
- Optimistic UI updates with error handling
- Minimal data transfer for performance

### Security
- Google Authentication required for admin access
- Database rules can restrict write access
- Client-side validation with server-side verification

## 🏀 Integration with Main Site

### Embedding in Schedule Page
Add an iframe to your main tournament site:

```html
<!-- In your main site's schedule page -->
<div class="scoreboard-container">
    <iframe 
        src="https://your-scoreboard-domain.com" 
        width="100%" 
        height="800px"
        frameborder="0"
        title="Live Basketball Scoreboard">
    </iframe>
</div>
```

### Direct Link Integration
Add a "Live Scoreboard" button to your navigation:

```html
<a href="https://your-scoreboard-domain.com" 
   target="_blank" 
   class="live-scoreboard-btn">
    🏀 Live Scoreboard
</a>
```

## 🎯 Advanced Features

### Sound Effects (Optional)
Add to `scoreboard.js`:
```javascript
function playScoreSound() {
    const audio = new Audio('assets/score-sound.mp3');
    audio.play().catch(e => console.log('Audio play failed'));
}
```

### Match History
Extend Firebase structure to save completed matches:
```javascript
// Save match to history when ended
const historyRef = ref(database, `matches/history/${Date.now()}`);
set(historyRef, currentMatchData);
```

### Statistics Dashboard
Create additional admin views for:
- Match statistics and analytics
- Player performance over time
- Tournament standings and brackets

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Check Firebase config credentials
   - Verify database URL format
   - Ensure project is active

2. **Authentication Not Working**
   - Check authorized domains in Firebase Auth
   - Verify Google sign-in configuration
   - Test in incognito mode

3. **Real-time Updates Not Working**
   - Check browser console for errors
   - Verify Firebase database rules
   - Test internet connection stability

4. **Mobile Display Issues**
   - Check viewport meta tag
   - Test on actual devices
   - Verify TailwindCSS responsiveness

### Debug Mode
Add to browser console:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
location.reload();
```

## 📞 Support

For technical support or customization:
- Check browser console for error messages
- Test Firebase connection manually
- Verify all file paths are correct
- Ensure proper hosting setup

## 🏆 Made for Inter-NMIMS Basketball Tournament 2025

This live scoreboard system enhances the tournament experience by providing:
- **Real-time engagement** for remote viewers
- **Professional presentation** for live events
- **Easy management** for tournament officials
- **Mobile accessibility** for all participants

**November 8-9, 2025 | NMIMS Hyderabad Campus** 🏀