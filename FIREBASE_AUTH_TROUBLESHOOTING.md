# Firebase Authentication Troubleshooting Guide

## Issue: Google Sign-in Not Working

### Common Causes & Solutions:

### 1. **Domain Authorization (Most Likely Issue)**
Firebase requires authorized domains to be configured in the Console.

**To Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `internmimsbasketball`
3. Go to **Authentication** → **Settings** → **Authorized Domains**
4. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - Any other domains you'll use

### 2. **Popup Blockers**
Browser may be blocking the authentication popup.

**To Fix:**
- Allow popups for localhost in browser settings
- Try in incognito/private mode
- Check browser console for popup-blocked errors

### 3. **Browser Console Errors**
Check the browser developer console (F12) for specific errors.

**Common Error Codes:**
- `auth/popup-blocked` - Popup was blocked
- `auth/unauthorized-domain` - Domain not authorized
- `auth/network-request-failed` - Network/connectivity issue

### 4. **HTTPS vs HTTP**
Some browsers require HTTPS for certain auth features.

**To Test:**
- Try with `https://` if available
- Use different browsers (Chrome, Firefox, Edge)

### 5. **Firebase Configuration**
Verify all Firebase config values are correct.

## Testing Steps:

1. **Test Authentication:** Open `http://localhost:8000/auth-test.html`
2. **Check Console:** Open browser DevTools (F12) and check for errors
3. **Try Admin Panel:** Go to `http://localhost:8000/admin.html`
4. **Different Browser:** Test in Chrome, Firefox, or Edge

## Quick Fixes to Try:

### Enable Popups:
- **Chrome:** Settings → Privacy → Site Settings → Popups → Add localhost
- **Firefox:** Preferences → Privacy → Permissions → Block pop-up windows → Exceptions
- **Edge:** Settings → Site permissions → Pop-ups and redirects

### Clear Browser Data:
- Clear cache and cookies for localhost
- Try incognito/private browsing mode

### Firebase Console Check:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: internmimsbasketball  
3. Authentication → Settings → Authorized domains
4. Ensure localhost is listed

## Contact Support:
If issues persist, check browser console errors and Firebase project settings.

---
**Inter-NMIMS Basketball Tournament 2025**
Basketball Scoreboard System