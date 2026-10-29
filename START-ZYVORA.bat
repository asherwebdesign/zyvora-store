@echo off
cd /d "%~dp0"
echo Starting ZYVORA store...
where node >nul 2>nul || (echo Node.js 20+ is required. Install it from https://nodejs.org/ & pause & exit /b 1)
start "ZYVORA browser" cmd /c "timeout /t 2 >nul & start http://localhost:3000"
npm start
pause
