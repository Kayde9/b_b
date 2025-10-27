# 🚀 PRE-DEPLOYMENT CHECKLIST
## Inter-NMIMS Basketball Tournament 2025

**Last Updated:** October 24, 2025  
**Status:** Ready for Security Implementation

---

## ⚠️ CRITICAL - MUST COMPLETE BEFORE DEPLOYMENT

### 🔐 Firebase Authentication Setup
- [ ] **Enable Firebase Authentication**
  - Go to Firebase Console → Authentication → Get Started
  - Enable Email/Password authentication method
  
- [ ] **Create Admin Accounts**
  - Create at least 2 admin accounts (primary + backup)
  - Email format: `admin@nmims.edu` or your institutional email
  - Use strong passwords (min 12 characters, mixed case, numbers, symbols)
  - **Document credentials securely** (use password manager)
  
- [ ] **Set Up Admin Roles in Database**
  - Go to Firebase Console → Realtime Database → Data
  - Create `/admins` node
  - Add admin UIDs with value `true`
  - Example: `admins/ABC123xyz456: true`
  
- [ ] **Update AdminScoring.js**
  - Replace hardcoded password authentication with Firebase Auth
  - Implement proper login/logout functionality
  - Add admin role verification
  - Test login flow thoroughly

### 🛡️ Firebase Security Rules
- [x] **Update Database Rules** ✅ (Already updated in `database.rules.json`)
  - Admin-only write access implemented
  - Input validation added
  - Length constraints enforced
  
- [ ] **Deploy Updated Rules**
  ```bash
  firebase deploy --only database
  ```
  
- [ ] **Test Security Rules**
  - Test public read access (should work)
  - Test unauthorized write (should fail)
  - Test admin write access (should work)
  - Test input validation (invalid data should be rejected)

### 🔒 Firebase App Check (Recommended)
- [ ] **Enable Firebase App Check**
  - Go to Firebase Console → App Check
  - Register your web app
  - Choose reCAPTCHA v3 provider
  - Get site key and implement in code
  
- [ ] **Configure App Check Enforcement**
  - Set enforcement mode for Realtime Database
  - Test with App Check enabled

---

## 🟠 HIGH PRIORITY - COMPLETE BEFORE GOING LIVE

### 🌐 Hosting Configuration
- [x] **Update firebase.json** ✅ (Security headers added)
  - HTTPS enforcement configured
  - Security headers added
  - Cache policies set
  
- [ ] **Build Production Version**
  ```bash
  npm run build
  ```
  
- [ ] **Test Production Build Locally**
  ```bash
  npx serve -s build
  ```
  
- [ ] **Deploy to Firebase Hosting**
  ```bash
  firebase deploy --only hosting
  ```

### 🔐 Environment Variables
- [ ] **Set Up Mapbox Token**
  - Create `.env` file (already gitignored ✅)
  - Add: `REACT_APP_MAPBOX_TOKEN=your_token_here`
  - Get token from: https://www.mapbox.com/
  - Configure URL restrictions in Mapbox dashboard
  
- [ ] **Verify Environment Variables**
  - Check `.env.example` for required variables
  - Ensure all tokens are valid
  - Test map functionality

### 🔍 Security Testing
- [ ] **Test Admin Authentication**
  - Try logging in with correct credentials (should work)
  - Try logging in with wrong credentials (should fail)
  - Try accessing admin page without login (should redirect)
  - Test logout functionality
  
- [ ] **Test Database Security**
  - Open browser console on public page
  - Try to write to database (should fail)
  - Login as admin and try to write (should work)
  
- [ ] **Test CSP Headers**
  - Open browser DevTools → Console
  - Check for CSP violation warnings
  - Fix any violations found
  
- [ ] **Run Security Audit**
  ```bash
  npm audit
  npm audit fix
  ```

---

## 🟡 MEDIUM PRIORITY - RECOMMENDED

### 📊 Monitoring & Analytics
- [ ] **Set Up Firebase Analytics**
  - Enable Google Analytics in Firebase Console
  - Track key events (match starts, score updates)
  
- [ ] **Configure Usage Alerts**
  - Set up billing alerts in Firebase Console
  - Monitor database read/write operations
  - Set quota limits
  
- [ ] **Error Monitoring (Optional)**
  - Consider Sentry or similar service
  - Track client-side errors
  - Monitor performance issues

### 🧪 Testing
- [ ] **Run All Tests**
  ```bash
  npm test
  npm run test:e2e
  ```
  
- [ ] **Test on Multiple Devices**
  - Desktop (Chrome, Firefox, Safari, Edge)
  - Tablet (iPad, Android tablet)
  - Mobile (iOS, Android)
  
- [ ] **Test Network Conditions**
  - Test with slow 3G connection
  - Test with intermittent connectivity
  - Verify offline behavior

### 🎨 Final UI/UX Review
- [ ] **Check All Pages**
  - Home page loads correctly
  - Schedule page displays matches
  - Live scoreboard updates in real-time
  - Admin panel is functional
  - Getting Here page shows map
  - Contact page works
  
- [ ] **Verify Responsive Design**
  - All pages work on mobile
  - Navigation menu works on small screens
  - Tables/cards are scrollable
  
- [ ] **Test Accessibility**
  - Keyboard navigation works
  - Screen reader compatibility
  - Color contrast is sufficient
  - Alt text for images

---

## 🟢 NICE TO HAVE - POST-LAUNCH

### 📈 Performance Optimization
- [ ] **Optimize Images**
  - Compress images
  - Use WebP format where possible
  - Implement lazy loading
  
- [ ] **Code Splitting**
  - Review bundle size
  - Implement route-based code splitting
  - Optimize dependencies
  
- [ ] **Lighthouse Audit**
  ```bash
  npm install -g lighthouse
  lighthouse https://your-domain.com
  ```
  - Target score: 90+ for all categories

### 📝 Documentation
- [ ] **Update README.md**
  - Add deployment instructions
  - Document admin credentials location
  - Add troubleshooting section
  
- [ ] **Create Admin Guide**
  - How to start a match
  - How to update scores
  - How to handle timeouts/overtime
  - Emergency procedures
  
- [ ] **Create User Guide**
  - How to view live scores
  - How to check schedule
  - How to find venue

### 🔄 Backup & Recovery
- [ ] **Set Up Database Backups**
  - Enable automatic backups in Firebase
  - Test restore procedure
  - Document backup schedule
  
- [ ] **Create Rollback Plan**
  - Document previous deployment version
  - Keep backup of working code
  - Test rollback procedure

---

## 🎯 DAY-OF-TOURNAMENT CHECKLIST

### Morning Setup (2 hours before)
- [ ] **Verify System Status**
  - Check Firebase Console (no errors)
  - Verify website is accessible
  - Test admin login
  - Check database connectivity
  
- [ ] **Test Live Scoring**
  - Create test match
  - Update scores
  - Verify scoreboard updates
  - Test timer functionality
  - Delete test match
  
- [ ] **Prepare Admin Devices**
  - Charge all devices
  - Install backup browsers
  - Save admin credentials locally
  - Test internet connectivity
  
- [ ] **Brief Admin Team**
  - Review scoring procedures
  - Demonstrate admin panel
  - Explain emergency procedures
  - Assign backup admin

### During Tournament
- [ ] **Monitor System**
  - Check Firebase usage dashboard
  - Monitor for errors
  - Watch database operations
  - Keep backup admin ready
  
- [ ] **Have Backup Plan**
  - Backup device ready
  - Mobile hotspot available
  - Paper scoresheets as fallback
  - IT support contact ready

### Post-Tournament
- [ ] **Save Match Data**
  - Export all match data
  - Download past matches
  - Backup to external storage
  
- [ ] **Review Performance**
  - Check Firebase analytics
  - Review error logs
  - Document issues encountered
  - Plan improvements

---

## 🔧 DEPLOYMENT COMMANDS

### Initial Setup
```bash
# Install dependencies
npm install

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

### Build & Deploy
```bash
# Build production version
npm run build

# Deploy database rules only
firebase deploy --only database

# Deploy hosting only
firebase deploy --only hosting

# Deploy everything
firebase deploy

# View deployed site
firebase open hosting:site
```

### Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Security audit
npm audit
```

---

## 📞 EMERGENCY CONTACTS

### Technical Issues
- **Firebase Support:** https://firebase.google.com/support
- **React Documentation:** https://react.dev/
- **Project Repository:** [Your GitHub/GitLab URL]

### Admin Credentials
- **Location:** [Secure password manager or encrypted file]
- **Backup Admin:** [Name and contact]
- **IT Support:** [Contact details]

---

## ✅ FINAL VERIFICATION

Before going live, verify ALL of the following:

### Security ✅
- [x] Firebase Security Rules updated and deployed
- [x] Security headers configured
- [x] CSP headers added
- [x] robots.txt updated
- [ ] Admin authentication implemented (Firebase Auth)
- [ ] App Check enabled (recommended)
- [ ] All console.logs removed from production

### Functionality ✅
- [ ] Live scoreboard updates in real-time
- [ ] Admin panel allows score updates
- [ ] Timer works correctly
- [ ] Player stats update properly
- [ ] Match scheduling works
- [ ] Past matches are saved

### Performance ✅
- [ ] Production build created
- [ ] Images optimized
- [ ] Bundle size acceptable (<500KB initial)
- [ ] Page load time <3 seconds
- [ ] Lighthouse score >85

### Testing ✅
- [ ] All unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Mobile testing completed
- [ ] Cross-browser testing completed

---

## 🎉 DEPLOYMENT STEPS (Final)

1. **Complete all CRITICAL items** ⚠️
2. **Run final tests**
   ```bash
   npm test
   npm run test:e2e
   npm audit
   ```
3. **Build production version**
   ```bash
   npm run build
   ```
4. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```
5. **Verify deployment**
   - Visit live URL
   - Test all functionality
   - Check admin panel
   - Verify security
6. **Monitor for 24 hours**
   - Watch Firebase Console
   - Check error logs
   - Monitor usage
7. **Brief tournament staff**
   - Demonstrate system
   - Provide credentials
   - Explain procedures

---

## 📊 SUCCESS METRICS

Your deployment is successful when:
- ✅ Website loads in <3 seconds
- ✅ Admin can login and update scores
- ✅ Live scoreboard updates within 1 second
- ✅ No security vulnerabilities
- ✅ Works on all devices
- ✅ No critical errors in console
- ✅ Firebase usage within limits

---

## 🆘 TROUBLESHOOTING

### Issue: Admin can't login
- Check Firebase Authentication is enabled
- Verify admin UID in database
- Check browser console for errors
- Try incognito mode

### Issue: Scores not updating
- Check Firebase database rules
- Verify admin is authenticated
- Check network connectivity
- Check Firebase Console for errors

### Issue: Website not loading
- Check Firebase hosting status
- Verify DNS settings
- Check browser console
- Try different browser

### Issue: High Firebase usage
- Check for infinite loops
- Verify listeners are cleaned up
- Monitor database operations
- Consider rate limiting

---

**IMPORTANT:** Do NOT deploy to production until ALL CRITICAL items are completed!

**Good luck with your tournament! 🏀**
