# 🚀 SKOPE ERP - Render Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub (vraj1091/SKOPE_ERP)
- [x] render.yaml configuration file created
- [x] Backend configured for environment variables
- [x] Frontend configured for production API URL
- [x] _redirects file added for SPA routing
- [x] .env.example files created
- [x] README updated with deployment instructions
- [x] Database setup script ready (setup_and_seed.py)

## 📋 Deployment Steps

### 1. Sign up for Render
- Go to https://render.com
- Sign up with GitHub account
- Verify email

### 2. Deploy Using Blueprint (Automatic)

1. Click "New +" → "Blueprint"
2. Connect GitHub repository: `vraj1091/SKOPE_ERP`
3. Render will detect `render.yaml`
4. Click "Apply"
5. Wait for deployment (~10-15 minutes)

### 3. Get Your URLs

After deployment completes:
- **Backend**: `https://skope-erp-backend.onrender.com`
- **Frontend**: `https://skope-erp-frontend.onrender.com`
- **API Docs**: `https://skope-erp-backend.onrender.com/docs`

### 4. Update Frontend Environment Variable

1. Go to Frontend service in Render dashboard
2. Navigate to "Environment" tab
3. Update `VITE_API_URL` with your actual backend URL
4. Click "Save Changes"
5. Trigger manual deploy (or wait for auto-deploy)

### 5. Test the Application

1. Open frontend URL in browser
2. Login with: `admin` / `admin123`
3. Check dashboard loads with data
4. Test creating a sale
5. Verify API calls are working

## ⚠️ Important Notes

### Database Persistence
**WARNING**: Render free tier does NOT persist files!

Your SQLite database will be reset on every deployment. Solutions:

1. **Upgrade to Paid Plan** ($7/month)
   - Persistent disk storage
   - Always-on (no spin-down)

2. **Use PostgreSQL** (Recommended for production)
   - Create PostgreSQL database on Render (free tier available)
   - Update `DATABASE_URL` environment variable
   - Modify code to use PostgreSQL instead of SQLite

3. **Use External Database**
   - Supabase (Free PostgreSQL)
   - PlanetScale (Free MySQL)
   - MongoDB Atlas (Free MongoDB)

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month total
- No persistent disk storage

## 🔧 Post-Deployment Configuration

### Optional: Restrict CORS

Edit `backend/app/core/config.py`:
```python
CORS_ORIGINS: list = [
    "https://skope-erp-frontend.onrender.com",
    "http://localhost:3000"  # Keep for local development
]
```

### Optional: Custom Domain

1. Go to service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

## 🐛 Troubleshooting

### Backend Not Starting
- Check logs in Render dashboard
- Verify all dependencies in requirements.txt
- Ensure Python version is 3.11.0

### Frontend Not Loading
- Check browser console for errors
- Verify VITE_API_URL is correct
- Check _redirects file exists in dist folder

### Database Errors
- Ensure setup_and_seed.py ran successfully
- Check build logs for errors
- Verify DATABASE_URL is correct

### CORS Errors
- Check backend CORS configuration
- Verify frontend URL is allowed
- Check browser console for specific error

## 📊 Monitoring

### View Logs
1. Go to service in Render dashboard
2. Click "Logs" tab
3. Real-time logs will appear

### View Metrics
1. Go to service in Render dashboard
2. Click "Metrics" tab
3. View CPU, memory, bandwidth usage

## 🔄 Continuous Deployment

Every push to `main` branch will:
1. Trigger automatic rebuild
2. Deploy new version
3. Takes ~5-10 minutes

To disable:
- Go to service settings
- Turn off "Auto-Deploy"

## 💡 Tips

1. **Test locally first** before deploying
2. **Use environment variables** for sensitive data
3. **Monitor logs** after deployment
4. **Set up alerts** in Render dashboard
5. **Use PostgreSQL** for production (not SQLite)

## 📞 Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/vraj1091/SKOPE_ERP/issues

---

**Ready to deploy?** Follow the steps above and your app will be live in ~15 minutes! 🎉
