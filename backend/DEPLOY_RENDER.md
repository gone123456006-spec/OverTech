# Deploy Backend to Render

## Render environment variables (required)

Set these in **Render Dashboard → your service → Environment**:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://prabhakarkumargupta901_db_user:YOUR_PASSWORD@cluster0.ctovf9q.mongodb.net/overtech?retryWrites=true&w=majority&appName=Cluster0` |
| `RAZORPAY_KEY_ID` | `rzp_test_T94xd6dgnawXD5` |
| `RAZORPAY_KEY_SECRET` | your Razorpay secret |
| `FRONTEND_URL` | `https://over-tech-psi.vercel.app` |

**Important**
- `MONGODB_URI` value can be the connection string only, or a full `.env` line — the server auto-strips a duplicate `MONGODB_URI=` prefix.
- Hostname must be `cluster0.ctovf9q.mongodb.net` — **not** `cluster.mongodb.net`.
- `FRONTEND_URL` can be comma-separated for multiple sites (no trailing slash).

Render sets `PORT` automatically — do not hardcode it.

## MongoDB Atlas

1. [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access** → add `0.0.0.0/0`
2. **Database Access** → user `prabhakarkumargupta901_db_user` with password
3. **Connect → Drivers** → copy the `mongodb+srv://...` string

## Render service settings

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Or use **Blueprint** with `render.yaml` at repo root (push to GitHub first).

## Deploy checklist

1. Push latest code to GitHub (`render.yaml`, `backend/config/env.js`, `backend/config/database.js`)
2. Set all environment variables above on Render
3. **Manual Deploy** (or auto-deploy on push)
4. Open logs — you should see:
   ```
   📋 Production config:
      • MongoDB host: cluster0.ctovf9q.mongodb.net
   ✅ MongoDB Connected: ...
   🚀 Server running on port ...
   ```
5. Verify: `GET https://overtech-api.onrender.com/api/health`
   ```json
   { "status": "ok", "database": "connected" }
   ```

## Frontend (Vercel)

Set in Vercel → Environment Variables:

```
VITE_APP_URL=https://over-tech-psi.vercel.app
```

Or set the same in **Vercel → Environment Variables** (Production). The repo includes `frontend/.env.production` for builds.

## Common errors

| Log message | Fix |
|-------------|-----|
| `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net` | Wrong placeholder URI on Render — use `cluster0.ctovf9q.mongodb.net` |
| `MONGODB_URI was pasted with a duplicate "MONGODB_URI=" prefix` | Remove extra `MONGODB_URI=` from the value |
| `Cannot start production server without MongoDB` | Check Atlas Network Access (`0.0.0.0/0`) and password |
| `CORS blocked origin` | Add your Vercel URL to `FRONTEND_URL` on Render |
| Health check timeout | Server crashed on startup — check Render logs |

## Notes

- Special offers and payment transactions use **MongoDB** in production.
- Never commit `.env` — secrets only in Render Dashboard.
- Use Razorpay live keys only when going live.
