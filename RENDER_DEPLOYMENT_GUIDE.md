# SKOPE ERP - Render Deployment Guide

This guide will help you deploy the SKOPE ERP application (both backend and frontend) to Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Git** - Ensure all changes are committed and pushed to GitHub

## 🚀 Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `vraj1091/SKOPE_ERP`
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to create both services

3. **Wait for Deployment**
   - Backend will deploy first (takes ~5-10 minutes)
   - Frontend will deploy after (takes ~3-5 minutes)
   - You'll get URLs for both services

### Option 2: Manual Deployment

#### Deploy Backend

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `skope-erp-backend`
   - **Runtime**: Python 3
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python setup_and_seed.py --reset`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. Add Environment Variables:
   - `PYTHON_VERSION` = `3.11.0`
   - `DATABASE_URL` = `sqlite:////opt/render/project/src/backend/skope_erp.db`
   - `SECRET_KEY` = (Generate a random string)
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
   - `RENDER` = `true`

5. Click "Create Web Service"

#### Deploy Frontend

1. Go to Render Dashboard → "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `skope-erp-frontend`
   - **Branch**: main
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variables:
   - `NODE_VERSION` = `18.17.0`
   - `VITE_API_URL` = `https://skope-erp-backend.onrender.com` (use your actual backend URL)

5. Click "Create Static Site"

## 🔧 Post-Deployment Configuration

### Update Frontend API URL

After backend is deployed, you'll get a URL like: `https://skope-erp-backend.onrender.com`

1. Go to Frontend service settings
2. Update `VITE_API_URL` environment variable with your backend URL
3. Trigger a manual deploy

### Update Backend CORS Settings (Optional)

If you want to restrict CORS to only your frontend domain:

1. Edit `backend/app/core/config.py`
2. Update `CORS_ORIGINS` list with your frontend URL
3. Commit and push changes

## 📊 Database Persistence

**Important**: Render's free tier does NOT persist files between deployments!

### Solutions:

1. **Upgrade to Paid Plan** ($7/month) - Gets persistent disk storage
2. **Use PostgreSQL** (Free tier available):
   - Create a PostgreSQL database on Render
   - Update `DATABASE_URL` to use PostgreSQL
   - Modify SQLAlchemy models if needed

3. **External Database**:
   - Use [Supabase](https://supabase.com) (Free PostgreSQL)
   - Use [PlanetScale](https://planetscale.com) (Free MySQL)
   - Use [MongoDB Atlas](https://www.mongodb.com/atlas) (Free MongoDB)

## 🌐 Access Your Application

After deployment:

- **Backend API**: `https://skope-erp-backend.onrender.com`
- **Frontend**: `https://skope-erp-frontend.onrender.com`
- **API Docs**: `https://skope-erp-backend.onrender.com/docs`

### Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`

## 🐛 Troubleshooting

### Backend Issues

1. **Check Logs**: Go to backend service → Logs tab
2. **Database not found**: Ensure `setup_and_seed.py` ran successfully
3. **Import errors**: Check all dependencies are in `requirements.txt`

### Frontend Issues

1. **Blank page**: Check browser console for errors
2. **API not connecting**: Verify `VITE_API_URL` is correct
3. **404 errors**: Ensure `_redirects` file exists in `public/` folder

### Common Errors

**Error**: "Database is locked"
- **Solution**: SQLite doesn't work well with multiple workers. Set `WEB_CONCURRENCY=1` in backend env vars

**Error**: "CORS policy blocked"
- **Solution**: Add frontend URL to `CORS_ORIGINS` in `backend/app/core/config.py`

**Error**: "Module not found"
- **Solution**: Ensure all imports use relative paths, not absolute

## 🔄 Continuous Deployment

Every time you push to GitHub:
1. Render automatically detects changes
2. Rebuilds and redeploys affected services
3. Takes ~5-10 minutes total

To disable auto-deploy:
- Go to service settings
- Turn off "Auto-Deploy"

## 💰 Cost Considerations

**Free Tier Limitations**:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month total (enough for 1 service 24/7)
- No persistent disk storage

**Paid Tier Benefits** ($7/month per service):
- Always-on (no spin-down)
- Persistent disk storage
- Better performance
- Custom domains

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## 🆘 Support

If you encounter issues:
1. Check Render service logs
2. Review browser console errors
3. Verify environment variables
4. Check GitHub Actions (if enabled)

---

**Note**: Remember to update the `VITE_API_URL` in the frontend after the backend is deployed!
