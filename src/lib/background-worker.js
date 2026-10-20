import { connectDB } from './db.js';
import { Payment } from './models/Payment.js';
import { syncGmailInbox } from './gmail-sync.js';
import { env } from './env.js';

let workerIntervalId = null;

export function startBackgroundSyncWorker() {
  if (globalThis.__adaigiSyncWorkerStarted) {
    return;
  }
  globalThis.__adaigiSyncWorkerStarted = true;

  const intervalSec = env.SYNC_WORKER_INTERVAL_SECONDS || 15;
  const graceMs = (env.LATE_GRACE_MINUTES || 30) * 60 * 1000;

  console.log(`[Sync Worker] Started autonomous payment verification worker (interval: ${intervalSec}s)`);

  const runTick = async () => {
    try {
      await connectDB();
      const now = new Date();
      const graceStart = new Date(now.getTime() - graceMs);

      // Check if any payment is currently PENDING or recently EXPIRED within grace window
      const hasActivePayments = await Payment.exists({
        $or: [
          { status: 'PENDING' },
          { status: 'EXPIRED', expiresAt: { $gte: graceStart } },
        ],
      });

      if (hasActivePayments) {
        await syncGmailInbox(false);
      }
    } catch (err) {
      console.error('[Sync Worker] Background sync error:', err.message);
    }
  };

  // Run initial tick after 3s to let DB connection establish cleanly
  setTimeout(() => {
    runTick();
    workerIntervalId = setInterval(runTick, intervalSec * 1000);
  }, 3000);
}

export function stopBackgroundSyncWorker() {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    globalThis.__adaigiSyncWorkerStarted = false;
  }
}
