# SKOPE ERP - Store Management System

A comprehensive ERP system for retail store management with inventory, sales, customer management, financial tracking, and marketing automation.

## 🚀 Quick Start

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python setup_and_seed.py --reset
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### One-Click Setup (Windows)
```bash
SETUP_AND_RUN.bat
```

## 📦 Deployment

### Deploy to Render

See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Connect to Render
3. Render auto-detects `render.yaml`
4. Both backend and frontend deploy automatically

## 🔑 Default Credentials

- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`

## 📊 Features

- **Inventory Management**: Track products, stock levels, SKUs
- **Sales Management**: POS system, invoices, receipts
- **Customer Management**: CRM, purchase history, loyalty
- **Financial Tracking**: Expenses, revenue, profit analysis
- **Reports & Analytics**: Sales reports, inventory reports, financial dashboards
- **Marketing Automation**: Campaigns, email marketing, social media integration
- **Multi-Store Support**: Manage multiple store locations
- **User Management**: Role-based access control
- **AI Chatbot**: Customer support automation

## 🛠️ Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- JWT Authentication
- Pydantic Validation

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Zustand (State Management)
- Recharts (Data Visualization)

## 📁 Project Structure

```
SKOPE_ERP/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Config, security
│   │   ├── db/              # Database models
│   │   └── schemas/         # Pydantic schemas
│   ├── setup_and_seed.py    # Database setup script
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management
│   │   └── utils/           # Utilities
│   ├── public/              # Static assets
│   └── package.json         # Node dependencies
├── render.yaml              # Render deployment config
└── RENDER_DEPLOYMENT_GUIDE.md
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./skope_erp.db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
