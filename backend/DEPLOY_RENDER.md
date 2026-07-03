# Deploy Backend to Render

## 1. MongoDB Atlas (required for production)

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Database Access → create a user with password
3. Network Access → add `0.0.0.0/0` (allow from anywhere) for Render
4. Connect → Drivers → copy connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/overtech?retryWrites=true&w=majority
   ```

## 2. Deploy on Render

### Option A — Blueprint (`render.yaml`)

1. Push this repo to GitHub
2. Render Dashboard → **New** → **Blueprint**
3. Connect repo — Render reads `render.yaml` at repo root
4. Set secret environment variables when prompted

### Option B — Manual Web Service

1. Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install --omit=dev`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

## 3. Environment variables (Render Dashboard)

| Variable | Example | Required |
|----------|---------|----------|
| `NODE_ENV` | `production` | Yes |
| `MONGODB_URI` | `mongodb+srv://...` | Yes |
| `RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` | Yes |
| `RAZORPAY_KEY_SECRET` | your secret | Yes |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Yes |

`FRONTEND_URL` can be comma-separated for multiple origins:
```
https://your-app.vercel.app,https://www.yourdomain.com
```

Render sets `PORT` automatically — do not hardcode it.

## 4. Frontend (after backend is live)

Set in your frontend host (Vercel/Netlify):

```
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Rebuild the frontend so API calls hit Render.

## 5. Verify deployment

- `GET https://your-api.onrender.com/api/health` → `{ "status": "ok", "database": "connected" }`
- `GET https://your-api.onrender.com/api/content/special-offers` → offers JSON
- Test Razorpay checkout from the live frontend

## Notes

- Special offers and payment transactions are stored in **MongoDB** on production (not local files).
- Use Razorpay **live keys** only when going live; keep test keys for staging.
- Never commit `.env` — only set secrets in Render Dashboard.
