@echo off
echo Restarting Backend Server...
cd backend
echo.
echo Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting backend server...
start cmd /k "node server.js"
echo.
echo Backend server started in new window!
echo.
pause
