'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Smartphone,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function LandingPage() {
  const [session, setSession] = useState(null);

  // Check admin session on mount
  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setSession(data);
      })
      .catch(() => {});
  }, []);

  const banks = [
    'Meezan Bank',
    'Habib Bank Limited (HBL)',
    'Standard Chartered',
    'SadaPay',
    'NayaPay',
    'Bank Alfalah',
    'United Bank (UBL)',
    'MCB Bank',
    'JazzCash',
    'Easypaisa',
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#0D1C14]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[#D9E4DD] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-8 h-8" priority />
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#0D1C14]">Adaigi</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FDF1F1] text-[#C82829] border border-[#F7C4C5]">
                Raast
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#085E2A] hover:bg-[#064B21] text-white shadow-xs transition"
              >
                <div className="w-2 h-2 rounded-full bg-[#BCD4C4] animate-pulse" />
                Dashboard ({session.sellerName})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-[#D9E4DD] hover:border-[#BCD4C4] text-[#0D1C14] bg-white hover:bg-[#EBF3EE] transition shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5 text-[#085E2A]" />
                Merchant Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 border-b border-[#D9E4DD] bg-gradient-to-b from-white via-[#F4F7F5] to-[#F4F7F5]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3EE] border border-[#BCD4C4] text-[#085E2A] text-xs font-semibold mb-8">
            <ShieldCheck className="w-4 h-4 text-[#085E2A]" />
            <span>Official State Bank Raast Protocol</span>
            <span className="text-[#BCD4C4]">&bull;</span>
            <span className="text-[#085E2A] font-normal">Direct to your bank account</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0D1C14] tracking-tight leading-[1.12] mb-6">
            Accept Instant Raast Payments.<br />
            <span className="text-[#085E2A]">Straight to your own bank account.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#3D5245] max-w-2xl mx-auto leading-relaxed mb-10">
            Get paid straight to your bank account with zero gateway fees. Your customers scan a Raast QR code using their favorite Pakistani bank app. When the money arrives, Adaigi checks your bank email and confirms the payment right away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {session ? (
              <>
                <Link
                  href="/admin/payments/new"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  Create Payment Link
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#D9E4DD] bg-white hover:bg-[#EBF3EE] text-[#0D1C14] font-semibold text-sm transition shadow-2xs flex items-center justify-center gap-2"
                >
                  Merchant Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/admin/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  Merchant Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#D9E4DD] bg-white hover:bg-[#EBF3EE] text-[#0D1C14] font-semibold text-sm transition shadow-2xs flex items-center justify-center gap-2"
                >
                  How It Works
                  <ChevronRight className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Dual Explanation Section (Buyer vs Merchant) */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#085E2A] uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl font-bold text-[#0D1C14] mt-1.5">How payments work for you and your customer</h2>
          <p className="text-sm text-[#3D5245] mt-2">
            No middleman, no card fees, and no waiting days for payouts. Money moves straight from their bank to yours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Buyer Journey */}
          <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] flex items-center justify-center text-[#085E2A] mb-6">
              <Smartphone className="w-5 h-5 text-[#085E2A]" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[#C82829] mb-1">For Customers</div>
            <h3 className="text-xl font-bold text-[#0D1C14] mb-4">Pay in 3 taps from any bank app</h3>

            <ol className="space-y-4 text-xs text-[#3D5245]">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EE] text-[#085E2A] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-[#0D1C14] block mb-0.5">Open the checkout link</strong>
                  Your customer opens the payment link on their phone or computer.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EE] text-[#085E2A] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-[#0D1C14] block mb-0.5">Scan with any bank app</strong>
                  They scan the Raast QR code using Nayapay, SadaPay, Meezan, HBL, or any Pakistani bank app.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#EBF3EE] text-[#085E2A] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-[#0D1C14] block mb-0.5">Instant confirmation</strong>
                  The screen marks the payment received in seconds. No need to refresh or upload screenshots.
                </div>
              </li>
            </ol>
          </div>

          {/* Merchant Journey */}
          <div className="bg-white p-8 rounded-2xl border border-[#D9E4DD] shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] flex items-center justify-center text-[#085E2A] mb-6">
              <Building2 className="w-5 h-5 text-[#085E2A]" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[#085E2A] mb-1">For Store Owners</div>
            <h3 className="text-xl font-bold text-[#0D1C14] mb-4">Zero fees, money in your bank</h3>

            <ol className="space-y-4 text-xs text-[#3D5245]">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F4F7F5] text-[#0D1C14] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-[#0D1C14] block mb-0.5">Create a payment link</strong>
                  Enter the amount you want to charge. Adaigi adds a few paisas (like Rs 500.37) so it can tell orders apart.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F4F7F5] text-[#0D1C14] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-[#0D1C14] block mb-0.5">Your bank emails you</strong>
                  When money lands in your bank account, your bank sends an alert email to your connected Gmail.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F4F7F5] text-[#0D1C14] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-[#0D1C14] block mb-0.5">Instant automatic match</strong>
                  Adaigi reads the email alert, matches the exact amount, and marks the payment received.
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Supported Bank Rails */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <span className="text-xs font-bold text-[#3D5245] uppercase tracking-wider">Bank Support</span>
        <h3 className="text-lg font-bold text-[#0D1C14] mt-1 mb-8">Works with every Pakistani bank and wallet app</h3>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {banks.map((b) => (
            <span
              key={b}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D9E4DD] text-[#0D1C14] text-xs font-semibold shadow-2xs hover:border-[#BCD4C4] transition"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D9E4DD] py-10 px-6 bg-white text-xs text-[#3D5245]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-6 h-6" />
            <span className="font-bold text-[#0D1C14]">Adaigi</span>
            <span>&bull;</span>
            <span>Direct Raast payments for Pakistani merchants</span>
          </div>

          <div>Free and open source</div>
        </div>
      </footer>
    </div>
  );
}
