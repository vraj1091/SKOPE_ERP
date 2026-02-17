@echo off
cls
echo ════════════════════════════════════════════════
echo   SKOPE ERP - Database Setup Script
echo ════════════════════════════════════════════════
echo.
echo This will:
echo   1. Create all database tables
echo   2. Populate with comprehensive demo data
echo   3. Set up stores, users, products, customers
echo   4. Add sales transactions and expenses
echo   5. Create marketing campaigns
echo.
echo ════════════════════════════════════════════════
echo.
pause

cd /d "%~dp0backend"
echo.
echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Running database seeder...
python seed_database.py

echo.
echo ════════════════════════════════════════════════
echo   Database setup complete!
echo ════════════════════════════════════════════════
echo.
echo Your SQLite database is located at:
echo backend\skope_erp.db
echo.
echo You can now start the application!
echo.
pause
