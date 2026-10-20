'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  History,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Suspense } from 'react';
import { formatRupees } from '@/lib/money';

function DetailContent() {
  const { id } = useParams();
  const router = useRouter();

  const [payment, setPayment] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualNote, setManualNote] = useState('');
  const [settling, setSettling] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/payments/${id}`);
      const data = await res.json();
      setPayment(data.payment);
      setAuditLogs(data.auditLogs || []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [fetchDetail]);

  const handleManualConfirm = async () => {
    if (!confirm('Are you sure you want to manually mark this payment as PAID?')) return;
    setSettling(true);
    try {
      await fetch(`/api/admin/payments/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: manualNote }),
      });
      await fetchDetail();
      setManualNote('');
    } finally {
      setSettling(false);
    }
  };

  if (loading || !payment) {
    return <div className="text-xs text-[#3D5245] font-medium">Loading payment details...</div>;
  }

  const baseRupees = (payment.baseAmountPaisa / 100).toFixed(2);
  const payableRupees = payment.payableAmountPaisa
    ? (payment.payableAmountPaisa / 100).toFixed(2)
    : baseRupees;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/payments"
          className="p-2 rounded-xl bg-white border border-[#D9E4DD] text-[#3D5245] hover:text-[#0D1C14] hover:bg-[#F4F7F5] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#0D1C14]">
            Payment {payment.reference}
          </h1>
          <p className="text-xs text-[#3D5245]">Payment details and timeline</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#0D1C14] border-b border-[#D9E4DD] pb-3">
              Payment Details
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#3D5245]">Description:</span>
                <div className="font-semibold text-[#0D1C14] text-sm mt-0.5">{payment.title}</div>
              </div>

              <div>
                <span className="text-[#3D5245]">Status:</span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      payment.status === 'PAID'
                        ? 'bg-[#EBF3EE] text-[#085E2A] border border-[#D9E4DD]'
                        : payment.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-[#3D5245]'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#3D5245]">Base Amount:</span>
                <div className="font-mono font-semibold text-[#0D1C14] mt-0.5">Rs {baseRupees}</div>
              </div>

              <div>
                <span className="text-[#3D5245]">Total with Paisas:</span>
                <div className="font-mono font-bold text-[#085E2A] mt-0.5">Rs {payableRupees}</div>
              </div>

              <div>
                <span className="text-[#3D5245]">Public Checkout ID:</span>
                <div className="font-mono text-[#0D1C14] mt-0.5">{payment.publicId}</div>
              </div>

              <div>
                <span className="text-[#3D5245]">Customer Link:</span>
                <div className="mt-0.5">
                  <a
                    href={`/pay/${payment.publicId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#085E2A] hover:text-[#064B21] underline inline-flex items-center gap-1 font-semibold"
                  >
                    Open Page
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E4DD] pb-3">
              <History className="w-4 h-4 text-[#3D5245]" />
              <h2 className="text-sm font-bold text-[#0D1C14]">Timeline</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#085E2A] mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-[#0D1C14]">Created Link</div>
                  <div className="text-[#3D5245]">{new Date(payment.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {payment.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0D1C14]">Customer Opened Link</div>
                    <div className="text-[#3D5245]">{new Date(payment.startedAt).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {payment.paidAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#085E2A] mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0D1C14]">Payment Confirmed ({payment.paidVia === 'AUTO_EMAIL' ? 'Bank email alert' : 'Marked by hand'})</div>
                    <div className="text-[#3D5245]">{new Date(payment.paidAt).toLocaleString()}</div>
                    {payment.manualNote && <div className="text-[#3D5245] mt-0.5 italic">{payment.manualNote}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          {payment.status !== 'PAID' && (
            <div className="bg-white p-6 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#0D1C14]">Confirm by Hand</h2>
              <p className="text-xs text-[#3D5245]">
                If you checked your bank account and already received this money, you can mark this order as paid yourself.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#0D1C14] mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. Verified in Meezan app"
                  className="w-full px-3 py-2 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
                />
              </div>

              <button
                onClick={handleManualConfirm}
                disabled={settling}
                className="w-full bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                {settling ? 'Updating...' : 'Mark as Paid'}
              </button>
            </div>
          )}

          <div className="bg-[#F4F7F5] p-6 rounded-2xl border border-[#D9E4DD] text-xs space-y-2">
            <div className="font-bold text-[#0D1C14] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#085E2A]" />
              Direct Bank Transfer
            </div>
            <p className="text-[#3D5245] leading-normal">
              Raast transfers money directly to your bank account. Once paid, the payment is final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#3D5245]">Loading payment details...</div>}>
      <DetailContent />
    </Suspense>
  );
}
