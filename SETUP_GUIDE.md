# 🏀 Inter-NMIMS Basketball Tournament 2025 - Setup Guide

## 📋 What's Been Created

A fully functional, modern 3D interactive website with the following features:

### ✨ Pages & Features

1. **Home Page** (`/`)
   - 3D animated basketball using Three.js
   - Hero section with bouncing basketball
   - Tournament highlights with animated cards
   - About section with statistics
   - Call-to-action buttons

2. **Getting Here Page** (`/getting-here`)
   - Interactive 3D map with Mapbox integration
   - Route tabs (Airport, Railway Station, Bus Stand)
   - Travel options with pricing and timings
   - Basketball-themed map markers
   - "Book a Cab" and "Open in Google Maps" buttons

3. **Schedule Page** (`/schedule`)
   - Day-by-day match schedule (3 days)
   - Animated match cards with basketball theme
   - VS matchups with spinning basketball logos
   - Tournament format information
   - Featured championship match

4. **Gallery Page** (`/gallery`)
   - Photo grid with filter options
   - Instagram integration CTA
   - Image lightbox/modal
   - Video highlights section
   - Animated hover effects

5. **Contact Page** (`/contact`)
   - Team registration form
   - Organizing committee contacts
   - Accommodation options with pricing
   - Campus address and map links

### 🎨 Design Features

- **Color Scheme**: Orange (#F97316), Black (#000000), White (#FFFFFF)
- **Typography**: Bebas Neue for headings, Poppins for body
- **Animations**: Framer Motion for smooth transitions
- **3D Effects**: Three.js for basketball animations
- **Glassmorphism**: Modern card designs with blur effects
- **Responsive**: Fully mobile-friendly

### 🛠️ Technologies Used

- React 18
- React Router v6 (Navigation)
- Three.js & React Three Fiber (3D animations)
- Framer Motion (Animations)
- Mapbox GL JS (Interactive maps)
- Lucide React (Icons)

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

The dependencies are currently being installed. If not complete, run:

```bash
cd "c:/Users/KEVINDEEP SINGH/OneDrive/Desktop/InterNMIMS"
npm install
```

This will install all required packages including React, Three.js, Framer Motion, Mapbox, and more.

### Step 2: Configure Mapbox (Optional but Recommended)

The interactive map requires a Mapbox API token:

1. Go to [https://www.mapbox.com/](https://www.mapbox.com/)
2. Sign up for a free account
3. Get your access token from the dashboard
4. Create a `.env` file in the project root:

```bash
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

**Note:** The website will work without Mapbox, but will show a placeholder map instead.

### Step 3: Start Development Server

```bash
npm start
```

The website will open at `http://localhost:3000`

### Step 4: Build for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📁 Project Structure

```
InterNMIMS/
├── public/
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO robots file
├── src/
│   ├── components/
│   │   ├── Basketball3D.js      # 3D basketball component
│   │   ├── LoadingScreen.js     # Loading animation
│   │   ├── Navbar.js            # Navigation bar
│   │   ├── Footer.js            # Footer component
│   │   ├── InteractiveMap.js    # Mapbox map component
│   │   └── *.css                # Component styles
│   ├── pages/
│   │   ├── Home.js              # Home page
│   │   ├── GettingHere.js       # Getting Here page
│   │   ├── Schedule.js          # Schedule page
│   │   ├── Gallery.js           # Gallery page
│   │   ├── Contact.js           # Contact page
│   │   └── *.css                # Page styles
│   ├── App.js              # Main app component
│   ├── App.css             # Global app styles
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
```

---

## 🎯 Customization Guide

### Update Match Schedule

Edit `src/pages/Schedule.js` and modify the `scheduleData` object:

```javascript
const scheduleData = {
  day1: {
    date: 'November 8, 2025',
    matches: [
      {
        time: '10:00 AM',
        court: 'Court A',
        team1: 'Your Team 1',
        team2: 'Your Team 2',
        type: 'Group Stage'
      }
      // Add more matches...
    ]
  }
}
```

### Add Real Images to Gallery

Replace the placeholder items in `src/pages/Gallery.js`:

```javascript
const galleryItems = [
  { 
    id: 1, 
    type: 'action', 
    title: 'Your Title',
    description: 'Your Description',
    image: '/path/to/image.jpg'  // Add this
  }
]
```

### Update Contact Information

Edit `src/pages/Contact.js` and `src/components/Footer.js` to update:
- Organizing committee details
- Phone numbers
- Email addresses
- Accommodation options

### Change Tournament Dates

Update dates in:
- `src/pages/Home.js` - Hero section
- `src/pages/Schedule.js` - Schedule data
- `src/pages/Contact.js` - Event information

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

1. Push code to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `build`
5. Add environment variables in Netlify dashboard

### Option 2: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables

### Option 3: GitHub Pages

1. Install: `npm install --save gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/InterNMIMS",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Run: `npm run deploy`

---

## 🐛 Troubleshooting

### Dependencies Won't Install

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Map Not Showing

- Ensure `.env` file has valid `REACT_APP_MAPBOX_TOKEN`
- Restart development server after adding token
- Check browser console for errors

### 3D Basketball Not Rendering

- Clear browser cache
- Check if WebGL is supported in your browser
- Update graphics drivers

### Build Errors

- Ensure Node.js version is 14+ (`node --version`)
- Update npm: `npm install -g npm@latest`

---

## 📝 Additional Features to Add

### Future Enhancements

1. **Live Scores**: Integrate real-time score updates
2. **Live Streaming**: Embed YouTube/Twitch streams
3. **Team Profiles**: Dedicated pages for each team
4. **Statistics Dashboard**: Player stats and leaderboards
5. **Social Media Feed**: Live Twitter/Instagram feeds
6. **Ticket Booking**: Online registration with payment
7. **Push Notifications**: Match reminders
8. **Dark/Light Mode Toggle**: Theme switcher

---

## 🤝 Support

For any issues or questions:

- Check the browser console for errors
- Ensure all dependencies are installed
- Verify Node.js version compatibility
- Review the documentation above

---

## 📄 License

Created for Inter-NMIMS Basketball Tournament 2025
© NMIMS Hyderabad Campus

**Made with ❤️ and 🏀**
