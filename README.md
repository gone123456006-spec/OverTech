# E-commercce
fully ecommerce

## Vercel Deployment

### If you get 404 NOT_FOUND:

1. **Vercel Dashboard** → Project → **Settings** → **General**
2. Set **Root Directory** to `frontend` (click Edit, enter `frontend`, save)
3. **Build & Development Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Redeploy** (Deployments → ⋮ → Redeploy)

The `frontend/vercel.json` contains rewrites so client-side routes (e.g. `/category/clothes`) work correctly.
