'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Mail,
  Settings,
  LogOut,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

function AdminNavContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setSession(data);
      })
      .catch(() => {});
  }, []);

  if (pathname === '/admin/login') {
    return children;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Payments', href: '/admin/payments', icon: Receipt },
    { label: 'Create Payment', href: '/admin/payments/new', icon: PlusCircle },
    { label: 'Bank Emails', href: '/admin/emails', icon: Mail },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col md:flex-row text-[#0D1C14]">
      {/* Sleek Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#D9E4DD] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#D9E4DD]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <BrandLogo className="w-7 h-7" />
            <div>
              <span className="font-bold text-sm tracking-tight text-[#0D1C14]">Adaigi</span>
              <span className="text-[10px] ml-1.5 font-bold uppercase tracking-wider text-[#085E2A] bg-[#EBF3EE] px-1.5 py-0.5 rounded-sm">
                Merchant
              </span>
            </div>
          </Link>

          <Link
            href="/"
            title="View Home Page"
            className="p-1.5 text-[#3D5245] hover:text-[#0D1C14] hover:bg-[#F4F7F5] rounded-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Merchant Identity Card */}
        <div className="p-4 border-b border-[#D9E4DD]">
          <div className="bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#085E2A]" />
              <span className="font-semibold text-[#0D1C14] truncate">{session?.sellerName || 'Merchant Store'}</span>
            </div>
            <div className="font-mono text-[11px] text-[#3D5245]">
              IBAN: {session?.ibanTail ? `•••• ${session.ibanTail}` : 'Not configured'}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-[#EBF3EE] text-[#085E2A] border border-[#D9E4DD] shadow-2xs'
                    : 'text-[#3D5245] hover:text-[#0D1C14] hover:bg-[#F4F7F5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#085E2A]' : 'text-[#3D5245]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[#D9E4DD]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#C82829] hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F4F7F5]">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#3D5245] font-medium">Loading merchant portal...</div>}>
      <AdminNavContent>{children}</AdminNavContent>
    </Suspense>
  );
}
