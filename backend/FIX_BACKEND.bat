@echo off
echo ===========================================
echo      SKOPE ERP - BACKEND FIX TOOL
echo ===========================================
echo.
echo This tool will reset the database and install dependencies.
echo WARNING: All existing data will be lost!
echo.
echo [1/3] Installing requirements...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error installing requirements.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Resetting Database...
python setup_complete_database.py --reset
if %ERRORLEVEL% NEQ 0 (
    echo Error resetting database.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Done! You can now start the backend.
echo.
pause
