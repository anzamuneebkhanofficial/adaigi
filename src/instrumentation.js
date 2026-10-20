export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startBackgroundSyncWorker } = await import('@/lib/background-worker');
    startBackgroundSyncWorker();
  }
}
