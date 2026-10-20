'use client';

import { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRupees } from '@/lib/money';

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UNMATCHED');
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams({ status: activeTab, page: String(page) });
        const res = await fetch(`/api/admin/emails?${params}`);
        const data = await res.json();
        if (!ignore) {
          setEmails(data.emails || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [activeTab, page]);

  const handlePageChange = (newPage) => {
    setLoading(true);
    setPage(newPage);
  };

  const handleTabChange = (tab) => {
    setLoading(true);
    setActiveTab(tab);
    setPage(1);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await fetch('/api/admin/sync', { method: 'POST' });
      const params = new URLSearchParams({ status: activeTab, page: String(page) });
      const res = await fetch(`/api/admin/emails?${params}`);
      const data = await res.json();
      setEmails(data.emails || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0D1C14]">Bank Email Alerts</h1>
          <p className="text-xs text-[#3D5245]">
            Payment alert emails received from your bank
          </p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D9E4DD] text-[#0D1C14] text-xs font-semibold hover:bg-[#F4F7F5] transition cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Checking inbox...' : 'Check Inbox Now'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D9E4DD] gap-6 text-xs font-semibold">
        <button
          onClick={() => handleTabChange('UNMATCHED')}
          className={`pb-3 border-b-2 cursor-pointer transition ${
            activeTab === 'UNMATCHED'
              ? 'border-[#085E2A] text-[#085E2A]'
              : 'border-transparent text-[#3D5245] hover:text-[#0D1C14]'
          }`}
        >
          Unmatched Alerts
        </button>

        <button
          onClick={() => handleTabChange('MATCHED')}
          className={`pb-3 border-b-2 cursor-pointer transition ${
            activeTab === 'MATCHED'
              ? 'border-[#085E2A] text-[#085E2A]'
              : 'border-transparent text-[#3D5245] hover:text-[#0D1C14]'
          }`}
        >
          Matched to Orders
        </button>
      </div>

      {/* Email Feed */}
      <div className="bg-white rounded-2xl border border-[#D9E4DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F7F5] border-b border-[#D9E4DD] text-[#3D5245] font-semibold">
                <th className="p-4">Bank Sender</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Received</th>
                <th className="p-4">Status</th>
                <th className="p-4">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4DD]">
              {emails.map((e) => (
                <tr key={e._id} className="hover:bg-[#F4F7F5]/60 transition">
                  <td className="p-4 font-semibold text-[#0D1C14]">{e.from}</td>
                  <td className="p-4 font-medium text-[#0D1C14] max-w-xs truncate">{e.subject}</td>
                  <td className="p-4 font-mono font-bold text-[#0D1C14]">
                    {e.amountPaisa ? `Rs ${formatRupees(e.amountPaisa)}` : 'Not detected'}
                  </td>
                  <td className="p-4 font-mono text-[#3D5245]">{e.reference || '—'}</td>
                  <td className="p-4 text-[#3D5245]">{new Date(e.receivedAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        e.status === 'MATCHED'
                          ? 'bg-[#EBF3EE] text-[#085E2A] border border-[#D9E4DD]'
                          : 'bg-rose-50 text-[#C82829] border border-rose-200'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#3D5245] text-[11px]">
                    {e.expireAt ? new Date(e.expireAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {emails.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#3D5245]">
                    {loading ? 'Fetching email alerts...' : `No ${activeTab.toLowerCase()} emails found.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#D9E4DD] bg-[#F4F7F5]">
            <span className="text-[11px] text-[#3D5245]">
              {total} total · Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#D9E4DD] text-xs font-semibold text-[#0D1C14] hover:bg-[#EBF3EE] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#D9E4DD] text-xs font-semibold text-[#0D1C14] hover:bg-[#EBF3EE] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
