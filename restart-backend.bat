@echo off
echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

cd backend

echo Killing existing Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server...
echo.

start cmd /k "node server.js"

echo.
echo ========================================
echo Backend server started in new window
echo ========================================
echo.
echo Server should be running on http://localhost:4000
echo.
pause
