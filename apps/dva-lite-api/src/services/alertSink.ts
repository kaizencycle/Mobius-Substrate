import axios from 'axios';
import { config } from '../config';
import type { AlertType } from '../metrics';

export async function sendAlert(payload: {
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  type: AlertType;
}): Promise<void> {
  if (!config.alertWebhookUrl) {
    console.warn('[DVA.LITE] No ALERT_WEBHOOK_URL set; dropping alert');
    return;
  }

  await axios.post(
    config.alertWebhookUrl,
    payload,
    { timeout: Number(process.env.ALERT_WEBHOOK_TIMEOUT_MS ?? 5_000) },
  );
}
