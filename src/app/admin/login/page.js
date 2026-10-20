'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Login failed. Please check your credentials.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-6 text-[#0D1C14]">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#D9E4DD] shadow-sm p-8">
        <div className="text-center mb-8">
          <BrandLogo className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-[#0D1C14]">Merchant Login</h1>
          <p className="text-xs text-[#3D5245] mt-1 font-medium">Sign in to manage your store&apos;s payments</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#C82829] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#3D5245] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#3D5245] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A] transition"
              />
            </div>
            <div className="text-[11px] text-[#3D5245] mt-1">Default credentials pre-filled</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-xs"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#D9E4DD] flex items-center justify-center gap-1.5 text-[#3D5245] text-xs">
          <ShieldCheck className="w-4 h-4 text-[#085E2A]" />
          <span>Secure direct access</span>
        </div>
      </div>
    </div>
  );
}
