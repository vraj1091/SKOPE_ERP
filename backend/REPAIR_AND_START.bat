@echo off
echo ===========================================
echo   SKOPE ERP - FULL REPAIR & START TOOL
echo ===========================================
echo.
echo [1/4] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
pip install requests facebook-business google-ads google-auth google-auth-oauthlib google-auth-httplib2
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Resetting Database (Fresh Start)...
python setup_complete_database.py --reset
if %ERRORLEVEL% NEQ 0 (
    echo Error resetting database.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Database setup complete. Starting server...
echo.
echo Access API docs at: http://localhost:8000/docs
echo Access Frontend at: http://localhost:3000
echo.

python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

pause
