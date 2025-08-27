# 🚀 Debtwise Vercel Deployment Guide

## Prerequisites
- [x] Vercel account (free tier works fine)
- [x] GitHub repository with your code
- [x] Neon PostgreSQL database credentials
- [x] Google AI API key (already configured)

## Step 1: Push Code to GitHub
Make sure your latest code is pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: Prepare for Vercel deployment"
git push origin main
```

## Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Vercel will automatically detect it as a Node.js project

## Step 3: Configure Environment Variables
In your Vercel project dashboard, go to "Settings" > "Environment Variables" and add:

### Required Variables:
```
NODE_ENV = production
GOOGLE_GENAI_API_KEY = your_google_ai_api_key_here
PROJECT_ID = your_project_id_here
DATABASE_URL = your_neon_database_connection_string
JWT_SECRET = your_secure_jwt_secret_here
LOG_LEVEL = info
```

### Disabled Services (set these to "disabled"):
```
STRIPE_SECRET_KEY = disabled
FLINK_CLIENT_ID = disabled  
FLINK_SECRET = disabled
FLINK_ENVIRONMENT = disabled
```

### 🗃️ Neon Database Setup
If you need the Neon database connection string:
1. Go to your Neon dashboard
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
3. Paste this as your `DATABASE_URL` in Vercel

### 🔐 JWT Secret Generation
Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Build Settings
Vercel should automatically detect:
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install`

## Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Your app will be available at: `https://your-repo-name.vercel.app`

## Step 6: Configure Google OAuth
Update your Google Cloud Console OAuth settings:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Find your OAuth 2.0 Client ID
3. Add your Vercel domain to:
   - **Authorized JavaScript origins**: `https://your-app-name.vercel.app`
   - **Authorized redirect URIs**: `https://your-app-name.vercel.app/auth/callback`

## 🎯 Expected Result
- ✅ Frontend: React app served from Vercel CDN
- ✅ Backend: Node.js API running on Vercel serverless functions  
- ✅ Database: Connected to Neon PostgreSQL
- ✅ Authentication: Google OAuth working
- ✅ AI Features: Google Genkit with Gemini AI
- ❌ Payments: Stripe disabled (can enable later)
- ❌ Banking: Flink API disabled (can enable later)

## 🚨 Common Issues & Solutions

### Build Errors:
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Check TypeScript compilation errors

### Database Connection:
- Verify Neon database URL format
- Check database is running and accessible
- Ensure SSL mode is enabled

### Authentication Issues:
- Update Google OAuth redirect URIs
- Check JWT_SECRET is set
- Verify Google API key permissions

## 📈 Post-Deployment
1. Test all core features:
   - Login with Google ✅
   - Debt analysis ✅ 
   - Payment simulator ✅
   - Behavioral insights ✅
2. Monitor logs in Vercel dashboard
3. Set up custom domain (optional)

Your app will be live at: `https://your-app-name.vercel.app`