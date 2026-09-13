@echo off
title OncoQuantum AI Suite - GitHub & Vercel Publisher
color 0B
cls
echo ======================================================================
echo          ONCOQUANTUM AI SUITE - GITHUB & VERCEL PUBLISHER
echo ======================================================================
echo.
echo [Step 1 of 3] Opening GitHub to create repository 'oncoquantumsuite'...
start https://github.com/new?name=oncoquantumsuite
echo.
echo  -----------------------------------------------------------------
echo  In your browser, click the green "Create repository" button.
echo  -----------------------------------------------------------------
echo.
pause
echo.
echo [Step 2 of 3] Pushing codebase to github.com/bhabanisoren16-ship-it/oncoquantumsuite...
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%PATH%"
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] If Git Credential Manager prompted for sign-in, please complete it.
    pause
    git push -u origin main
)
echo.
echo [Step 3 of 3] Codebase pushed successfully!
echo Opening Vercel to publish https://oncoquantumsuite.vercel.app...
start https://vercel.com/new
echo.
echo  -----------------------------------------------------------------
echo  On Vercel:
echo    1. Click "Import" next to 'oncoquantumsuite'
echo    2. Project Name: oncoquantumsuite
echo    3. Click "Deploy"!
echo  -----------------------------------------------------------------
echo.
echo ======================================================================
echo                   ALL DEPLOYMENT STEPS COMPLETE!
echo ======================================================================
echo.
pause
