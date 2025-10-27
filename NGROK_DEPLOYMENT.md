# 🌐 Deploy Basketball Tournament Website on Ngrok

## 📋 What is Ngrok?
Ngrok creates a secure tunnel to your localhost, making your local development server accessible on the internet with a public URL.

---

## 🚀 Quick Deployment Steps

### Step 1: Install Ngrok

#### Option A: Download Installer (Recommended)
1. Go to https://ngrok.com/download
2. Download ngrok for Windows
3. Extract the zip file
4. Move `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

#### Option B: Using Chocolatey
```bash
choco install ngrok
```

#### Option C: Using Scoop
```bash
scoop install ngrok
```

---

### Step 2: Sign Up & Get Auth Token

1. Create free account at https://dashboard.ngrok.com/signup
2. Go to https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your authtoken
4. Run this command (replace with your token):

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Example:
```bash
ngrok config add-authtoken 2abcdefghijklmnop1234567890qrst_uvwxyz
```

---

### Step 3: Start Your React App

Open **Terminal 1**:
```bash
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"
npm start
```

Wait for the app to start (usually runs on http://localhost:3000)

---

### Step 4: Start Ngrok Tunnel

Open **Terminal 2** (new terminal):
```bash
ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

---

### Step 5: Access Your Website

Your website is now live at the **Forwarding URL**:
- **Public URL**: `https://abc123.ngrok-free.app`
- **Local URL**: `http://localhost:3000`

Share the ngrok URL with anyone to access your website!

---

## 🎯 Complete Commands (Copy-Paste)

### First Time Setup:
```bash
# 1. Install ngrok (if using Chocolatey)
choco install ngrok

# 2. Add your authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE

# 3. Start React app
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"
npm start

# 4. In new terminal, start ngrok
ngrok http 3000
```

### Subsequent Uses:
```bash
# Terminal 1: Start React app
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"
npm start

# Terminal 2: Start ngrok
ngrok http 3000
```

---

## 🔧 Advanced Options

### Custom Subdomain (Paid Plans Only)
```bash
ngrok http 3000 --subdomain=internmims-basketball
# URL: https://internmims-basketball.ngrok.io
```

### Custom Domain (Paid Plans)
```bash
ngrok http 3000 --hostname=basketball.yourdomain.com
```

### Basic Authentication
```bash
ngrok http 3000 --basic-auth="username:password"
```

### Regional Server
```bash
ngrok http 3000 --region=in  # India
ngrok http 3000 --region=us  # United States
ngrok http 3000 --region=eu  # Europe
ngrok http 3000 --region=ap  # Asia Pacific
```

### Inspect Traffic
Visit http://127.0.0.1:4040 to see all HTTP requests in real-time

---

## 📱 Batch Script for Easy Deployment

Save as `deploy-ngrok.bat`:

```batch
@echo off
echo ========================================
echo Basketball Tournament - Ngrok Deployment
echo ========================================
echo.

echo Step 1: Starting React App...
start cmd /k "cd /d "%~dp0" && npm start"
echo Waiting for React app to start...
timeout /t 10 /nobreak
echo.

echo Step 2: Starting Ngrok Tunnel...
start cmd /k "ngrok http 3000"
echo.

echo ========================================
echo Deployment Started!
echo ========================================
echo.
echo Your website will be available at the ngrok URL
echo Check the ngrok terminal for the public URL
echo.
pause
```

Double-click `deploy-ngrok.bat` to deploy!

---

## 🔒 Firebase Configuration for Ngrok

Since your app uses Firebase, you need to add the ngrok domain to Firebase:

### Step 1: Get Your Ngrok URL
After starting ngrok, copy the URL (e.g., `https://abc123.ngrok-free.app`)

### Step 2: Add to Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your ngrok domain: `abc123.ngrok-free.app`
6. Click **Add**

**Note**: Free ngrok URLs change every time you restart. You'll need to update Firebase each time.

---

## 🎨 Custom Configuration File

Create `ngrok.yml` in your project:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE
tunnels:
  basketball:
    proto: http
    addr: 3000
    inspect: true
    bind_tls: true
```

Start with:
```bash
ngrok start basketball
```

---

## 📊 Ngrok Dashboard Features

Visit https://dashboard.ngrok.com to:
- ✅ View active tunnels
- ✅ See request logs
- ✅ Monitor traffic
- ✅ Manage domains
- ✅ Configure settings

---

## 🐛 Troubleshooting

### Issue: "command not found: ngrok"
**Solution**: Add ngrok to PATH or use full path
```bash
# Use full path
C:\ngrok\ngrok.exe http 3000
```

### Issue: "ERR_NGROK_108"
**Solution**: You need to add authtoken
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Issue: "Tunnel not found"
**Solution**: Make sure React app is running on port 3000
```bash
# Check if app is running
netstat -ano | findstr :3000
```

### Issue: "Too many connections"
**Solution**: Free plan has limits. Upgrade or restart ngrok.

### Issue: Firebase not working
**Solution**: Add ngrok domain to Firebase authorized domains (see above)

---

## 💡 Tips & Best Practices

### 1. **Keep Terminals Open**
- Terminal 1: React app (npm start)
- Terminal 2: Ngrok tunnel
- Don't close either terminal while sharing

### 2. **Share the HTTPS URL**
- Always use the `https://` URL (not `http://`)
- More secure and works better with Firebase

### 3. **Monitor Traffic**
- Visit http://127.0.0.1:4040
- See all requests in real-time
- Debug issues easily

### 4. **Free Plan Limitations**
- ✅ Random URL each restart
- ✅ 40 connections/minute
- ✅ 1 online tunnel
- ❌ No custom subdomain
- ❌ No reserved domain

### 5. **Upgrade for Production**
Consider paid plans for:
- Custom subdomains
- Reserved domains
- More connections
- Multiple tunnels
- Better support

---

## 🆚 Ngrok vs Other Options

| Feature | Ngrok | Firebase Hosting | Vercel | Netlify |
|---------|-------|------------------|--------|---------|
| Setup Time | 2 min | 5 min | 3 min | 3 min |
| Free Tier | ✅ | ✅ | ✅ | ✅ |
| Custom Domain | 💰 | ✅ | ✅ | ✅ |
| Instant Deploy | ✅ | ❌ | ✅ | ✅ |
| Local Dev | ✅ | ❌ | ❌ | ❌ |
| SSL/HTTPS | ✅ | ✅ | ✅ | ✅ |
| Best For | Testing | Production | Production | Production |

---

## 🚀 Alternative: Deploy to Firebase Hosting (Permanent)

If you want a permanent URL instead of ngrok:

```bash
# Build production version
npm run build

# Deploy to Firebase
firebase deploy

# Your site will be at: https://your-project.web.app
```

See `firebase.json` for configuration.

---

## 📞 Support

### Ngrok Documentation
- Website: https://ngrok.com/docs
- Dashboard: https://dashboard.ngrok.com
- Community: https://ngrok.com/slack

### Your Project
- Repository: https://github.com/Kayde9/b_b
- Local: http://localhost:3000
- Ngrok: https://[random].ngrok-free.app

---

## ✅ Quick Checklist

Before sharing your ngrok URL:

- [ ] React app is running (npm start)
- [ ] Ngrok tunnel is active
- [ ] Firebase domain is authorized
- [ ] Admin panel login works
- [ ] Test on mobile device
- [ ] Check all routes work
- [ ] Verify real-time features work

---

## 🎉 You're Ready!

Your Basketball Tournament website is now accessible worldwide via ngrok!

**Steps to Deploy:**
1. ✅ Install ngrok
2. ✅ Add authtoken
3. ✅ Start React app (`npm start`)
4. ✅ Start ngrok (`ngrok http 3000`)
5. ✅ Share the ngrok URL

**Example URL**: `https://abc123.ngrok-free.app`

---

**Made with ❤️ for Inter-NMIMS Basketball Tournament 2025**
