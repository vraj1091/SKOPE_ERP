@echo off
echo STARTING BACKEND IN FOREGROUND...
echo.
cd c:\Users\vrajr\Desktop\Store_management\backend
call venv\Scripts\activate.bat
echo Virtual Environment Activated.
echo.
echo Launching Uvicorn...
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
pause
