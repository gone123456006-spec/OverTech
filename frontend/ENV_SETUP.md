# Frontend Environment Configuration

## Environment Files Created

### `.env`
Contains development environment variables:
- `VITE_API_BASE_URL` - Backend API URL (http://localhost:5000)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_NODE_ENV` - Environment mode

### `.env.example`
Template file for environment setup (same as `.env` for reference)

### `.gitignore`
Configured to exclude:
- `node_modules/`
- `.env` and `.env.local`
- Build output (`dist/`, `build/`)
- Logs and OS files

## Using Environment Variables in Frontend

In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client.

### Access in Code
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

### Example Usage
If you want to use the API base URL instead of the proxy:

```typescript
// In AuthContext.tsx or LoginModal.tsx
const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const response = await fetch(`${API_URL}/api/auth/send-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile })
});
```

## Current Setup

**With Proxy (Recommended for Development):**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API calls: `/api/auth/*` → proxied to `http://localhost:5000/api/auth/*`

**Without Proxy (For Production):**
- Use `VITE_API_BASE_URL` in fetch calls
- Build with: `npm run build`
- Deploy frontend and backend separately

## Notes

- ✅ `.env` file created with default values
- ✅ `.env.example` created as template
- ✅ `.gitignore` created to protect sensitive files
- ✅ Proxy configuration already in `vite.config.ts`

The frontend environment is now properly configured!
