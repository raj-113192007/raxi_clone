@echo off
title RAXI LOCAL BACKEND & FRONTEND SERVER
color 0A

echo ===================================================
echo      STARTING RAXI CLONE ON YOUR LAPTOP
echo ===================================================
echo.

cd /d "%~dp0backend"

if not exist "node_modules" (
    echo Installing backend dependencies, please wait...
    call npm install
)

echo.
echo ===================================================
echo  Server is starting on http://localhost:5000
echo  Opening registration page in your browser...
echo ===================================================
echo.

start "" "http://localhost:5000/#/register?invitationCode=44128111216"

node server.js
pause
