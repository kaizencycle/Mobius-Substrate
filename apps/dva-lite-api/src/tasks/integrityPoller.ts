import { config } from '../config';
import { getGiSnapshot } from '../services/giSnapshot';
import { updateIntegritySnapshot } from '../state/integrityState';

async function refreshIntegritySnapshot(): Promise<void> {
  try {
    const snapshot = await getGiSnapshot();
    updateIntegritySnapshot(snapshot);
  } catch (error) {
    console.warn('[DVA.LITE] Failed to refresh GI snapshot', error);
  }
}

export function startIntegrityPoller(): void {
  const intervalMs = Math.max(5_000, config.metricsRefreshMs);
  refreshIntegritySnapshot();

  const timer = setInterval(refreshIntegritySnapshot, intervalMs);
  // Allow process to exit naturally in tests
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}
