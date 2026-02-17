# SKOPE ERP - Complete Setup and Troubleshooting Guide

## 🚀 Quick Start (Recommended)

### Option 1: Automated Complete Fix and Start
**This is the EASIEST and RECOMMENDED method:**

1. Double-click `COMPLETE_FIX_AND_START.bat`
2. Wait for both servers to start
3. Browser will open automatically to http://localhost:3000/login
4. Login with: `admin@store.com` / `admin123`

This script will:
- ✅ Kill any existing processes on ports 8000 and 3000
- ✅ Set up and activate Python virtual environment
- ✅ Install all backend dependencies
- ✅ Reset and seed the database
- ✅ Start backend server (http://localhost:8000)
- ✅ Install frontend dependencies
- ✅ Start frontend server (http://localhost:3000)
- ✅ Open your browser automatically

---

## 🔍 Troubleshooting

### "Not Found" Error on Login Page

**Symptoms:**
- Login page shows "Not Found" error
- Red indicator showing "Backend Not Connected"
- Cannot login even with correct credentials

**Solution:**

1. **Run the diagnostic tool first:**
   ```
   Double-click: RUN_DIAGNOSTIC.bat
   ```
   This will check:
   - Backend server status
   - Database connection
   - Authentication endpoint
   - CORS configuration
   - Frontend server status

2. **If backend is not running:**
   ```
   Double-click: COMPLETE_FIX_AND_START.bat
   ```

3. **Manual Backend Start (if needed):**
   ```cmd
   cd backend
   venv\Scripts\activate
   python -m uvicorn app.main:app --reload --port 8000
   ```

4. **Manual Frontend Start (if needed):**
   ```cmd
   cd frontend
   npm run dev
   ```

---

## 🛠️ Common Issues and Solutions

### Issue 1: Port Already in Use

**Error:** `Address already in use` or `Port 8000/3000 is already allocated`

**Solution:**
```cmd
# Kill process on port 8000
for /f "tokens=5" %a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %a

# Kill process on port 3000
for /f "tokens=5" %a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %a
```

Or simply run `COMPLETE_FIX_AND_START.bat` which does this automatically.

---

### Issue 2: Database Connection Error

**Error:** `Could not connect to database` or `Database tables not found`

**Solution:**
```cmd
cd backend
venv\Scripts\activate
python setup_complete_database.py --reset
```

This will:
- Drop all existing tables
- Create fresh tables
- Seed with demo data including admin user

---

### Issue 3: Login Returns 401 Unauthorized

**Error:** `Incorrect username or password` even with correct credentials

**Solution:**
```cmd
cd backend
venv\Scripts\activate
python diagnose.py
```

Check the `diagnostic_report.txt` file for details. If password is invalid, the script will automatically reset it to `admin123`.

---

### Issue 4: Frontend Shows "Cannot connect to server"

**Symptoms:**
- Toast notification: "Cannot connect to server"
- Console shows: `ERR_NETWORK` or `ECONNREFUSED`

**Solution:**

1. Ensure backend is running:
   ```cmd
   cd backend
   venv\Scripts\activate
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. Verify backend health:
   Open browser: http://localhost:8000/health
   Should return: `{"status": "healthy"}`

3. Check API docs:
   Open browser: http://localhost:8000/docs
   Should show FastAPI Swagger UI

---

### Issue 5: Module Not Found Errors

**Error:** `ModuleNotFoundError: No module named 'fastapi'` or similar

**Solution:**
```cmd
cd backend
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Issue 6: Frontend Dependencies Missing

**Error:** `Cannot find module` or `Module not found` in frontend

**Solution:**
```cmd
cd frontend
npm install
```

---

## 📋 System Requirements

- **Python:** 3.8 or higher
- **Node.js:** 16.x or higher
- **npm:** 8.x or higher
- **PostgreSQL:** 12 or higher (or use SQLite for development)

---

## 🔐 Default Credentials

### Admin User
- **Email:** admin@store.com
- **Password:** admin123
- **Role:** Super Admin

### Manager User
- **Email:** manager@store.com
- **Password:** manager123
- **Role:** Store Manager

---

## 📁 Important Files

### Startup Scripts
- `COMPLETE_FIX_AND_START.bat` - **MAIN STARTUP SCRIPT** (Use this!)
- `RESTART_ALL.bat` - Restart both servers
- `RUN_DIAGNOSTIC.bat` - Run comprehensive diagnostics

### Backend Scripts
- `backend/REPAIR_AND_START.bat` - Backend only repair and start
- `backend/diagnose.py` - Database and user diagnostics
- `backend/comprehensive_diagnostic.py` - Full system diagnostics
- `backend/setup_complete_database.py` - Database setup and seeding

---

## 🌐 Access Points

After successful startup:

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **API Health Check:** http://localhost:8000/health

---

## 🐛 Debug Mode

### Enable Detailed Logging

**Backend:**
The backend already logs to console. Check the terminal window titled "SKOPE Backend"

**Frontend:**
Open browser console (F12) to see detailed API request/response logs:
- `[API Request]` - Outgoing requests
- `[API Response]` - Successful responses
- `[API Response Error]` - Failed requests with details

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Run the diagnostic:**
   ```
   RUN_DIAGNOSTIC.bat
   ```

2. **Check the logs:**
   - Backend: Check the "SKOPE Backend" terminal window
   - Frontend: Check browser console (F12)
   - Database: Check `diagnostic_report.txt`

3. **Complete Reset:**
   ```cmd
   # Stop all servers
   # Then run:
   COMPLETE_FIX_AND_START.bat
   ```

---

## 🎯 Success Indicators

You know everything is working when:

✅ Backend terminal shows: `Uvicorn running on http://0.0.0.0:8000`
✅ Frontend terminal shows: `Local: http://localhost:3000/`
✅ Login page shows green indicator: "Backend Connected"
✅ http://localhost:8000/health returns `{"status": "healthy"}`
✅ You can login with `admin@store.com` / `admin123`

---

## 💡 Pro Tips

1. **Always use `COMPLETE_FIX_AND_START.bat`** for the most reliable startup
2. **Run `RUN_DIAGNOSTIC.bat`** before asking for help - it will tell you exactly what's wrong
3. **Keep both terminal windows open** to see real-time logs
4. **Check browser console** (F12) for frontend errors
5. **The login page shows backend status** - look for the green/red indicator

---

## 🔄 Update Process

To update the application:

```cmd
# Pull latest changes
git pull

# Run complete fix and start
COMPLETE_FIX_AND_START.bat
```

This will reinstall dependencies and reset the database with latest changes.

---

**Last Updated:** 2026-01-28
**Version:** 2.0.0
