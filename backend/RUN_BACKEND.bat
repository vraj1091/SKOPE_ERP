@echo off
echo ========================================
echo   SKOPE ERP - Manual Backend Start
echo ========================================
echo.
echo Starting backend server on port 8000...
echo.

cd /d "%~dp0"
call venv\Scripts\activate

echo Checking Python...
python --version

echo.
echo Starting uvicorn...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause
