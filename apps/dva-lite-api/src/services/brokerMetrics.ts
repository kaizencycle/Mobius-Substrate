import axios from 'axios';
import { config } from '../config';

export interface BrokerMetrics {
  consensus_decisions_last_5m: number;
  engine_error_rate: number;
  avg_engine_latency_ms: number;
}

const DEFAULT_METRICS: BrokerMetrics = {
  consensus_decisions_last_5m: 0,
  engine_error_rate: 0,
  avg_engine_latency_ms: 0,
};

export async function getBrokerMetrics(): Promise<BrokerMetrics> {
  if (!config.brokerMetricsUrl) {
    return DEFAULT_METRICS;
  }

  const res = await axios.get(config.brokerMetricsUrl, {
    timeout: Number(process.env.BROKER_METRICS_TIMEOUT_MS ?? 7_000),
  });

  return {
    ...DEFAULT_METRICS,
    ...(res.data as Partial<BrokerMetrics>),
  };
}
