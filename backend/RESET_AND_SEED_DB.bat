@echo off
echo.
echo ===================================================
echo     SKOPE ERP - FRESH RESET & SEED (CAUTION!)
echo ===================================================
echo.
echo ⚠️  WARNING: THIS WILL DELETE ALL EXISTING DATA!
echo.
echo It will:
echo   1. Delete skope_erp.db
echo   2. Recreate database schema
echo   3. Seed 2500+ fresh records
echo.
set /p confirm="Type 'yes' to proceed: "
if /i not "%confirm%"=="yes" goto :eof

echo.
echo 🗑️  Deleting old database...
if exist skope_erp.db del skope_erp.db
if exist rms.db del rms.db

echo.
echo 🏗️  Initializing new database...
python init_db.py

echo.
echo 🌱 Seeding fresh data...
python seed_comprehensive_data.py

echo.
echo ✅ Verification:
python check_campaigns.py

echo.
echo Done! You have a brand new database with rich data.
echo Please restart your backend server.
pause
