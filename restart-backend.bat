@echo off
echo Restarting Backend Server...
echo.
echo Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting backend server (this window must stay open)...
echo.
cd backend
node server.js
