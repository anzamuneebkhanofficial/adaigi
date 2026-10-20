'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRupees } from '@/lib/money';

export default function AdminPaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (statusFilter) params.set('status', statusFilter);
        if (search.trim()) params.set('search', search.trim());

        const res = await fetch(`/api/admin/payments?${params}`);
        const data = await res.json();
        if (!ignore) {
          setPayments(data.payments || []);
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
  }, [page, statusFilter, search]);

  const handlePageChange = (newPage) => {
    setLoading(true);
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setLoading(true);
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setLoading(true);
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0D1C14]">Payments</h1>
          <p className="text-xs text-[#3D5245]">View and search all customer payment links</p>
        </div>

        <Link
          href="/admin/payments/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#085E2A] text-white text-xs font-semibold hover:bg-[#064B21] transition cursor-pointer shadow-xs self-start"
        >
          Create Payment
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E4DD] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#3D5245] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search reference, order, or description..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#3D5245]" />
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="px-3 py-2 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs focus:outline-hidden focus:border-[#085E2A] text-[#0D1C14] font-medium"
          >
            <option value="">All Statuses</option>
            <option value="CREATED">CREATED</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-[#D9E4DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F7F5] border-b border-[#D9E4DD] text-[#3D5245] font-semibold">
                <th className="p-4">Reference</th>
                <th className="p-4">Description</th>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Base Amount</th>
                <th className="p-4">Total with Paisas</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4DD]">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-[#F4F7F5]/60 transition">
                  <td className="p-4 font-mono font-bold text-[#0D1C14]">{p.reference}</td>
                  <td className="p-4 font-medium text-[#0D1C14]">{p.title}</td>
                  <td className="p-4 font-mono text-[#3D5245]">{p.orderRef || '—'}</td>
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
                  <td colSpan="8" className="p-8 text-center text-[#3D5245]">
                    {loading ? 'Loading payments...' : 'No matching payments found.'}
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

