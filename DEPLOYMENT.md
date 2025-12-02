# Deployment Guide

This guide will help you deploy the Redo app to staging.

## Prerequisites

1. **Git repository**: Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Vercel account**: Sign up at [vercel.com](https://vercel.com) if you don't have one
3. **Supabase staging project**: Create a separate Supabase project for staging (or use your existing one)

## Step 1: Push to Git Repository

If you haven't already, initialize and push your code to a Git repository:

```bash
# If you haven't initialized git yet
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - ready for staging deployment"

# Add your remote repository (replace with your actual repo URL)
git remote add origin <your-repo-url>

# Push to main branch
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended for first-time setup)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to staging**:
   ```bash
   vercel --prod=false
   ```
   
   This will:
   - Create a staging deployment
   - Prompt you to link your project
   - Ask for environment variables

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Click **"Deploy"**

## Step 3: Configure Environment Variables

After your first deployment, you need to add environment variables:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Staging** (and Production when ready):

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-staging-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-supabase-anon-key
   ```

4. **Redeploy** your application after adding environment variables:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **"Redeploy"**

## Step 4: Set Up Supabase for Staging

1. **Create a staging Supabase project** (or use existing):
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create a new project for staging

2. **Run the database schema**:
   - Go to SQL Editor in Supabase
   - Run the contents of `supabase-schema.sql`
   - Run the contents of `supabase-storage-policies.sql`

3. **Create storage buckets**:
   - `branding` (public)
   - `source-documents` (private)
   - `customer-logos` (public)

4. **Get your Supabase credentials**:
   - Go to Project Settings → API
   - Copy the **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Verify Deployment

1. Visit your staging URL (provided by Vercel)
2. Test the application:
   - Sign up / Login
   - Create a workspace
   - Upload documents
   - Generate reports

## Continuous Deployment

Once set up, Vercel will automatically deploy:
- **Preview deployments**: Every push to any branch
- **Production deployments**: Every push to `main` (if configured)

## Branch-based Environments

You can set up different environments:
- **Staging**: Deploy from `staging` branch
- **Production**: Deploy from `main` branch

To set this up:
1. Go to **Settings** → **Git**
2. Configure branch-specific deployments
3. Set environment variables per environment

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is >= 20.9.0 (Vercel will use `.nvmrc` if present)
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/updating environment variables
- Check that variables are set for the correct environment (Staging/Production)

### Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check Supabase project is active
- Ensure RLS policies are set up correctly

## Next Steps

After staging is working:
1. Set up production environment
2. Configure custom domain
3. Set up monitoring and error tracking
4. Configure CI/CD for automated testing

