# DVA.FULL — Multi-Agent Orchestrator

## Purpose

Provide a structured way to:

- Break a large goal into subtasks
- Assign subtasks to specific agents/engines
- Aggregate results under Sentinel review
- Maintain GI gating throughout the process

## Notes

- Entry point: `/dva/full/task`
- Planning uses Thought Broker with `flow: dva.full.plan`
- Execution sub-flows can be attached downstream of `broker_plan`
