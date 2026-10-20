'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatRupees } from '@/lib/money';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [resStats, resPayments] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/payments'),
      ]);
      const dataStats = await resStats.json();
      const dataPayments = await resPayments.json();
      setStats(dataStats);
      setPayments(dataPayments.payments || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [resStats, resPayments] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/payments'),
        ]);
        const dataStats = await resStats.json();
        const dataPayments = await resPayments.json();
        if (!ignore) {
          setStats(dataStats);
          setPayments(dataPayments.payments || []);
        }
      } catch {
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/admin/sync', { method: 'POST' });
      await fetchDashboardData();
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-[#3D5245] font-medium">Loading dashboard overview...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Health Status */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#085E2A] animate-pulse" />
          <div className="text-xs text-[#3D5245]">
            <span className="font-semibold text-[#0D1C14]">Bank email alerts:</span>{' '}
            {stats?.syncState?.lastSuccessAt
              ? `Active (Last checked: ${new Date(stats.syncState.lastSuccessAt).toLocaleTimeString()})`
              : 'Ready to receive alerts from your bank'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E4DD] text-xs font-semibold text-[#0D1C14] hover:bg-[#F4F7F5] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Checking...' : 'Check Inbox Now'}
          </button>

          <Link
            href="/admin/payments/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#085E2A] text-white text-xs font-semibold hover:bg-[#064B21] transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Payment Link
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D9E4DD] shadow-2xs">
          <div className="flex items-center justify-between text-[#3D5245] mb-2">
            <span className="text-xs font-semibold text-[#3D5245]">Money received today</span>
            <TrendingUp className="w-4 h-4 text-[#085E2A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0D1C14]">
            Rs {formatRupees(stats?.todayAmountPaisa || 0)}
          </div>
          <div className="text-[11px] text-[#3D5245] mt-1">{stats?.todayPaidCount || 0} payments completed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4DD] shadow-2xs">
          <div className="flex items-center justify-between text-[#3D5245] mb-2">
            <span className="text-xs font-semibold text-[#3D5245]">Completed payments</span>
            <CheckCircle2 className="w-4 h-4 text-[#085E2A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0D1C14]">
            {stats?.todayPaidCount || 0}
          </div>
          <div className="text-[11px] text-[#085E2A] font-semibold mt-1">Direct to your bank</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4DD] shadow-2xs">
          <div className="flex items-center justify-between text-[#3D5245] mb-2">
            <span className="text-xs font-semibold text-[#3D5245]">Waiting for payment</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0D1C14]">
            {stats?.pendingCount || 0}
          </div>
          <div className="text-[11px] text-[#3D5245] mt-1">Not received yet</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4DD] shadow-2xs">
          <div className="flex items-center justify-between text-[#3D5245] mb-2">
            <span className="text-xs font-semibold text-[#3D5245]">Needs your review</span>
            <AlertTriangle className="w-4 h-4 text-[#C82829]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0D1C14]">
            {(stats?.reviewCount || 0) + (stats?.unmatchedEmailsCount || 0)}
          </div>
          <div className="text-[11px] text-[#C82829] font-semibold mt-1">
            {stats?.unmatchedEmailsCount || 0} bank alerts without an order
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-2xl border border-[#D9E4DD] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#D9E4DD] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0D1C14]">Recent Payments</h2>
            <p className="text-xs text-[#3D5245]">Live list of customer payments</p>
          </div>
          <Link
            href="/admin/payments"
            className="text-xs font-semibold text-[#085E2A] hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F7F5] border-b border-[#D9E4DD] text-[#3D5245] font-semibold">
                <th className="p-4">Reference</th>
                <th className="p-4">Description</th>
                <th className="p-4">Base Amount</th>
                <th className="p-4">Total with Paisas</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4DD]">
              {payments.slice(0, 8).map((p) => (
                <tr key={p._id} className="hover:bg-[#F4F7F5]/60 transition">
                  <td className="p-4 font-mono font-semibold text-[#0D1C14]">{p.reference}</td>
                  <td className="p-4 font-medium text-[#0D1C14]">{p.title}</td>
                  <td className="p-4 font-mono text-[#3D5245]">Rs {formatRupees(p.baseAmountPaisa)}</td>
                  <td className="p-4 font-mono font-bold text-[#0D1C14]">
                    Rs {p.payableAmountPaisa ? formatRupees(p.payableAmountPaisa) : formatRupees(p.baseAmountPaisa)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === 'PAID'
                          ? 'bg-[#EBF3EE] text-[#085E2A] border border-[#D9E4DD]'
                          : p.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : p.status === 'CREATED'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-[#3D5245]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#3D5245]">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/payments/${p._id}`}
                      className="text-xs font-semibold text-[#085E2A] hover:text-[#064B21] inline-flex items-center gap-1"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#3D5245]">
                    No payments yet. Click &quot;New Payment Link&quot; above to create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
