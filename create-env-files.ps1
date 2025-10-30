# PowerShell Script to Create .env and firebase-config.js files
# Run this script to automatically set up your environment configuration

Write-Host "🔐 InterNMIMS Basketball - Environment Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping .env file creation..." -ForegroundColor Yellow
    } else {
        # Create .env file
        $envContent = @"
# Firebase Configuration
# IMPORTANT: Keep these credentials secure and never commit this file to git

# Firebase API Key
REACT_APP_FIREBASE_API_KEY=AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY

# Firebase Auth Domain
REACT_APP_FIREBASE_AUTH_DOMAIN=internmimsbasketball.firebaseapp.com

# Firebase Database URL
REACT_APP_FIREBASE_DATABASE_URL=https://internmimsbasketball-default-rtdb.firebaseio.com

# Firebase Project ID
REACT_APP_FIREBASE_PROJECT_ID=internmimsbasketball

# Firebase Storage Bucket
REACT_APP_FIREBASE_STORAGE_BUCKET=internmimsbasketball.firebasestorage.app

# Firebase Messaging Sender ID
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=97822648007

# Firebase App ID
REACT_APP_FIREBASE_APP_ID=1:97822648007:web:cfc93e3a6fb8233c6c40e2

# Firebase Measurement ID
REACT_APP_FIREBASE_MEASUREMENT_ID=G-KM2NGQ30TJ
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
        Write-Host "✅ Created .env file" -ForegroundColor Green
    }
} else {
    # Create .env file
    $envContent = @"
# Firebase Configuration
# IMPORTANT: Keep these credentials secure and never commit this file to git

# Firebase API Key
REACT_APP_FIREBASE_API_KEY=AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY

# Firebase Auth Domain
REACT_APP_FIREBASE_AUTH_DOMAIN=internmimsbasketball.firebaseapp.com

# Firebase Database URL
REACT_APP_FIREBASE_DATABASE_URL=https://internmimsbasketball-default-rtdb.firebaseio.com

# Firebase Project ID
REACT_APP_FIREBASE_PROJECT_ID=internmimsbasketball

# Firebase Storage Bucket
REACT_APP_FIREBASE_STORAGE_BUCKET=internmimsbasketball.firebasestorage.app

# Firebase Messaging Sender ID
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=97822648007

# Firebase App ID
REACT_APP_FIREBASE_APP_ID=1:97822648007:web:cfc93e3a6fb8233c6c40e2

# Firebase Measurement ID
REACT_APP_FIREBASE_MEASUREMENT_ID=G-KM2NGQ30TJ
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

Write-Host ""

# Check if firebase-config.js exists
$firebaseConfigPath = "scoreboard\js\firebase-config.js"
if (Test-Path $firebaseConfigPath) {
    Write-Host "⚠️  firebase-config.js already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping firebase-config.js creation..." -ForegroundColor Yellow
    } else {
        # Create firebase-config.js file
        $firebaseConfigContent = @"
// Firebase Configuration
// WARNING: This file contains sensitive credentials
// DO NOT commit this file to version control

export const firebaseConfig = {
  apiKey: "AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY",
  authDomain: "internmimsbasketball.firebaseapp.com",
  databaseURL: "https://internmimsbasketball-default-rtdb.firebaseio.com",
  projectId: "internmimsbasketball",
  storageBucket: "internmimsbasketball.firebasestorage.app",
  messagingSenderId: "97822648007",
  appId: "1:97822648007:web:cfc93e3a6fb8233c6c40e2",
  measurementId: "G-KM2NGQ30TJ"
};
"@
        
        $firebaseConfigContent | Out-File -FilePath $firebaseConfigPath -Encoding UTF8 -NoNewline
        Write-Host "✅ Updated scoreboard/js/firebase-config.js" -ForegroundColor Green
    }
} else {
    # Create firebase-config.js file
    $firebaseConfigContent = @"
// Firebase Configuration
// WARNING: This file contains sensitive credentials
// DO NOT commit this file to version control

export const firebaseConfig = {
  apiKey: "AIzaSyAWCSuJ4CFUy_mIiVJSECc8hGZok3yfWnY",
  authDomain: "internmimsbasketball.firebaseapp.com",
  databaseURL: "https://internmimsbasketball-default-rtdb.firebaseio.com",
  projectId: "internmimsbasketball",
  storageBucket: "internmimsbasketball.firebasestorage.app",
  messagingSenderId: "97822648007",
  appId: "1:97822648007:web:cfc93e3a6fb8233c6c40e2",
  measurementId: "G-KM2NGQ30TJ"
};
"@
    
    $firebaseConfigContent | Out-File -FilePath $firebaseConfigPath -Encoding UTF8 -NoNewline
    Write-Host "✅ Updated scoreboard/js/firebase-config.js" -ForegroundColor Green
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify .env file is NOT in git: git status" -ForegroundColor White
Write-Host "2. Start the React app: npm start" -ForegroundColor White
Write-Host "3. Open scoreboard: scoreboard/index.html" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT SECURITY NOTE:" -ForegroundColor Red
Write-Host "Your Firebase database rules currently allow public write access!" -ForegroundColor Yellow
Write-Host "Please update your database rules in Firebase Console." -ForegroundColor Yellow
Write-Host "See SECURITY_SETUP.md for details." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


