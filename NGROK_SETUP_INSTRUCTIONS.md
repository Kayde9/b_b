# 🚀 Ngrok Setup & Deployment Instructions

## Your Ngrok Token
```
34fA14rBPXvVSt0H89BWiveih1c_3xao2rp2b9pR9ZR9j5tjJ
```

---

## 📥 Step 1: Install Ngrok

### Option A: Download Directly (Recommended)

1. **Download ngrok**
   - Go to: https://ngrok.com/download
   - Click "Download for Windows"
   - Save the zip file

2. **Extract and Install**
   ```
   - Extract the downloaded zip file
   - You'll get ngrok.exe
   - Move ngrok.exe to: C:\Windows\System32\
   ```

3. **Verify Installation**
   Open Command Prompt and run:
   ```bash
   ngrok version
   ```
   Should show: `ngrok version 3.x.x`

### Option B: Using Chocolatey (If you have it)

```bash
choco install ngrok
```

### Option C: Using Scoop (If you have it)

```bash
scoop install ngrok
```

---

## ⚙️ Step 2: Configure Ngrok with Your Token

Open Command Prompt and run:

```bash
ngrok config add-authtoken 34fA14rBPXvVSt0H89BWiveih1c_3xao2rp2b9pR9ZR9j5tjJ
```

You should see:
```
Authtoken saved to configuration file: C:\Users\...\ngrok.yml
```

---

## 🚀 Step 3: Deploy Your Website

### Method 1: Use the Batch Script (Easiest)

1. Double-click `deploy-with-ngrok.bat` in your project folder
2. Wait for React app to start
3. Ngrok will open in a new window
4. Look for the "Forwarding" URL

### Method 2: Manual Deployment

**Terminal 1 - Start React App:**
```bash
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"
npm start
```

**Terminal 2 - Start Ngrok (after React starts):**
```bash
ngrok http 3000
```

---

## 🌐 Step 4: Get Your Public URL

In the ngrok terminal, look for:

```
Session Status                online
Account                       Your Account
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              THIS IS YOUR PUBLIC URL!
```

**Your website is live at**: `https://abc123.ngrok-free.app`

---

## 🔥 Step 5: Configure Firebase (IMPORTANT!)

Your app won't work properly until you add the ngrok domain to Firebase:

1. **Copy your ngrok domain** (e.g., `abc123.ngrok-free.app`)

2. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select project: `internmimsbasketball`

3. **Add Authorized Domain**
   - Click **Authentication** (left sidebar)
   - Click **Settings** tab
   - Scroll to **Authorized domains**
   - Click **Add domain**
   - Paste: `abc123.ngrok-free.app` (without https://)
   - Click **Add**

**Note**: Free ngrok URLs change each restart, so you'll need to update Firebase each time.

---

## 📊 Step 6: Monitor Your Deployment

### Ngrok Web Interface
Visit: http://127.0.0.1:4040

Features:
- ✅ See all HTTP requests in real-time
- ✅ Inspect request/response details
- ✅ Replay requests
- ✅ Monitor traffic

### Test Your Website
1. Open the ngrok URL in your browser
2. Test all pages:
   - Home page
   - Schedule
   - Gallery
   - Admin panel
   - Getting Here
   - Contact

---

## 🎯 Quick Commands Reference

```bash
# Configure token (one-time)
ngrok config add-authtoken 34fA14rBPXvVSt0H89BWiveih1c_3xao2rp2b9pR9ZR9j5tjJ

# Start React app
npm start

# Start ngrok tunnel
ngrok http 3000

# Check ngrok version
ngrok version

# View ngrok config
ngrok config check
```

---

## 🐛 Troubleshooting

### Problem: "ngrok: command not found"

**Solution 1**: Add to PATH
```bash
# Add C:\path\to\ngrok to your system PATH
# Then restart Command Prompt
```

**Solution 2**: Use full path
```bash
C:\path\to\ngrok.exe http 3000
```

**Solution 3**: Move to System32
```bash
# Move ngrok.exe to C:\Windows\System32\
```

### Problem: "ERR_NGROK_108"

**Solution**: Token not configured
```bash
ngrok config add-authtoken 34fA14rBPXvVSt0H89BWiveih1c_3xao2rp2b9pR9ZR9j5tjJ
```

### Problem: "Tunnel not found"

**Solution**: Make sure React is running first
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### Problem: Firebase not working on ngrok

**Solution**: Add ngrok domain to Firebase authorized domains (see Step 5)

### Problem: Admin panel not loading

**Solution**: 
1. Check Firebase authorized domains
2. Clear browser cache
3. Try incognito mode

---

## ⚠️ Important Notes

### Free Ngrok Limitations:
- ✅ Random URL each restart
- ✅ 40 connections per minute
- ✅ 1 online tunnel at a time
- ❌ No custom subdomain
- ❌ URL expires when you stop ngrok

### Keep Running:
- Don't close the React terminal
- Don't close the ngrok terminal
- Both must stay open while sharing

### Security:
- Your ngrok token is saved in: `C:\Users\...\ngrok.yml`
- Don't share your authtoken publicly
- Free plan URLs are public (anyone can access)

---

## 🎉 Success Checklist

- [ ] Ngrok installed and in PATH
- [ ] Authtoken configured
- [ ] React app running (Terminal 1)
- [ ] Ngrok tunnel active (Terminal 2)
- [ ] Got public URL from ngrok
- [ ] Added domain to Firebase
- [ ] Tested website on ngrok URL
- [ ] All pages working
- [ ] Admin panel accessible

---

## 📞 Need Help?

### Ngrok Resources
- Documentation: https://ngrok.com/docs
- Dashboard: https://dashboard.ngrok.com
- Download: https://ngrok.com/download

### Your Project
- Repository: https://github.com/Kayde9/b_b
- Local URL: http://localhost:3000
- Ngrok URL: https://[random].ngrok-free.app

---

## 🚀 Alternative: Permanent Deployment

If you want a permanent URL instead of ngrok:

### Firebase Hosting (Recommended)
```bash
npm run build
firebase deploy
# URL: https://internmimsbasketball.web.app
```

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

---

**Your Basketball Tournament website is ready to share with ngrok!** 🏀🌐

**Token**: `34fA14rBPXvVSt0H89BWiveih1c_3xao2rp2b9pR9ZR9j5tjJ`
