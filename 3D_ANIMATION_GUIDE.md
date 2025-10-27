# 🎥 3D Animated Map Visualization Guide

## Overview
This project now includes a stunning **15-20 second 3D animated map visualization** showing a car traveling from Rajiv Gandhi International Airport to NMIMS Hyderabad Campus with basketball-themed elements.

---

## 🎬 Features Implemented

### ✅ Core Animation Features
- **3D Satellite-Style Map**: Uses Mapbox GL with 3D terrain and satellite-streets style
- **Animated 3D Car**: Sleek orange/red sports car model with realistic body, cabin, wheels, and glowing headlights
- **Spinning Basketball**: Rotating 3D basketball on top of the car with glow effects and floating animation
- **Drone-Style Camera**: Cinematic aerial perspective that follows the car smoothly
- **Motion Trail Effect**: Orange glowing trail behind the car with pulsing basketball-themed effects
- **Basketball Court Marker**: 3D basketball court with hoop at the NMIMS destination with glowing effects

### ✨ Visual Elements
- **Modern Cinematic Look**: Warm lighting with directional, ambient, and hemisphere lights
- **Text Overlays**: 
  - Journey title: "✈️ Rajiv Gandhi International Airport → 🏀 NMIMS Hyderabad"
  - Tournament welcome message
  - Arrival message when reaching destination
- **Basketball Theme**: Orange route lines, glowing basketball effects, court markers
- **Dual View Modes**: Switch between Mapbox satellite view and full 3D scene
- **Progress Bar**: Real-time animation progress indicator

### 🎮 Interactive Controls
- **Start Animation Button**: Initiates the 15-20 second journey
- **View Toggle**: Switch between satellite map and 3D scene views
- **Auto-play Support**: Seamless animation loop with progress tracking

---

## 📁 Files Created

### Components
- **`src/components/AnimatedMap3D.js`** - Main 3D animation component with:
  - `Car3D` - 3D car model with body, cabin, wheels, and headlights
  - `Basketball` - Spinning, floating basketball with glow
  - `BasketballCourtMarker` - Destination marker with court and hoop
  - `MotionTrail` - Orange glowing trail effect
  - `AnimatedScene` - Main scene orchestration
  
- **`src/components/AnimatedMap3D.css`** - Styling for the animation interface

### Pages
- **`src/pages/JourneyAnimation.js`** - Dedicated page showcasing the animation with:
  - Hero section with animation description
  - Feature cards explaining each element
  - Journey details section
  - Call-to-action for tournament registration

- **`src/pages/JourneyAnimation.css`** - Page styling

### Integration Updates
- **`src/App.js`** - Added route `/journey-animation`
- **`src/pages/GettingHere.js`** - Added prominent promo card linking to animation
- **`src/pages/GettingHere.css`** - Added promo section styling

---

## 🚀 How to Use

### Step 1: Setup Mapbox Token

1. Get a free Mapbox API token:
   - Visit [https://www.mapbox.com/](https://www.mapbox.com/)
   - Sign up for a free account
   - Navigate to your account dashboard
   - Copy your default public token

2. Add the token to your `.env` file:
   ```env
   REACT_APP_MAPBOX_TOKEN=your_actual_token_here
   ```

### Step 2: Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

### Step 3: Access the Animation

**Option 1: Direct URL**
- Navigate to: `http://localhost:3000/journey-animation`

**Option 2: Via Getting Here Page**
- Go to: `http://localhost:3000/getting-here`
- Click the prominent "Watch 3D Animation" button at the top

**Option 3: Via Navbar**
- Visit any page and navigate to "Getting Here"
- Click the animation promo card

---

## 🎯 Animation Flow (15-20 seconds)

1. **0-2s**: Camera starts at airport location, showing the starting point
2. **2-4s**: Camera zooms out to reveal the full route
3. **4-16s**: Car travels along the route with:
   - Spinning basketball on top
   - Orange motion trail behind
   - Smooth camera following
   - Destination marker appears at ~80% progress
4. **16-18s**: Car reaches NMIMS campus
5. **18-20s**: Arrival message displays with campus details

---

## 🎨 Customization Options

### Adjust Animation Duration
In `AnimatedMap3D.js`, line ~523:
```javascript
const duration = 18000; // Change this value (milliseconds)
```

### Change Car Color
In `AnimatedMap3D.js`, Car3D component:
```javascript
<meshStandardMaterial color="#FF6B35" /> // Change hex color
```

### Modify Camera Angles
In `AnimatedMap3D.js`, AnimatedScene component:
```javascript
const offset = new THREE.Vector3(0, 5, -8); // Adjust x, y, z values
```

### Change Map Style
In `AnimatedMap3D.js`, map initialization:
```javascript
style: 'mapbox://styles/mapbox/satellite-streets-v12', // Try: dark-v11, light-v11, streets-v12
```

---

## 🏀 Basketball-Themed Elements

### Spinning Basketball
- **Rotation**: 2 rad/s on Y-axis, 0.5 rad/s on X-axis
- **Float Effect**: Sine wave animation for realistic hover
- **Glow**: Point light with orange color (#FF6B00)
- **Texture**: Black lines creating basketball pattern

### Basketball Court Marker
- **Court Base**: Brown wooden texture (2m x 3m)
- **Court Lines**: White ring marking the key
- **Hoop**: Orange glowing torus at regulation height (1.5m)
- **Pole**: Metallic gray cylinder
- **Glow Effect**: Pulsing orange cylinder at base

### Motion Trail
- **Color**: Orange (#FF6B00) with glow
- **Width**: 0.05 units
- **Length**: Last 50 position points
- **Effect**: Pulsing opacity animation

---

## 📱 Responsive Design

The animation is fully responsive and optimized for:
- **Desktop**: Full 600px height, dual-column layout
- **Tablet**: 500px height, adjusted controls
- **Mobile**: 400px height, stacked layout

---

## 🛠️ Technical Stack

- **React 18.2** - Component framework
- **React Three Fiber 8.15** - React renderer for Three.js
- **@react-three/drei 9.92** - Useful helpers for R3F
- **Three.js 0.159** - 3D graphics library
- **Mapbox GL 3.0** - Satellite map rendering
- **React Map GL 7.1** - React wrapper for Mapbox
- **Framer Motion 10.16** - UI animations
- **Lucide React 0.294** - Icon library

---

## 🎓 Key Components Breakdown

### 1. Car3D Component
```javascript
<Car3D position={[x, y, z]} rotation={[rx, ry, rz]} scale={1} />
```
- Main body: 1 x 0.3 x 1.8 units
- Cabin: 0.8 x 0.4 x 0.8 units  
- 4 wheels with cylindrical geometry
- 2 glowing headlights

### 2. Basketball Component
```javascript
<Basketball position={[x, y, z]} />
```
- Sphere geometry (0.25 radius)
- Self-rotating mesh reference
- Floating animation via useFrame
- Point light for glow

### 3. BasketballCourtMarker Component
```javascript
<BasketballCourtMarker position={[x, y, z]} />
```
- Court plane with wooden texture
- White ring lines
- 3D hoop (torus geometry)
- Metallic pole
- Pulsing glow cylinder

---

## 🐛 Troubleshooting

### Animation Not Showing
**Issue**: Blank screen or placeholder message  
**Solution**: 
1. Verify Mapbox token in `.env` file
2. Restart development server after adding token
3. Check browser console for errors

### Performance Issues
**Issue**: Laggy or stuttering animation  
**Solution**:
1. Close other browser tabs
2. Reduce trail points (change `50` to `20` in AnimatedScene)
3. Lower animation duration for faster completion
4. Disable 3D terrain in map settings

### Car Not Moving
**Issue**: Car appears but doesn't animate  
**Solution**:
1. Click "Start Animation" button
2. Check progress bar for movement
3. Verify `isPlaying` state is true
4. Refresh page and try again

### Basketball Not Spinning
**Issue**: Basketball appears static  
**Solution**:
1. Check browser WebGL support
2. Update graphics drivers
3. Try different browser (Chrome recommended)

---

## 🎉 Additional Features

### Auto-Destination Reveal
- Basketball court marker appears at 80% progress
- Creates anticipation as car approaches

### Dynamic Text Overlays
- Journey title always visible at top
- Arrival message appears at 95% progress
- Smooth fade-in animations

### Dual View Experience
- **Map View**: Real satellite imagery with 3D terrain
- **3D View**: Pure Three.js scene with full control
- Toggle between views during animation

### Progress Tracking
- Visual progress bar shows completion
- Shimmer effect on progress indicator
- Smooth linear transitions

---

## 🎨 Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Orange | Basketball/Trail/Accents | #FF6B00 |
| Secondary Orange | Gradient End | #FF8C00 |
| Car Body | Bright Orange | #FF6B35 |
| Basketball Court | Wood Brown | #8B4513 |
| Text Primary | White | #FFFFFF |
| Text Secondary | Light Gray | #CCCCCC |
| Background | Dark Black | #0A0A0A |
| Glass Effect | Translucent Gray | rgba(26, 26, 26, 0.7) |

---

## 📊 Animation Performance

- **Target FPS**: 60 FPS
- **Animation Duration**: 18 seconds (configurable)
- **Frame Updates**: ~1080 frames total
- **3D Objects**: ~25 meshes (car, basketball, court, trail)
- **Lighting**: 4 lights (ambient, directional, hemisphere, point)
- **Recommended RAM**: 4GB minimum
- **WebGL**: Version 2.0 required

---

## 🚀 Future Enhancements

Potential additions you could implement:

1. **Sound Effects**
   - Car engine sound
   - Basketball bounce at destination
   - Crowd cheer audio

2. **More Route Points**
   - Use actual road data from Mapbox Directions API
   - Curved paths following highways

3. **Multiple Routes**
   - Animate different starting points
   - Show all NMIMS campuses

4. **Interactive Camera**
   - User-controlled camera during animation
   - Multiple camera angle presets

5. **Export Video**
   - Record and download animation as MP4
   - Share on social media

6. **Enhanced Physics**
   - Realistic car suspension
   - Basketball bounce physics at end

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure Mapbox token is valid
4. Check browser console for error messages

---

## 🎊 Credits

**Created for**: Inter-NMIMS Basketball Tournament 2025  
**Campus**: NMIMS Hyderabad, Jadcherla  
**Animation Style**: Cinematic drone-style basketball-themed journey  
**Tech Stack**: React, Three.js, Mapbox GL

---

**Enjoy the Journey! 🏀🚗✨**
