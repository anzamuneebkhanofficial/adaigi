'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';

export default function NewPaymentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [baseAmountRs, setBaseAmountRs] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [returnUrl, setReturnUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdPayment, setCreatedPayment] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          baseAmountRs: Number(baseAmountRs),
          customerNote,
          orderRef,
          returnUrl,
        }),
      });

      const data = await res.json();
      if (data.payment) {
        setCreatedPayment(data.payment);
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentUrl = createdPayment
    ? `${window.location.origin}/pay/${createdPayment.publicId}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#0D1C14]">Create Payment Link</h1>
        <p className="text-xs text-[#3D5245]">Create a payment link to send to your customer</p>
      </div>

      {!createdPayment ? (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">
              Item name or description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Order #1042 - Coffee Beans"
              className="w-full px-3.5 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-sm text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">
                Amount in PKR *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-[#3D5245] font-mono">Rs</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  value={baseAmountRs}
                  onChange={(e) => setBaseAmountRs(e.target.value)}
                  placeholder="500.00"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-sm font-mono text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">
                Order reference (optional)
              </label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="ORD-1042"
                className="w-full px-3.5 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-sm text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">
              Note for customer (optional)
            </label>
            <textarea
              rows={2}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Notes or instructions displayed to the buyer..."
              className="w-full px-3.5 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-sm text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D1C14] mb-1.5">
              Website link after payment (optional)
            </label>
            <input
              type="url"
              value={returnUrl}
              onChange={(e) => setReturnUrl(e.target.value)}
              placeholder="https://myshop.pk/order/complete"
              className="w-full px-3.5 py-2.5 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-sm text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? 'Creating...' : 'Create Payment Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#EBF3EE] text-[#085E2A] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0D1C14]">Payment Link Created</h2>
            <p className="text-xs text-[#3D5245] mt-1">Send this link to your customer to pay with Raast</p>
          </div>

          <div className="p-4 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl flex items-center justify-between gap-3 text-left">
            <div className="truncate font-mono text-xs text-[#0D1C14] select-all">{paymentUrl}</div>
            <button
              onClick={copyLink}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#D9E4DD] text-xs font-semibold text-[#0D1C14] hover:bg-[#F4F7F5] transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex gap-3">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#EBF3EE] hover:bg-[#d5e7dc] border border-[#D9E4DD] text-[#085E2A] font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Checkout
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                setCreatedPayment(null);
                setTitle('');
                setBaseAmountRs('');
              }}
              className="flex-1 bg-[#F4F7F5] hover:bg-[#EBF3EE] text-[#0D1C14] border border-[#D9E4DD] font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              Create Another Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
