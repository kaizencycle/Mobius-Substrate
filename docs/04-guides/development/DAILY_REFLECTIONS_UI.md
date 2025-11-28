# Daily Reflections UI

This page lives at `/reflections` in the portal app.

- Reads & writes from Echo Layer:
  - `GET /v1/reflections/daily/:userId?date=YYYY-MM-DD`
  - `POST /v1/reflections/daily`
- Uses `NEXT_PUBLIC_ECHO_API_BASE` or `NEXT_PUBLIC_BROKER_API_URL` for configuration.
- Currently uses a static `demo_user` ID — in production, wire to:
  - Auth system OR
  - Civic Ledger identity

This is intentionally minimal HTML so that other clients (terminal UI, mobile, desktop) can easily replicate the 3-question flow.
