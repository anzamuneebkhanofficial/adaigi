'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Play, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeConfig, setStoreConfig] = useState(null);
  const [testText, setTestText] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [testingParser, setTestingParser] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [testingGmail, setTestingGmail] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setStoreConfig(data);
      })
      .catch(() => {});
  }, []);

  const handleTestParser = async () => {
    setTestingParser(true);
    try {
      const res = await fetch('/api/admin/tools/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-parser', sampleText: testText }),
      });
      const data = await res.json();
      setParseResult(data);
    } finally {
      setTestingParser(false);
    }
  };

  const handleTestGmail = async () => {
    setTestingGmail(true);
    try {
      const res = await fetch('/api/admin/tools/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-gmail' }),
      });
      const data = await res.json();
      setGmailStatus(data);
    } finally {
      setTestingGmail(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#0D1C14]">Settings &amp; Tools</h1>
        <p className="text-xs text-[#3D5245]">Your store settings and connection diagnostics</p>
      </div>

      {/* Read-Only Configuration Overview */}
      <div className="bg-white p-6 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0D1C14] border-b border-[#D9E4DD] pb-3">
          Store &amp; Bank Account
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#3D5245]">Your IBAN:</span>
            <div className="font-mono font-semibold text-[#0D1C14] mt-0.5">{storeConfig?.maskedIban || 'Loading...'}</div>
          </div>

          <div>
            <span className="text-[#3D5245]">Store Name:</span>
            <div className="font-semibold text-[#0D1C14] mt-0.5">{storeConfig?.sellerName || 'Loading...'}</div>
          </div>

          <div>
            <span className="text-[#3D5245]">Payment Time Limit:</span>
            <div className="font-semibold text-[#0D1C14] mt-0.5">{storeConfig ? `${storeConfig.paymentExpiryMinutes} Minutes` : '15 Minutes'}</div>
          </div>

          <div>
            <span className="text-[#3D5245]">Unique Paisa Range:</span>
            <div className="font-semibold text-[#0D1C14] mt-0.5">{storeConfig ? `1 - ${storeConfig.maxOffsetPaisa} Paisa` : '1 - 299 Paisa'}</div>
          </div>
        </div>
      </div>

      {/* Diagnostics: Gmail Probe */}
      <div className="bg-white p-6 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0D1C14] border-b border-[#D9E4DD] pb-3">
          Check Bank Email Connection
        </h2>

        <p className="text-xs text-[#3D5245]">
          Check if Adaigi can connect to your bank notification Gmail account.
        </p>

        <button
          onClick={handleTestGmail}
          disabled={testingGmail}
          className="px-4 py-2 bg-[#F4F7F5] hover:bg-[#EBF3EE] text-[#0D1C14] border border-[#D9E4DD] font-semibold rounded-xl text-xs transition cursor-pointer"
        >
          {testingGmail ? 'Checking...' : 'Check Connection'}
        </button>

        {gmailStatus && (
          <div className="p-4 bg-[#EBF3EE] border border-[#D9E4DD] rounded-xl text-xs space-y-1">
            <div className="font-semibold text-[#085E2A]">Connection successful</div>
            <div className="text-[#3D5245]">Connected account: {gmailStatus.address}</div>
          </div>
        )}
      </div>

      {/* Diagnostics: Regex Parser Test */}
      <div className="bg-white p-6 rounded-2xl border border-[#D9E4DD] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0D1C14] border-b border-[#D9E4DD] pb-3">
          Test Bank Email Reader
        </h2>
        <p className="text-xs text-[#3D5245]">
          Paste a sample bank alert email here to see if Adaigi reads the amount and reference correctly.
        </p>

        <textarea
          rows={4}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="e.g. Dear Customer, your account has been credited with PKR 500.37 with Raast ref AD-7K3Q on 20-Oct-2026."
          className="w-full p-3 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs font-mono text-[#0D1C14] focus:outline-hidden focus:border-[#085E2A]"
        />

        <button
          onClick={handleTestParser}
          disabled={testingParser}
          className="px-4 py-2 bg-[#085E2A] hover:bg-[#064B21] text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Play className="w-3.5 h-3.5" />
          {testingParser ? 'Testing...' : 'Test Email Text'}
        </button>

        {parseResult && (
          <div className="p-4 bg-[#F4F7F5] border border-[#D9E4DD] rounded-xl text-xs space-y-1 font-mono text-[#0D1C14]">
            <div><strong>Match Success:</strong> {parseResult.ok ? 'YES' : 'NO'}</div>
            <div><strong>Detected Amount (Paisa):</strong> {parseResult.amountPaisa || 'None'}</div>
            <div><strong>Detected Reference:</strong> {parseResult.reference || 'None'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
