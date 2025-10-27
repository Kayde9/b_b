@echo off
echo ========================================
echo Basketball Tournament - Ngrok Deployment
echo ========================================
echo.

echo Checking if ngrok is installed...
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ngrok is not installed!
    echo.
    echo Please install ngrok first:
    echo 1. Go to https://ngrok.com/download
    echo 2. Download ngrok for Windows
    echo 3. Extract the zip file
    echo 4. Move ngrok.exe to C:\Windows\System32\
    echo    OR add ngrok folder to your PATH
    echo.
    echo Alternative: Install via Chocolatey
    echo    choco install ngrok
    echo.
    pause
    exit /b 1
)

echo Ngrok is installed!
echo.

echo Setting up ngrok authtoken...
ngrok config add-authtoken 34fA14rBPXvVSt0H89BWiveih1c_3xao2rp2b9pR9ZR9j5tjJ
echo.

echo ========================================
echo Starting React App...
echo ========================================
echo.
start "React App" cmd /k "cd /d "%~dp0" && npm start"
echo Waiting 15 seconds for React app to start...
timeout /t 15 /nobreak
echo.

echo ========================================
echo Starting Ngrok Tunnel...
echo ========================================
echo.
start "Ngrok Tunnel" cmd /k "ngrok http 3000"
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your website is now accessible via ngrok!
echo.
echo Check the "Ngrok Tunnel" window for your public URL
echo It will look like: https://abc123.ngrok-free.app
echo.
echo IMPORTANT: Add this domain to Firebase:
echo 1. Go to https://console.firebase.google.com
echo 2. Select your project
echo 3. Authentication -^> Settings -^> Authorized domains
echo 4. Add your ngrok domain (without https://)
echo.
pause
