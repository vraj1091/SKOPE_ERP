@echo off
echo ==================================================
echo   SKOPE ERP - Full Database Setup
echo ==================================================
echo.

cd /d "%~dp0backend"

echo Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment activated.
) else (
    echo [!!] No venv found. Using system Python.
)

echo.
echo Running setup script (fresh database with full data)...
echo.
python setup_and_seed.py --reset

echo.
echo ==================================================
echo   Setup Complete! Starting Backend...
echo ==================================================
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
