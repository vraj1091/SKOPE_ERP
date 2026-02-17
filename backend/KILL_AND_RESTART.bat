@echo off
echo ===========================================
echo   RESETTING BACKEND PROCESSES
echo ===========================================
echo.
echo [1/3] Killing Python and Node processes...
taskkill /F /IM python.exe /T
taskkill /F /IM uvicorn.exe /T
taskkill /F /IM node.exe /T

echo.
echo [2/3] Processes cleared. Starting Backend...
cd c:\Users\vrajr\Desktop\Store_management\backend
call venv\Scripts\activate.bat
start /B python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

echo.
echo [3/3] Backend restarted in background.
echo.
echo Please wait 10 seconds then REFRESH your browser.
ping 127.0.0.1 -n 12 > nul

echo.
echo Running API Test...
python test_dashboard_api.py > api_test_result.txt 2>&1

echo.
echo DONE.
pause
