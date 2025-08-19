# 🚀 Deployment Guide

## Prerequisites
- Supabase project with database set up
- Git repository with your code
- Vercel or Netlify account

## 🎯 **Option 1: Deploy to Vercel (Recommended)**

### Step 1: Prepare Your Supabase Project
1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

### Step 2: Deploy to Vercel
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = your_supabase_url
     - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Step 3: Connect to Git (Optional)
1. In Vercel dashboard, go to Settings > Git
2. Connect your GitHub repository
3. Enable automatic deployments on push

## 🎯 **Option 2: Deploy to Netlify**

### Step 1: Build Your Project
```bash
cd frontend
npm run build
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder
3. Or connect your Git repository

### Step 3: Set Environment Variables
1. Go to Site Settings > Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your_supabase_url
   - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key

### Step 4: Configure Redirects
Create `_redirects` file in your `public` folder:
```
/*    /index.html   200
```

## 🔧 **Environment Variables**

Create a `.env` file in your `frontend` directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🚨 **Important Security Notes**

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Use environment variables** in production
3. **Enable Row Level Security (RLS)** in Supabase
4. **Restrict API access** to only necessary tables

## 🧪 **Testing Before Deployment**

1. **Local testing:**
   ```bash
   npm run dev
   ```

2. **Build test:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Check environment variables:**
   - Verify Supabase connection works
   - Test company detail pages
   - Verify source document links

## 🎉 **Post-Deployment Checklist**

- [ ] Environment variables set correctly
- [ ] Supabase connection working
- [ ] Company detail pages accessible
- [ ] Source document links working
- [ ] Responsive design on mobile
- [ ] Performance under 3 seconds
- [ ] Error handling working

## 🆘 **Troubleshooting**

### Common Issues:
1. **Environment variables not loading:**
   - Restart your development server
   - Check variable names (must start with `VITE_`)

2. **Supabase connection errors:**
   - Verify URL and key are correct
   - Check if RLS policies are configured
   - Ensure tables exist in database

3. **Build errors:**
   - Check TypeScript errors: `npm run type-check`
   - Verify all imports are correct
   - Check for missing dependencies

### Support:
- Check browser console for errors
- Verify Supabase dashboard for connection issues
- Review Vercel/Netlify build logs
