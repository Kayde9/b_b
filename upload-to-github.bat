@echo off
echo ========================================
echo Git Upload Script for Basketball Tournament
echo ========================================
echo.

REM Configure Git user (update with your details)
git config user.name "Kayde9"
git config user.email "your.email@example.com"

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Creating commit...
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"
echo.

echo Step 3: Setting branch to main...
git branch -M main
echo.

echo Step 4: Pushing to GitHub...
echo You may be prompted for GitHub credentials...
git push -u origin main
echo.

echo ========================================
echo Upload Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Visit: https://github.com/Kayde9/b_t
echo 2. Verify all files are uploaded
echo 3. Add repository description
echo 4. Add topics/tags
echo.
pause
