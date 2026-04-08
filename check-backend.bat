@echo off
echo Checking Backend Server Status...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Backend server is RUNNING
    echo.
    echo Active Node.js processes:
    tasklist /FI "IMAGENAME eq node.exe"
) else (
    echo [ERROR] Backend server is NOT running
    echo.
    echo To start the backend, run: restart-backend.bat
)

echo.
echo Testing backend connection...
curl -s http://localhost:4000/api/health >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [OK] Backend is responding on http://localhost:4000
) else (
    echo [ERROR] Backend is not responding on http://localhost:4000
)

echo.
pause
