import { useState, useEffect } from 'react';
import { Lock, Loader2, LayoutGrid } from 'lucide-react';
import { adminLoginApi, verifyAdminSession } from '../utils/ordersApi';
import { setAdminToken, clearAdminToken, isAdminLoggedIn } from '../utils/adminAuth';
import { toast } from 'sonner';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(isAdminLoggedIn());

  useEffect(() => {
    if (!checking) return;
    verifyAdminSession().then((ok) => {
      setChecking(false);
      if (ok) onSuccess();
      else clearAdminToken();
    });
  }, [checking, onSuccess]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#134e4a]" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Enter admin password');
      return;
    }

    setLoading(true);
    try {
      const token = await adminLoginApi(password);
      setAdminToken(token);
      toast.success('Welcome, Admin');
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1D1D1F] flex items-center justify-center mb-4">
            <LayoutGrid className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[#1D1D1F]">Admin Login</h1>
          <p className="text-sm text-[#6E6E73] mt-1 text-center">
            Enter your password to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="sr-only">
              Admin password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9EA7]" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
