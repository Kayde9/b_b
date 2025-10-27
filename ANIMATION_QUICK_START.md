# 🎬 3D Animation Quick Start

## ⚡ 60-Second Setup

### 1️⃣ Get Mapbox Token (2 minutes)
```
1. Go to: https://www.mapbox.com/
2. Sign up (free)
3. Copy your token from dashboard
```

### 2️⃣ Add Token to .env (30 seconds)
```bash
# Create or edit .env file in project root
REACT_APP_MAPBOX_TOKEN=pk.eyJ1abc...your_token_here
```

### 3️⃣ Start the App (10 seconds)
```bash
npm start
```

### 4️⃣ View Animation (2 ways)

**Option A - Direct**
```
Open: http://localhost:3000/journey-animation
```

**Option B - Via Getting Here**
```
1. Open: http://localhost:3000/getting-here
2. Click: "Watch 3D Animation" button
```

---

## 🎮 Using the Animation

### Controls
- **▶️ Start Animation** - Begin 18-second journey
- **🎮 3D View / 🗺️ Map View** - Toggle between views
- **Progress Bar** - Shows animation completion

### What to Expect
1. **Opening**: Camera at airport
2. **Journey**: Car travels with spinning basketball on top
3. **Effects**: Orange glowing trail follows car
4. **Arrival**: Basketball court appears at destination
5. **Finale**: Welcome message at NMIMS campus

---

## 🎨 Features Highlights

### 🚗 3D Car
- Bright orange sports car
- Realistic body, cabin, wheels
- Glowing yellow headlights
- Smooth movement along route

### 🏀 Basketball
- Spinning on top of car
- Orange glow effect
- Floating animation
- Realistic texture with lines

### ✨ Visual Effects
- Motion trail behind car
- Basketball court at destination
- 3D hoop marker
- Cinematic camera following
- Text overlays with journey info

---

## 🔧 Quick Customization

### Change Animation Speed
File: `src/components/AnimatedMap3D.js` (line ~523)
```javascript
const duration = 18000; // 18 seconds (18000ms)
// Change to: 15000 for 15s, 20000 for 20s
```

### Change Car Color
File: `src/components/AnimatedMap3D.js` (Car3D component)
```javascript
<meshStandardMaterial color="#FF6B35" />
// Try: "#FF0000" (red), "#FFA500" (orange)
```

### Change Map Style
File: `src/components/AnimatedMap3D.js` (map initialization)
```javascript
style: 'mapbox://styles/mapbox/satellite-streets-v12',
// Try: 'dark-v11', 'light-v11', 'streets-v12'
```

---

## 📱 Access Points

| Page | URL | Description |
|------|-----|-------------|
| Animation Page | `/journey-animation` | Full dedicated experience |
| Getting Here | `/getting-here` | Route info + animation link |
| Home | `/` | Main landing page |

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank screen | Add Mapbox token to .env |
| No animation | Click "Start Animation" button |
| Laggy | Close other tabs, reduce trail points |
| No token message | Restart server after adding token |

---

## 📦 What Was Created

### New Files
```
src/
├── components/
│   ├── AnimatedMap3D.js          # Main animation component
│   └── AnimatedMap3D.css         # Animation styling
├── pages/
│   ├── JourneyAnimation.js       # Dedicated page
│   └── JourneyAnimation.css      # Page styling
```

### Updated Files
```
src/
├── App.js                        # Added /journey-animation route
├── pages/
│   ├── GettingHere.js           # Added promo section
│   └── GettingHere.css          # Added promo styling
```

---

## 🎯 Key Specs

- **Duration**: 15-20 seconds (default: 18s)
- **Resolution**: Responsive (Desktop/Tablet/Mobile)
- **Theme**: Basketball-themed orange and black
- **Views**: Dual (Satellite Map + 3D Scene)
- **Animation**: 60 FPS target
- **Style**: Cinematic drone-following camera

---

## 🏀 Route Details

- **Start**: Rajiv Gandhi International Airport, Shamshabad
- **End**: NMIMS Hyderabad, Green Industrial Park, Jadcherla
- **Distance**: ~68 km
- **Travel Time**: ~59 minutes (real)
- **Animation Time**: 15-20 seconds

---

## 🎉 Quick Demo Script

```
1. Open http://localhost:3000/journey-animation
2. Click "▶️ Start Animation"
3. Watch car travel from airport
4. See spinning basketball on car roof
5. Notice orange glowing trail
6. Watch basketball court appear at destination
7. Read arrival message at NMIMS campus
8. Click "🎮 3D View" to see pure 3D scene
9. Click "🗺️ Map View" to return to satellite
```

**Total Experience**: ~20 seconds of awesome! 🚗🏀✨

---

## 📖 Full Documentation

For detailed information, see: `3D_ANIMATION_GUIDE.md`

---

**Made for Inter-NMIMS Basketball Tournament 2025** 🏀
