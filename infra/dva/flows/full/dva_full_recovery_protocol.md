# DVA.FULL — Recovery Protocol

## Purpose

Prevent silent failure of multi-agent tasks by:

- Sweeping for failed tasks every 15 minutes
- Retrying bounded attempts automatically
- Escalating to human review (via DVA.ONE) after retry budget exhaustion

## Requirements

- Access to `BROKER_URL/v1/tasks`
- Clear audit trail of retries vs. escalations
