# Vercel Deployment Checklist

## Pre-Deployment Verification ✅

- [x] Production build completes successfully (`npm run build`)
- [x] Output directory is correct: `dist/chicho-chatbot-poc/browser`
- [x] Assets folder is included in build output
- [x] `vercel.json` is configured with proper rewrites for SPA routing
- [x] Security headers are configured in `vercel.json`
- [x] Budget limits are adjusted for component styles
- [x] No critical build errors (only minor CSS budget warning)

## Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in with your account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel to access your repositories
   - Select the `chicho-chatbot-poc` repository
   - Click "Import"

3. **Configure Build Settings**
   
   Vercel should auto-detect Angular. Verify these settings:
   
   ```
   Framework Preset: Angular
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist/chicho-chatbot-poc/browser
   Install Command: npm install
   ```

4. **Environment Variables**
   
   No environment variables needed for this PoC (uses mock data)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Get your deployment URL

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Verification

### 1. Application Loads ✓

- [ ] Home page loads without errors
- [ ] Floating Chicho button is visible
- [ ] Interbank colors and styles are applied correctly
- [ ] Mobile container displays on desktop
- [ ] Responsive layout works on mobile

### 2. Routing Works ✓

Test these routes directly in the browser:

- [ ] `/` - Home page
- [ ] `/chat` - Chat interface
- [ ] `/plan-ahorros` - Plan de Ahorros main view
- [ ] `/plan-ahorros/configurar` - Configuration page
- [ ] `/plan-ahorros/configurar/topes-mensuales` - Monthly limits
- [ ] `/plan-ahorros/configurar/clasificacion-gastos` - Expense classification
- [ ] `/plan-ahorros/detalle/gastos` - Expense details
- [ ] `/plan-ahorros/operaciones-recurrentes` - Recurring operations
- [ ] `/recompensas` - Rewards page
- [ ] `/alertas` - Alerts page

**Important**: Navigate directly to each URL (not through the app) to verify SPA routing fallback works.

### 3. Assets Load Correctly ✓

- [ ] Icons display properly
- [ ] Images load
- [ ] Mock data loads from `/assets/data/DataEstatica/`
- [ ] No 404 errors in browser console for assets

### 4. Functionality Works ✓

- [ ] Chat opens when clicking Chicho button
- [ ] Month selector works in Plan de Ahorros
- [ ] Sections collapse/expand
- [ ] Filters work in expense details
- [ ] Navigation between pages works
- [ ] Pull-to-refresh gesture works (if implemented)

### 5. Performance ✓

- [ ] Initial load time < 3 seconds
- [ ] No console errors
- [ ] Smooth transitions and animations
- [ ] Lazy loading works for route modules

### 6. Browser Compatibility ✓

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Common Issues & Solutions

### Issue: 404 on Direct Route Access

**Symptom**: Navigating directly to `/chat` shows 404

**Solution**: Verify `vercel.json` has the rewrite rule:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Issue: Assets Not Loading

**Symptom**: Images/icons show broken, 404 errors in console

**Solution**: 
1. Verify `angular.json` includes assets configuration
2. Check that `src/assets` folder exists
3. Rebuild: `npm run build`

### Issue: Build Fails on Vercel

**Symptom**: Deployment fails during build step

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `npm run build` works locally
3. Ensure all dependencies are in `package.json` (not devDependencies)
4. Check Node version compatibility

### Issue: Styles Not Applied

**Symptom**: Page loads but looks unstyled

**Solution**:
1. Check that `styles.scss` is compiled
2. Verify SCSS variables are imported correctly
3. Check browser console for CSS loading errors

## Vercel Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/chicho-chatbot-poc/browser",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Automatic Deployments

Once connected to Git:

- **Production**: Every push to `main` branch → Production URL
- **Preview**: Every push to other branches → Unique preview URL
- **Pull Requests**: Every PR → Preview URL with comment

## Monitoring & Analytics

Access from Vercel Dashboard:

- **Analytics**: Usage metrics and performance
- **Logs**: Real-time application logs
- **Speed Insights**: Core Web Vitals analysis
- **Deployments**: History of all deployments

## Rollback Procedure

If something goes wrong:

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments"
3. Find the last working deployment
4. Click "..." → "Promote to Production"

## Next Steps After Deployment

1. **Share URL** with stakeholders for testing
2. **Test on multiple devices** (desktop, mobile, tablet)
3. **Run Lighthouse audit** for performance insights
4. **Document any issues** found in production
5. **Set up custom domain** (optional)
6. **Configure monitoring** and alerts

## Production URL

After deployment, your app will be available at:

```
https://chicho-chatbot-poc.vercel.app
```

Or a similar URL provided by Vercel.

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Status**: Ready for deployment ✅

**Last Build**: Successful with 1 minor CSS budget warning (non-blocking)

**Build Output**: `dist/chicho-chatbot-poc/browser` (306 kB initial, lazy-loaded modules)
