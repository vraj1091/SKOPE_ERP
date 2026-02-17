# 🏪 SKOPE ERP - Store Management System

A comprehensive Enterprise Resource Planning (ERP) system for retail store management built with React, TypeScript, FastAPI, and SQLite.

## ✨ Features

### 📊 Core Features
- **Multi-Store Management** - Manage multiple store locations
- **Inventory Management** - Track products, stock levels, and categories
- **Point of Sale (POS)** - Process sales transactions with multiple payment modes
- **Customer Management** - Customer profiles, purchase history, loyalty points
- **Financial Management** - Expense tracking, profit/loss reports
- **Advanced Reports** - Sales, inventory, customer, and financial reports with charts
- **Role-Based Access Control** - Super Admin, Store Manager, Sales Staff, Marketing, Accounts

### 🚀 Advanced Features
- **Marketing Automation** - WhatsApp, SMS, Email campaigns
- **AI-Powered Insights** - Chatbot for business analytics
- **Ad Platform Integration** - Google Ads, Meta Ads integration
- **Comparison Analytics** - Compare performance across stores and time periods
- **Excel Export** - Export all reports to Excel
- **Real-time Dashboard** - Live metrics and charts

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **Zustand** for state management

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **SQLite** database
- **JWT** authentication
- **Uvicorn** ASGI server

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git** (for version control)

## 🚀 Quick Start

### 1. Setup Database (First Time Only)

```bash
# Windows
SETUP_DATABASE.bat

# This will:
# - Create SQLite database (backend/skope_erp.db)
# - Create all tables
# - Populate with 600+ demo records
```

### 2. Start Application

```bash
# Windows
START_BOTH_SERVERS.bat

# This starts:
# - Backend on http://localhost:8000
# - Frontend on http://localhost:3000
```

### 3. Access Application

Open your browser to: **http://localhost:3000**

**Login Credentials:**
- **Admin:** admin@store.com / admin123
- **Manager:** manager1@store.com / manager123
- **Sales:** sales1@store.com / sales123

## 📚 Demo Data Included

The database comes pre-populated with:
- ✅ 3 Store Locations (Mumbai, Delhi, Bangalore)
- ✅ 11 User Accounts (different roles)
- ✅ 36 Products (Electronics, Computers, Audio, TV, etc.)
- ✅ 20 Customers (full profiles with history)
- ✅ 360+ Sales Transactions (60 days of data)
- ✅ 180+ Expense Records (all categories)
- ✅ 6 Marketing Campaigns (ready to use)

## 📁 Project Structure

```
Store_management/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config & security
│   │   ├── db/           # Database models
│   │   └── services/     # Business logic
│   ├── seed_database.py  # Database seeder
│   └── skope_erp.db      # SQLite database
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── store/        # State management
│   │   └── utils/        # API & utilities
│   └── package.json
│
├── START_BACKEND.bat      # Start backend server
├── START_FRONTEND.bat     # Start frontend server
├── START_BOTH_SERVERS.bat # Start both servers
├── SETUP_DATABASE.bat     # Setup database
└── README.md             # This file
```

## 🔧 Development

### Backend Setup (Manual)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (Manual)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## 📖 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API endpoints reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** - UI/UX design guidelines
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Docker deployment
- **[MARKETING_AUTOMATION.md](MARKETING_AUTOMATION.md)** - Marketing features
- **[MULTI_STORE_FEATURE.md](MULTI_STORE_FEATURE.md)** - Multi-store setup
- **[RBAC_PERMISSIONS.md](RBAC_PERMISSIONS.md)** - Role permissions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions
- **[TEST_API.md](TEST_API.md)** - API testing guide

## 🌐 API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token

### Core Resources
- `/inventory` - Product inventory management
- `/sales` - Sales transactions
- `/customers` - Customer management
- `/financial` - Expense tracking
- `/reports` - Report generation
- `/users` - User management
- `/stores` - Store management

### Advanced
- `/campaigns` - Marketing campaigns
- `/chatbot` - AI chatbot
- `/ads` - Ad platform integration
- `/comparison` - Comparison analytics

**Full API Documentation:** http://localhost:8000/docs

## 💾 Database

**Type:** SQLite3 (file-based)  
**Location:** `backend/skope_erp.db`  
**Size:** ~2-5 MB with demo data

### Backup Database
```bash
# Just copy the file!
copy backend\skope_erp.db backup\skope_erp_backup.db
```

### Reset Database
```bash
# Delete database and run setup again
del backend\skope_erp.db
SETUP_DATABASE.bat
```

### View/Edit Database
Use tools like:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [DBeaver](https://dbeaver.io/)
- [SQLite Studio](https://sqlitestudio.pl/)

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for details.

## 🚢 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Server requirements
- Environment variables
- Nginx configuration
- SSL setup
- Database migration to PostgreSQL

## 🔐 User Roles

| Role | Access Level | Permissions |
|------|-------------|-------------|
| **Super Admin** | All stores & features | Full system access |
| **Store Manager** | Specific store | Manage store operations |
| **Sales Staff** | Limited | Process sales, view inventory |
| **Marketing** | Marketing only | Manage campaigns |
| **Accounts** | Financial only | View reports, expenses |

## 📊 Reports Available

- Sales Reports (daily, weekly, monthly)
- Inventory Reports (stock levels, low stock alerts)
- Customer Reports (top customers, purchase patterns)
- Financial Reports (profit/loss, expenses by category)
- Comparison Analytics (store vs store, period vs period)
- Advanced Charts (line, bar, pie, area charts)

## 🔧 Configuration

### Backend Config
File: `backend/app/core/config.py`

```python
DATABASE_URL = "sqlite:///./skope_erp.db"
SECRET_KEY = "your-secret-key"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
```

### Frontend Config
File: `frontend/src/utils/api.ts`

```typescript
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
})
```

## 🐛 Troubleshooting

**"System Offline" Error:**
- Backend not running
- Run `START_BACKEND.bat`
- Wait for "Application startup complete"

**Port Already in Use:**
- Close existing processes
- Or change port in config

**Database Not Found:**
- Run `SETUP_DATABASE.bat` first
- Check if `backend/skope_erp.db` exists

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions.

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Author

SKOPE Technologies Inc.

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Contact support team

## 🎯 Version

**Version:** 1.0.0  
**Last Updated:** February 13, 2026  
**Status:** Production Ready ✅

---

### Quick Commands Cheat Sheet

```bash
# First Time Setup
SETUP_DATABASE.bat          # Create database with demo data

# Start Application
START_BOTH_SERVERS.bat      # Start both backend & frontend
START_BACKEND.bat           # Start backend only
START_FRONTEND.bat          # Start frontend only

# Development
cd backend && python -m uvicorn app.main:app --reload
cd frontend && npm run dev

# Deployment
PUSH_TO_GITHUB.bat          # Push code to GitHub
docker-compose up -d        # Docker deployment
```

---

**🎉 Your SKOPE ERP is ready to use!**

Open http://localhost:3000 and login with `admin@store.com` / `admin123`
