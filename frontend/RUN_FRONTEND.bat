@echo off
echo ========================================
echo   SKOPE ERP - Frontend Dev Server
echo ========================================
echo.
echo Starting frontend on port 3000...
echo.

cd /d "%~dp0"
npm run dev

pause
