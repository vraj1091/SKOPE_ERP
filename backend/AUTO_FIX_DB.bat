@echo off
echo.
echo ---------------------------------------------------
echo      SKOPE ERP - DATABASE DATABASE FIX
echo ---------------------------------------------------
echo.
echo Stopping python processes...
taskkill /F /IM python.exe /IM uvicorn.exe 2>nul
echo.

echo Cleaning up old database...
if exist skope_erp.db del /F /Q skope_erp.db
if exist rms.db del /F /Q rms.db
timeout /t 2 /nobreak >nul

echo.
echo Initializing new database...
python init_db.py

echo.
echo Seeding 2500+ records (Please wait)...
python seed_comprehensive_data.py

echo.
echo Verifying data...
python check_campaigns.py

echo.
echo ---------------------------------------------------
echo  SUCCESS! Database is fixed and fully populated.
echo  You can now start your backend server.
echo ---------------------------------------------------
echo.
pause
