@echo off
echo.
echo ===================================================
echo     SKOPE ERP - COMPREHENSIVE DATA SEEDING
echo ===================================================
echo.
echo This script will add:
echo   - 2500+ Sales Records (Historical & Recent)
echo   - 300+ Customers
echo   - 100+ Products
echo   - 1 Year of Expense Data
echo   - Marketing Campaigns
echo.
echo ⚠️  Note: This adds to the existing database.
echo.
pause
echo.
echo Running seeding script...
python seed_comprehensive_data.py
echo.
echo Verifying data...
python check_campaigns.py
echo.
echo Done! Please restart your backend server to see changes.
pause
