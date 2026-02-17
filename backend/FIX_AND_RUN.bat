@echo off
echo.
echo ===================================================
echo     SKOPE ERP - DATABASE FIX & SEED
echo ===================================================
echo.
echo 🛑  Stopping any running Python processes to free up database...
taskkill /F /IM python.exe /T 2>nul
echo.

echo 🗑️  Deleting old database file...
if exist skope_erp.db del /F /Q skope_erp.db
if exist rms.db del /F /Q rms.db
echo.

echo u001b[32m🏗️  Initializing new database structure...u001b[0m
python init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error initializing database!
    pause
    exit /b
)
echo.

echo u001b[32m🌱 Seeding 2500+ records (This will take ~30-60 seconds)...u001b[0m
python seed_comprehensive_data.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error seeding database!
    pause
    exit /b
)
echo.

echo u001b[32m✅ Verifying data...u001b[0m
python check_campaigns.py
echo.

echo ===================================================
echo 🎉 SUCCESS! Database has been fixed and populated.
echo ===================================================
echo.
echo👉 Now run: START_BACKEND.bat (or python -m uvicorn app.main:app --reload)
echo.
pause
