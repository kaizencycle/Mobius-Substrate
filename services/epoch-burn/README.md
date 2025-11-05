# Epoch Burn Service

Automated service that applies decay to idle shards and reabsorbs them to the integrity pool.

## Overview

The epoch burn service runs on a cron schedule (default: every 90 days) and:

1. Identifies idle shards (unused for 30+ days)
2. Applies decay (0.5% per epoch)
3. Reabsorbs decayed shards to integrity pool
4. Emits signed attestation to ledger
5. Notifies sentinels (ZEUS, HERMES, ECHO)

## Configuration

Configuration is read from `configs/integrity_units.yaml`:

```yaml
epochs:
  burn_job:
    enabled: true
    cron: "0 0 */90 * *"  # Every 90 days at midnight UTC
    min_idle_days: 30
    dry_run: false
```

## Environment Variables

- `LEDGER_API_URL` - Civic Ledger API endpoint (default: http://localhost:3000)
- `RUN_ON_STARTUP` - Run burn immediately on startup (for testing)

## Usage

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Test mode (dry run)
npm run dev  # Set dry_run: true in config
```

## Integration

The service calls:
- `POST /attest/burn` on civic-ledger to emit attestation
- Queries ledger database for idle shards (TODO: implement)

## Safety

- Dry run mode available for testing
- Idle detection prevents active shards from being affected
- Dual-signature attestation ensures immutability
- Configurable decay percentage

