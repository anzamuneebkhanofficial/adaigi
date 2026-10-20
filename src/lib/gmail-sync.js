import { connectDB } from './db.js';
import { SyncState, EmailEvent } from './models/Auxiliary.js';
import { Payment } from './models/Payment.js';
import { env } from './env.js';

// ─────────────────────────────────────────────────────────────────────────────
// Pakistani bank & wallet sender domains — used for envelope pre-filter
// ─────────────────────────────────────────────────────────────────────────────
const BANK_DOMAINS = [
  // Islamic / conventional commercial banks
  'meezanbank.com',
  'hbl.com',
  'ubl.com.pk',
  'mcb.com.pk',
  'abl.com.pk',
  'abl.com',
  'bankalfalah.com',
  'bop.com.pk',
  'sc.com',
  'standardchartered.com',
  'faysalbank.com',
  'bankislami.com.pk',
  'dubaiislamicbank.com.pk',
  // Digital wallets / branchless banking
  'sadapay.pk',
  'nayapay.com',
  'easypaisa.com.pk',
  'telenorbank.pk',
  'jazzcash.com.pk',
];

// Credit-signal keywords in email subjects
const CREDIT_SUBJECT_KEYWORDS = [
  'credit',
  'credited',
  'transaction',
  'alert',
  'received',
  'payment received',
  'amount received',
  'fund transfer',
  'ibft',
  'raast',
  'deposit',
];

/**
 * Extract plain text from a parsed email, falling back to HTML -> stripped text
 * when the plain-text part is absent (some banks send HTML-only alerts).
 */
function extractText(parsed) {
  if (parsed.text && parsed.text.trim()) {
    return parsed.text;
  }
  if (parsed.html) {
    // Strip HTML tags to get readable text
    return parsed.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  return '';
}

/**
 * Parse the PKR/Rs. amount from email body text.
 * Handles: "PKR 1.01", "Rs. 1,500.00", "Rs 500", "PKR 25,000.00"
 */
function parseAmountPaisa(text) {
  const match = text.match(/(?:Rs\.?|PKR)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!match) return null;
  const parsed = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

/**
 * Check if a sender address / name matches known Pakistani bank domains.
 */
function isBankSender(fromAddress, fromName, subject, allowlist) {
  const addr = fromAddress.toLowerCase();
  const name = fromName.toLowerCase();
  const subj = subject.toLowerCase();

  // Check hardcoded domain list
  if (BANK_DOMAINS.some((domain) => addr.includes(domain))) return true;

  // Check admin-configured allowlist
  if (allowlist.some((allowed) => addr.includes(allowed))) return true;

  // Check display name heuristics (some banks use generic SMTP relays)
  const bankNameHints = ['meezan', 'sadapay', 'nayapay', 'hbl', 'ubl', 'mcb', 'alfalah', 'allied', 'easypaisa', 'jazzcash'];
  if (bankNameHints.some((hint) => name.includes(hint))) {
    return CREDIT_SUBJECT_KEYWORDS.some((kw) => subj.includes(kw));
  }

  return false;
}

export async function syncGmailInbox(force = false) {
  await connectDB();

  const now = new Date();
  const syncDoc = await SyncState.findOneAndUpdate(
    { key: 'gmail' },
    { $setOnInsert: { key: 'gmail', runsToday: 0 } },
    { upsert: true, returnDocument: 'after' }
  );

  if (!force && syncDoc.lockedUntil && syncDoc.lockedUntil > now) {
    return { ok: true, skipped: true, reason: 'Sync locked' };
  }

  const minInterval = (env.SYNC_MIN_INTERVAL_SECONDS || 8) * 1000;
  if (!force && syncDoc.lastRunAt && now.getTime() - syncDoc.lastRunAt.getTime() < minInterval) {
    return { ok: true, skipped: true, reason: 'Throttled within minimum interval' };
  }

  // Acquire a 30-second lock to prevent concurrent syncs
  const lockExpires = new Date(now.getTime() + 30000);
  await SyncState.updateOne({ key: 'gmail' }, { lockedUntil: lockExpires, lastRunAt: now });

  try {
    if (!env.GMAIL_APP_PASSWORD || !env.GMAIL_ADDRESS) {
      await SyncState.updateOne(
        { key: 'gmail' },
        { lockedUntil: null, lastSuccessAt: now, lastError: null }
      );
      return { ok: true, syncedCount: 0, note: 'Mock mode: Gmail credentials not populated' };
    }

    const { ImapFlow } = await import('imapflow');
    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: env.GMAIL_ADDRESS,
        pass: env.GMAIL_APP_PASSWORD,
      },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock(env.GMAIL_FOLDER || 'INBOX');
    let newEmailsCount = 0;

    try {
      const graceMs = (env.LATE_GRACE_MINUTES || 30) * 60 * 1000;
      const lookbackMs = (env.SYNC_LOOKBACK_HOURS || 24) * 3600 * 1000;

      // ─────────────────────────────────────────────────────────────────────
      // FIX 1: Date-based IMAP SEARCH instead of "last N sequence" scan.
      // Find the oldest PENDING or recently-EXPIRED payment to anchor the
      // search date so no alert is ever missed due to inbox volume.
      // ─────────────────────────────────────────────────────────────────────
      const pendingPayments = await Payment.find({
        status: { $in: ['PENDING', 'EXPIRED'] },
      })
        .sort({ startedAt: 1 })
        .limit(1)
        .select('startedAt expiresAt')
        .lean();

      let sinceDate = new Date(now.getTime() - lookbackMs);
      if (pendingPayments.length > 0 && pendingPayments[0].startedAt) {
        // Go 1 minute before payment started to catch any ultra-fast alerts
        const paymentStart = new Date(pendingPayments[0].startedAt.getTime() - 60000);
        if (paymentStart < sinceDate) sinceDate = paymentStart;
      }

      const allowlist = (env.BANK_SENDER_ALLOWLIST || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // IMAP SEARCH by date — reliable regardless of inbox size
      const allUids = await client.search({ since: sinceDate }, { uid: true });

      if (!allUids || allUids.length === 0) {
        return { ok: true, syncedCount: 0 };
      }

      // ─────────────────────────────────────────────────────────────────────
      // Phase 1: Fast envelope scan to pre-filter bank candidates.
      // Only download headers, not full message bodies (very fast).
      // ─────────────────────────────────────────────────────────────────────
      const candidateUids = [];

      for await (const msg of client.fetch(allUids, { envelope: true }, { uid: true })) {
        const fromAddress = (msg.envelope?.from?.[0]?.address || '').toLowerCase();
        const fromName = (msg.envelope?.from?.[0]?.name || '').toLowerCase();
        const subject = (msg.envelope?.subject || '').toLowerCase();

        if (isBankSender(fromAddress, fromName, subject, allowlist) && msg.uid) {
          candidateUids.push(msg.uid);
        }
      }

      if (candidateUids.length === 0) {
        return { ok: true, syncedCount: 0 };
      }

      // ─────────────────────────────────────────────────────────────────────
      // Phase 2: Download full source only for detected bank candidates.
      // ─────────────────────────────────────────────────────────────────────
      const crypto = await import('crypto');
      const { simpleParser } = await import('mailparser');

      for await (const msg of client.fetch(candidateUids, { source: true, envelope: true }, { uid: true })) {
        const msgId = msg.envelope?.messageId || `uid_${msg.uid}`;
        const hash = crypto.createHash('sha256').update(msgId).digest('hex');

        // Skip already-processed emails (SHA-256 deduplication)
        const exists = await EmailEvent.findOne({ messageIdHash: hash }).lean();
        if (exists) continue;

        const parsed = await simpleParser(msg.source);

        // FIX 2: HTML fallback — extract text even from HTML-only emails
        const text = extractText(parsed);

        const amtPaisa = parseAmountPaisa(text);

        // Detect optional internal reference code (AD-XXXX)
        const matchRef = text.match(/\b(AD-[A-Z0-9]{4,8})\b/i);
        const refFound = matchRef ? matchRef[1].toUpperCase() : null;

        const fromStr =
          parsed.from?.text ||
          msg.envelope?.from?.[0]?.address ||
          'Unknown';

        const emailEvent = await EmailEvent.create({
          messageIdHash: hash,
          from: fromStr,
          subject: parsed.subject || msg.envelope?.subject || '',
          receivedAt: parsed.date || msg.envelope?.date || new Date(),
          parseOk: !!amtPaisa,
          amountPaisa: amtPaisa,
          reference: refFound,
          status: 'UNMATCHED',
          textSnippet: text.slice(0, 1000),
        });

        newEmailsCount++;

        if (!amtPaisa) continue;

        const emailReceivedAt = parsed.date || msg.envelope?.date || new Date();

        // Build base query — optionally narrow by reference if found in email
        const buildQuery = (status) => {
          const q = { status, payableAmountPaisa: amtPaisa };
          if (refFound) q.reference = refFound;
          return q;
        };

        // ── FIX 3: Atomic reconciliation — eliminates race condition ─────
        // findOneAndUpdate is atomic: only one winner even under concurrency.
        // ── Pass A: Match a PENDING payment (normal happy path) ──────────
        let matchedPayment = await Payment.findOneAndUpdate(
          {
            ...buildQuery('PENDING'),
            // Email must have arrived after (or very close to) when payment started
            startedAt: { $lte: new Date(emailReceivedAt.getTime() + 60000) },
          },
          {
            $set: {
              status: 'PAID',
              paidAt: emailReceivedAt,
              matchedEmailId: emailEvent._id,
              paidVia: 'AUTO_EMAIL',
            },
          },
          { new: true }
        );

        // ── FIX 4: Grace-period reconciliation for EXPIRED payments ──────
        // If the payment expired but the bank email arrived within
        // LATE_GRACE_MINUTES of the expiry time, auto-confirm it anyway.
        if (!matchedPayment) {
          const graceWindowStart = new Date(emailReceivedAt.getTime() - graceMs);
          matchedPayment = await Payment.findOneAndUpdate(
            {
              ...buildQuery('EXPIRED'),
              // Payment must have expired recently — within the grace window
              expiresAt: {
                $gte: graceWindowStart,
                $lte: new Date(emailReceivedAt.getTime() + 60000),
              },
            },
            {
              $set: {
                status: 'PAID',
                paidAt: emailReceivedAt,
                matchedEmailId: emailEvent._id,
                paidVia: 'AUTO_EMAIL',
              },
            },
            { new: true }
          );
        }

        if (matchedPayment) {
          // Bump TTL from 10-min UNMATCHED → 24-hour MATCHED retention
          emailEvent.status = 'MATCHED';
          emailEvent.paymentId = matchedPayment._id;
          emailEvent.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await emailEvent.save();
        }
      }
    } finally {
      lock.release();
      await client.logout();
    }

    await SyncState.updateOne(
      { key: 'gmail' },
      {
        lockedUntil: null,
        lastSuccessAt: now,
        lastError: null,
        $inc: { runsToday: 1 },
      }
    );

    return { ok: true, syncedCount: newEmailsCount };
  } catch (err) {
    await SyncState.updateOne(
      { key: 'gmail' },
      { lockedUntil: null, lastError: err.message || 'Sync failed' }
    );
    return { ok: false, error: err.message };
  }
}
