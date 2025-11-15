# AssignMe - Render Deployment Guide

## 🚀 Quick Deploy to Render

This project is fully configured for one-click deployment to Render.

### Prerequisites
- A [Render account](https://render.com) (free tier available)
- A GitHub account
- Git installed locally

### Deployment Steps

#### Option 1: Deploy via Render Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the service:**
   - **Name**: `assignme-web` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid for better performance)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Your app will be live at: `https://your-app-name.onrender.com`

#### Option 2: Deploy using render.yaml (Blueprint)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Deploy via Blueprint:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml` and configure services

### Environment Variables

For the main web service, no environment variables are required. The app uses pre-configured external APIs.

If deploying optional backend services, you'll need to set:
- **GEMINI_API_KEY**: Your Google Gemini API key (for Q&A service)

### Optional: Deploy Backend Services

The `render.yaml` includes commented configurations for:
1. **FontForge Backend** (Docker-based font generation)
2. **Gemini Q&A Service** (Python FastAPI service)

To enable these services:
1. Uncomment the relevant sections in `render.yaml`
2. Update API URLs in `Assignme-main/js/config.js` to point to your deployed services
3. Add required environment variables in Render dashboard

## 🧪 Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open browser
# Visit: http://localhost:3000
```

## 📁 Project Structure

```
asignme/
├── server.js              # Express server for static hosting
├── package.json           # Node.js dependencies and scripts
├── render.yaml           # Render deployment configuration
├── .gitignore            # Git ignore rules
├── .renderignore         # Render deployment ignore rules
└── Assignme-main/        # Main application files
    ├── index.html        # Entry point
    ├── style.css         # Global styles
    ├── js/               # JavaScript files
    ├── canvapage/        # Canvas functionality
    ├── captureimg/       # Image capture feature
    └── fontforge_backend/ # Font generation service (optional)
```

## 🔧 Configuration Files Explained

### `server.js`
Express server that serves static files with:
- CORS enabled for cross-origin requests
- Gzip compression for faster loading
- SPA routing support
- Static asset caching

### `render.yaml`
Blueprint configuration with:
- Main web service (Node.js)
- Optional backend services (commented out)
- Health checks and environment variables

### `package.json`
Node.js configuration with:
- Express for serving static files
- Compression for performance
- CORS for API access

## 🐛 Troubleshooting

### Build Fails
- Check that `package.json` is at the root level
- Verify Node.js version compatibility (>=18.0.0)
- Check build logs in Render dashboard

### App Not Loading
- Check that `Assignme-main/index.html` exists
- Verify static file paths are correct
- Check browser console for errors

### API Errors
- External APIs may require updates if endpoints change
- Check `Assignme-main/js/config.js` for API configurations
- Verify CORS is properly configured

## 📊 Performance Optimization

The deployment includes:
- ✅ Gzip compression
- ✅ Static asset caching (1 day)
- ✅ ETags for cache validation
- ✅ Optimized Express configuration

## 🔄 Updates and Redeployment

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

## 📝 Additional Notes

- **Free Tier Limitations**: Render's free tier may spin down after inactivity
- **Custom Domain**: Can be configured in Render dashboard
- **SSL**: Automatically provided by Render
- **Logs**: Available in Render dashboard under "Logs" tab

## 🆘 Support

For issues:
1. Check Render build/runtime logs
2. Review browser console errors
3. Verify all file paths are correct
4. Ensure external APIs are accessible

## 📄 License

MIT License - See LICENSE file for details

---

**Happy Deploying! 🎉**
