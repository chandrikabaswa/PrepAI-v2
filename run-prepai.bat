@echo off

echo Starting PrepAI...

start "PrepAI Backend" /D "%~dp0PrepAI-backend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

start "PrepAI Frontend" /D "%~dp0PrepAI-react" cmd /k "npm run dev"

echo.
echo PrepAI frontend and backend are starting...
pause