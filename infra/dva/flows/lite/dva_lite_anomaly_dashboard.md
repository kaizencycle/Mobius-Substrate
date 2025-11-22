# DVA.LITE — Anomaly Dashboard

## Purpose

Generate a daily human-readable anomaly report from the previous 24 hours of:

- Uptime checks
- Latency readings
- Error distribution
- GI degradation events (future work)

## Recipients

- Mobius operators (Telegram or Discord)
- DVA.ONE learning loop for trend context

## Notes

- Runs at 06:00 system time by default
- Requires `MONITORING_URL` and `TELEGRAM_DVA_MONITOR_CHAT_ID`
