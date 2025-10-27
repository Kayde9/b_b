# 🚀 Upload to Fresh GitHub Repository - Complete Guide

## 📋 Step-by-Step Commands

### Option 1: Brand New Repository (Recommended)

#### Step 1: Create New Repository on GitHub
1. Go to https://github.com/new
2. Enter repository name (e.g., `internmims-basketball`)
3. **DO NOT** initialize with README, .gitignore, or license
4. Click "Create repository"
5. Copy the repository URL (e.g., `https://github.com/yourusername/repo-name.git`)

#### Step 2: Upload Your Code
```bash
# Navigate to your project folder
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"

# Add remote repository (replace with YOUR repository URL)
git remote add origin https://github.com/yourusername/repo-name.git

# Rename branch to main (optional but recommended)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

### Option 2: If Repository Already Exists

#### If you already created a repo with README/License:

```bash
# Navigate to your project
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"

# Add remote
git remote add origin https://github.com/yourusername/repo-name.git

# Pull existing files and merge
git pull origin main --allow-unrelated-histories

# Push your code
git push -u origin main
```

---

### Option 3: Replace Existing Repository Content

#### If you want to completely replace what's in the repo:

```bash
# Navigate to your project
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"

# Add remote
git remote add origin https://github.com/yourusername/repo-name.git

# Force push (WARNING: This will overwrite everything in the repo)
git push -u origin main --force
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/yourusername/repo-name.git
```

### Issue 2: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue 3: "src refspec main does not match any"
```bash
# Check your branch name
git branch

# If it shows 'master', use master instead:
git push -u origin master

# OR rename to main:
git branch -M main
git push -u origin main
```

### Issue 4: Authentication Failed
```bash
# Use Personal Access Token instead of password
# Generate token at: GitHub → Settings → Developer settings → Personal access tokens

# When prompted for password, use the token instead
```

### Issue 5: Large Files Warning
```bash
# Check file sizes
git ls-files -s | sort -k2 -n -r | head -20

# Remove large files
git rm --cached path/to/large/file
git commit --amend
```

---

## 📝 Complete Fresh Upload Script

Save this as `fresh-upload.bat`:

```batch
@echo off
echo ========================================
echo Fresh GitHub Repository Upload
echo ========================================
echo.

REM Set your repository URL here
set REPO_URL=https://github.com/yourusername/repo-name.git

echo Step 1: Initializing Git...
git init
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Creating commit...
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"
echo.

echo Step 4: Adding remote repository...
git remote add origin %REPO_URL%
echo.

echo Step 5: Renaming branch to main...
git branch -M main
echo.

echo Step 6: Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo Upload Complete!
echo ========================================
pause
```

---

## 🎯 Quick Commands (Copy-Paste Ready)

### For a COMPLETELY NEW repository:
```bash
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"
git init
git add .
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"
git remote add origin https://github.com/yourusername/repo-name.git
git branch -M main
git push -u origin main
```

### If you need to start fresh (remove existing git):
```bash
cd "c:\Users\KEVINDEEP SINGH\OneDrive\Desktop\InterNMIMS"
rmdir /s /q .git
git init
git add .
git commit -m "Initial commit: Inter-NMIMS Basketball Tournament 2025"
git remote add origin https://github.com/yourusername/repo-name.git
git branch -M main
git push -u origin main
```

---

## ✅ Verification Checklist

After uploading, verify:

- [ ] Visit your repository URL
- [ ] All files are visible (117 files)
- [ ] README.md displays correctly
- [ ] `.env` is NOT in the repository
- [ ] `node_modules/` is NOT in the repository
- [ ] Commit shows correct message
- [ ] Branch is set to `main` (or `master`)

---

## 🔒 Security Check Before Upload

Make sure these are in `.gitignore`:
```
node_modules/
.env
.env.local
build/
.DS_Store
```

Verify `.env` is not staged:
```bash
git status
# Should NOT show .env in the list
```

---

## 📞 Need Help?

### Check Git Status
```bash
git status
```

### Check Remote URL
```bash
git remote -v
```

### Check Branch Name
```bash
git branch
```

### View Commit History
```bash
git log --oneline
```

### See What Will Be Pushed
```bash
git diff origin/main
```

---

## 🎉 Success Indicators

You've successfully uploaded when you see:
```
Writing objects: 100% (132/132), done.
Total 132 (delta 9), reused 0 (delta 0)
To https://github.com/yourusername/repo-name.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

---

## 📱 Alternative: GitHub Desktop (GUI Method)

1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select your project folder
5. Click "Publish repository"
6. Choose name and visibility
7. Click "Publish"

---

## 🌐 Alternative: GitHub CLI

```bash
# Install GitHub CLI
winget install --id GitHub.cli

# Login
gh auth login

# Create repo and push
gh repo create internmims-basketball --public --source=. --push
```

---

**Choose the method that works best for you!** 🚀
