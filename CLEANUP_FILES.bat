@echo off
cls
echo Cleaning up unnecessary files...
echo.

REM Delete all emoji-prefixed troubleshooting files
del /Q "▶️_*.txt" 2>nul
del /Q "⚡_*.txt" 2>nul
del /Q "⚡_*.md" 2>nul
del /Q "✅_*.txt" 2>nul
del /Q "✅_*.md" 2>nul
del /Q "⭐_*.txt" 2>nul
del /Q "🌟_*.md" 2>nul
del /Q "🎉_*.txt" 2>nul
del /Q "🎉_*.md" 2>nul
del /Q "🎨_*.md" 2>nul
del /Q "🎬_*.txt" 2>nul
del /Q "🎯_*.txt" 2>nul
del /Q "🎯_*.md" 2>nul
del /Q "📊_*.txt" 2>nul
del /Q "📋_*.txt" 2>nul
del /Q "📋_*.md" 2>nul
del /Q "📌_*.txt" 2>nul
del /Q "📖_*.md" 2>nul
del /Q "📱_*.txt" 2>nul
del /Q "🔍_*.txt" 2>nul
del /Q "🔥_*.txt" 2>nul
del /Q "🔥_*.md" 2>nul
del /Q "🔧_*.txt" 2>nul
del /Q "🔧_*.md" 2>nul
del /Q "🚀_*.txt" 2>nul
del /Q "🚀_*.md" 2>nul
del /Q "🚨_*.txt" 2>nul
del /Q "🆘_*.txt" 2>nul

REM Delete duplicate/old documentation files
del /Q "ACTIONABLE_INTELLIGENCE_EXPLAINED.md" 2>nul
del /Q "ADVANCED_FEATURES_GUIDE.md" 2>nul
del /Q "ARCHITECTURE_DIAGRAM.txt" 2>nul
del /Q "BEFORE_AFTER_COMPARISON.md" 2>nul
del /Q "CHATBOT_FIXES.md" 2>nul
del /Q "COMPARISON_GRAPH_GUIDE.md" 2>nul
del /Q "COMPLETE_FIXES_SUMMARY.md" 2>nul
del /Q "COMPLETE_PROJECT_SETUP.md" 2>nul
del /Q "COMPLETE_TESTING_GUIDE.md" 2>nul
del /Q "CORRECT_URLS.md" 2>nul
del /Q "DATA_POPULATED.md" 2>nul
del /Q "DATA_VISIBILITY_FIX.md" 2>nul
del /Q "DEBUG_DASHBOARD.md" 2>nul
del /Q "DESIGN_IMPLEMENTATION_GUIDE.md" 2>nul
del /Q "DESIGN_QUICK_REFERENCE.md" 2>nul
del /Q "ERROR_FIX_APPLIED.md" 2>nul
del /Q "FINAL_COMPLETE_SUMMARY.md" 2>nul
del /Q "FINAL_STATUS.txt" 2>nul
del /Q "FINAL_SUMMARY.md" 2>nul
del /Q "FULL_PROJECT_READY.md" 2>nul
del /Q "HOW_TO_RUN.txt" 2>nul
del /Q "IMPLEMENTATION_COMPLETE_SUMMARY.md" 2>nul
del /Q "LOGOUT_AND_LOGIN.md" 2>nul
del /Q "MARKETING_FEATURES_ADDED.md" 2>nul
del /Q "MARKETING_PAGE_FIX.md" 2>nul
del /Q "MULTI_STORE_COMPLETE_GUIDE.txt" 2>nul
del /Q "MULTI_STORE_COMPLETE.txt" 2>nul
del /Q "NEW_SALE_FEATURE_FIXED.md" 2>nul
del /Q "POPULATE_DATABASE.md" 2>nul
del /Q "PROFESSIONAL_UPGRADE.md" 2>nul
del /Q "PROJECT_READY.md" 2>nul
del /Q "QUICK_FIX_SUMMARY.txt" 2>nul
del /Q "QUICK_FIX.md" 2>nul
del /Q "QUICK_REFERENCE.txt" 2>nul
del /Q "QUICK_START_GUIDE.txt" 2>nul
del /Q "QUICK_START.txt" 2>nul
del /Q "QUICK_TEST_GUIDE.txt" 2>nul
del /Q "QUICKSTART.md" 2>nul
del /Q "REPORTS_WORKING_GUIDE.md" 2>nul
del /Q "ROHIT_REQUIREMENTS_STATUS.md" 2>nul
del /Q "SALE_FEATURE_FIXES.md" 2>nul
del /Q "SOLUTION_SUMMARY.md" 2>nul
del /Q "START_HERE_COMPARISON.md" 2>nul
del /Q "START_HERE.md" 2>nul
del /Q "START_HERE.txt" 2>nul
del /Q "START_INSTRUCTIONS.md" 2>nul
del /Q "START_TESTING_NOW.txt" 2>nul
del /Q "STORE_AWARE_SYSTEM_COMPLETE.md" 2>nul

REM Delete duplicate BAT files
del /Q "build_frontend_direct.bat" 2>nul
del /Q "CHECK_MARKETING.bat" 2>nul
del /Q "CHECK_STATUS.bat" 2>nul
del /Q "CLEAR_CACHE_AND_RESTART.bat" 2>nul
del /Q "COMPLETE_FIX_AND_START.bat" 2>nul
del /Q "debug_start.bat" 2>nul
del /Q "FIX_AND_START.bat" 2>nul
del /Q "FIX_SYSTEM_OFFLINE.bat" 2>nul
del /Q "LAUNCH_PROJECT.bat" 2>nul
del /Q "MASTER_FIX.bat" 2>nul
del /Q "RESTART_ALL.bat" 2>nul
del /Q "RUN_DIAGNOSTIC.bat" 2>nul
del /Q "RUN_PROJECT_NOW.bat" 2>nul
del /Q "SEED_COMPARISON_DATA.bat" 2>nul
del /Q "SEED_MARKETING_DATA.bat" 2>nul
del /Q "SEED_REPORTS_DATA.bat" 2>nul
del /Q "SIMPLE_START.bat" 2>nul
del /Q "START_APP.bat" 2>nul
del /Q "START_BACKEND_FIXED.bat" 2>nul
del /Q "START_BACKEND_NOW.bat" 2>nul
del /Q "START_COMPLETE_PROJECT.bat" 2>nul
del /Q "START_FRONTEND_3001.bat" 2>nul
del /Q "START_FRONTEND_DIRECT.bat" 2>nul
del /Q "START_FRONTEND_NOW.bat" 2>nul
del /Q "STOP_ALL_SERVERS.bat" 2>nul
del /Q "URGENT_START_BACKEND.bat" 2>nul
del /Q "🚀_START_NOW.bat" 2>nul

REM Delete debug Python files
del /Q "check_pg_tables_file.py" 2>nul
del /Q "check_pg_tables.py" 2>nul
del /Q "debug_login_error.py" 2>nul
del /Q "trigger_login.py" 2>nul

REM Delete debug HTML files
del /Q "debug_reports.html" 2>nul

REM Delete PowerShell scripts
del /Q "FINAL_START_BACKEND.ps1" 2>nul

echo.
echo ✅ Cleanup complete!
echo.
echo Kept essential files:
echo   • README.md
echo   • DEPLOYMENT.md
echo   • SETUP_GUIDE.md
echo   • API_DOCUMENTATION.md
echo   • DESIGN_SYSTEM.md
echo   • DOCKER_GUIDE.md
echo   • MARKETING_AUTOMATION.md
echo   • MULTI_STORE_FEATURE.md
echo   • RBAC_PERMISSIONS.md
echo   • TROUBLESHOOTING.md
echo   • TEST_API.md
echo   • PROJECT_DEVELOPMENT_WORKSHEET_DEC15_JAN2.md
echo   • AD_INTEGRATIONS_AND_REPORTS_GUIDE.md
echo.
echo   • START_BACKEND.bat
echo   • START_FRONTEND.bat
echo   • START_BOTH_SERVERS.bat
echo   • SETUP_DATABASE.bat
echo   • 🚀_COMPLETE_SETUP_AND_START.bat
echo   • QUICK_START_BACKEND.bat
echo   • PUSH_TO_GITHUB.bat
echo.
pause
