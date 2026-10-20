'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Clock,
  Copy,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Suspense } from 'react';

function CheckoutContent() {
  const { publicId } = useParams();
  const router = useRouter();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [qrSvg, setQrSvg] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState('');
  const [merchantIban, setMerchantIban] = useState('');

  // Initial fetch
  useEffect(() => {
    async function loadPayment() {
      try {
        const res = await fetch(`/api/pay/${publicId}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error.message);
        } else {
          setPayment(data.payment);
          if (data.merchantIban) setMerchantIban(data.merchantIban);
        }
      } catch (err) {
        setError('Unable to load payment details');
      } finally {
        setLoading(false);
      }
    }
    loadPayment();
  }, [publicId]);

  // Generate QR SVG if qrPayload is present
  useEffect(() => {
    if (payment?.qrPayload) {
      QRCode.toString(payment.qrPayload, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' })
        .then((svg) => setQrSvg(svg))
        .catch(() => {});
    }
  }, [payment?.qrPayload]);

  // Countdown timer
  useEffect(() => {
    if (payment?.status !== 'PENDING' || !payment?.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = new Date(payment.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setTimeLeft('00:00');
        setPayment((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000).toString().padStart(2, '0');
        const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
        setTimeLeft(`${mins}:${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [payment?.status, payment?.expiresAt]);

  // Status Polling every 4s (polls while PENDING or EXPIRED so late grace confirmations resolve)
  useEffect(() => {
    if (payment?.status !== 'PENDING' && payment?.status !== 'EXPIRED') return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/pay/${publicId}/status`);
        const data = await res.json();
        if (data.status && data.status !== payment.status) {
          setPayment((prev) => ({ ...prev, status: data.status, paidAt: data.paidAt }));
        }
      } catch {}
    }, 4000);

    return () => clearInterval(poll);
  }, [payment?.status, publicId]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/pay/${publicId}/start`, { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setError(data.error.message);
      } else {
        setPayment(data.payment);
      }
    } catch {
      setError('Failed to initiate transaction');
    } finally {
      setStarting(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center text-[#3D5245] font-medium text-sm">
        Loading checkout details...
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-[#C82829] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0D1C14] mb-2">Payment Unavailable</h2>
          <p className="text-sm text-[#3D5245] mb-6">{error || 'This checkout session could not be found.'}</p>
        </div>
      </div>
    );
  }

  const baseRupees = (payment.baseAmountPaisa / 100).toFixed(2);
  const payableRupees = payment.payableAmountPaisa
    ? (payment.payableAmountPaisa / 100).toFixed(2)
    : baseRupees;

  return (
    <div className="min-h-screen bg-[#F4F7F5] py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#D9E4DD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#085E2A] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              P
            </div>
            <div>
              <div className="font-bold text-[#0D1C14] text-sm flex items-center gap-1.5">
                Pay with <span className="text-[#C82829]">Raast</span>
              </div>
              <div className="text-xs text-[#3D5245]">Order: {payment.orderRef || payment.reference}</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EE] text-[#085E2A] text-xs font-semibold border border-[#D9E4DD]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Direct Bank Transfer
          </div>
        </div>

        {/* STATE 1: CREATED (Ready to Pay) */}
        {payment.status === 'CREATED' && (
          <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold text-[#3D5245] uppercase tracking-wider">Amount to pay</span>
              <div className="text-4xl font-extrabold text-[#0D1C14] mt-1 font-mono">
                Rs {baseRupees}
              </div>
              <h2 className="text-lg font-bold text-[#0D1C14] mt-3">{payment.title}</h2>
              {payment.customerNote && (
                <p className="text-xs text-[#3D5245] mt-1 max-w-sm mx-auto">{payment.customerNote}</p>
              )}
            </div>

            <div className="bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl p-4 text-xs text-[#3D5245] mb-6 space-y-2">
              <div className="flex justify-between">
                <span>Payment method:</span>
                <span className="font-semibold text-[#0D1C14]">Raast QR code</span>
              </div>
              <div className="flex justify-between">
                <span>Paid to:</span>
                <span className="font-semibold text-[#0D1C14]">Direct to store bank account</span>
              </div>
              <div className="flex justify-between">
                <span>Confirmation:</span>
                <span className="font-semibold text-[#085E2A]">Automatic within seconds</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full bg-[#085E2A] hover:bg-[#064B21] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {starting ? 'Loading QR Code...' : 'Show QR Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STATE 2: PENDING (Waiting for Payment) */}
        {payment.status === 'PENDING' && (
          <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 mb-4">
              <Clock className="w-3.5 h-3.5" />
              Expires in {timeLeft}
            </div>

            <h3 className="text-xs font-semibold text-[#3D5245] uppercase tracking-wider">Amount to pay</h3>
            <div className="text-4xl font-extrabold text-[#085E2A] font-mono mt-1">
              Rs {payableRupees}
            </div>
            <p className="text-xs text-[#3D5245] mt-1.5">
              Please pay the exact amount including paisas <span className="font-mono font-bold text-[#0D1C14]">(.{String(payment.offsetPaisa).padStart(2, '0')})</span> so your order confirms automatically.
            </p>

            {/* Raast QR Container */}
            <div className="my-6 flex justify-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#085E2A] shadow-xs inline-block">
                {qrSvg ? (
                  <div className="w-64 h-64 mx-auto" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                ) : (
                  <div className="w-64 h-64 bg-[#F4F7F5] flex items-center justify-center text-xs text-[#3D5245]">
                    Creating QR code...
                  </div>
                )}
              </div>
            </div>

            {/* Instruction Checklist */}
            <div className="text-left bg-[#F4F7F5] rounded-xl p-4 border border-[#D9E4DD] text-xs space-y-2 mb-6">
              <div className="font-bold text-[#0D1C14] mb-1">How to pay:</div>
              <div className="flex items-start gap-2 text-[#3D5245]">
                <span className="w-4 h-4 rounded-full bg-[#EBF3EE] text-[#085E2A] text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Open any bank app (Nayapay, SadaPay, Meezan, HBL, UBL, etc.).</span>
              </div>
              <div className="flex items-start gap-2 text-[#3D5245]">
                <span className="w-4 h-4 rounded-full bg-[#EBF3EE] text-[#085E2A] text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Tap &quot;Scan Raast QR&quot; and point your phone camera here.</span>
              </div>
              <div className="flex items-start gap-2 text-[#3D5245]">
                <span className="w-4 h-4 rounded-full bg-[#EBF3EE] text-[#085E2A] text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Verify the exact amount <strong className="font-mono text-[#0D1C14]">Rs {payableRupees}</strong> and confirm.</span>
              </div>
            </div>

            {/* Manual Copy fallback */}
            <div className="border-t border-[#D9E4DD] pt-4 text-xs">
              <button
                onClick={() => setShowManual(!showManual)}
                className="text-[#3D5245] hover:text-[#0D1C14] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                Need to pay by bank transfer instead?
                <ChevronDown className={`w-3.5 h-3.5 transition ${showManual ? 'rotate-180' : ''}`} />
              </button>

              {showManual && (
                <div className="mt-4 p-4 bg-[#F4F7F5] rounded-xl border border-[#D9E4DD] space-y-3 text-left">
                  <div>
                    <div className="text-[#3D5245] text-[11px] font-medium">Bank IBAN</div>
                    <div className="flex items-center justify-between font-mono font-medium text-[#0D1C14]">
                      <span>{merchantIban || 'Contact merchant for IBAN'}</span>
                      {merchantIban && (
                        <button
                          onClick={() => copyToClipboard(merchantIban, 'iban')}
                          className="text-[#085E2A] hover:text-[#064B21] font-sans font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedField === 'iban' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#3D5245] text-[11px] font-medium">Exact Amount to Send</div>
                    <div className="flex items-center justify-between font-mono font-medium text-[#0D1C14]">
                      <span>Rs {payableRupees}</span>
                      <button
                        onClick={() => copyToClipboard(payableRupees, 'amt')}
                        className="text-[#085E2A] hover:text-[#064B21] font-sans font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === 'amt' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[#3D5245] text-[11px] font-medium">Payment Reference Code</div>
                    <div className="flex items-center justify-between font-mono font-medium text-[#0D1C14]">
                      <span>{payment.reference}</span>
                      <button
                        onClick={() => copyToClipboard(payment.reference, 'ref')}
                        className="text-[#085E2A] hover:text-[#064B21] font-sans font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === 'ref' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Waiting status spinner & reassurance */}
            <div className="mt-8 p-3.5 bg-[#F4F7F5] rounded-xl border border-[#D9E4DD] text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-xs text-[#0D1C14] font-semibold" aria-live="polite">
                <div className="w-3.5 h-3.5 border-2 border-[#085E2A] border-t-transparent rounded-full animate-spin" />
                Waiting for bank confirmation...
              </div>
              <p className="text-[11px] text-[#3D5245] leading-relaxed">
                Most bank notifications arrive in 15–60 seconds. You can safely close this page — your payment will be verified automatically in the background.
              </p>
            </div>
          </div>
        )}

        {/* STATE 3: PAID */}
        {payment.status === 'PAID' && (
          <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm text-center">
            <CheckCircle2 className="w-16 h-16 text-[#085E2A] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0D1C14]">Payment Received!</h2>
            <p className="text-xs text-[#3D5245] mt-1 font-medium">Your payment was sent directly to the store bank account.</p>

            <div className="bg-[#EBF3EE] border border-[#D9E4DD] rounded-xl p-5 my-6 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#3D5245]">Amount paid:</span>
                <span className="font-mono font-bold text-[#0D1C14]">Rs {payableRupees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D5245]">Order reference:</span>
                <span className="font-mono font-bold text-[#0D1C14]">{payment.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D5245]">Confirmed by:</span>
                <span className="font-semibold text-[#085E2A]">{payment.paidVia === 'AUTO_EMAIL' ? 'Bank email alert' : 'Store owner'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D5245]">Date &amp; time:</span>
                <span className="font-mono text-[#0D1C14]">{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Just now'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-[#D9E4DD] hover:bg-[#F4F7F5] text-[#0D1C14] font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>

              {payment.returnUrl && (
                <a
                  href={payment.returnUrl}
                  className="flex-1 bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  Return to Store
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* STATE 4: EXPIRED / MANUAL REVIEW / CANCELLED */}
        {(payment.status === 'EXPIRED' || payment.status === 'MANUAL_REVIEW' || payment.status === 'CANCELLED') && (
          <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm text-center">
            <AlertCircle className="w-14 h-14 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0D1C14]">
              {payment.status === 'EXPIRED' && 'Session Expired'}
              {payment.status === 'MANUAL_REVIEW' && 'Checking Your Payment'}
              {payment.status === 'CANCELLED' && 'Payment Cancelled'}
            </h2>

            <p className="text-xs text-[#3D5245] mt-2 max-w-sm mx-auto leading-relaxed">
              {payment.status === 'EXPIRED' &&
                'The 15-minute payment window has expired. If you already sent the transfer from your bank app, our automated system continues verifying incoming transfers for up to 30 minutes and will credit your payment automatically. Your reference code is: ' +
                  payment.reference}
              {payment.status === 'MANUAL_REVIEW' &&
                'We found a matching payment from your bank. The store owner will confirm it shortly. Your reference code is ' +
                  payment.reference +
                  '.'}
              {payment.status === 'CANCELLED' && 'This payment link was cancelled.'}
            </p>

            {payment.status === 'EXPIRED' && (
              <button
                onClick={handleStart}
                className="mt-6 bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center text-[#3D5245] font-medium text-sm">Loading session...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
