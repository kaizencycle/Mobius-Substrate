// apps/broker-api/src/utils/prometheus.ts
// Prometheus metric formatting utilities

/**
 * Escapes a label value for Prometheus exposition format.
 * 
 * According to Prometheus specification:
 * - Unquoted label values must match [a-zA-Z0-9_:][a-zA-Z0-9_:]*
 * - Quoted label values must escape: " as \", \ as \\, and newlines as \n
 * 
 * @param value - The label value to escape
 * @returns Properly escaped label value
 */
export function escapePrometheusLabelValue(value: string): string {
  // Check if value matches unquoted pattern
  const unquotedPattern = /^[a-zA-Z0-9_:][a-zA-Z0-9_:]*$/;
  if (unquotedPattern.test(value)) {
    return value;
  }
  
  // Otherwise, quote and escape special characters
  return `"${value
    .replace(/\\/g, "\\\\")  // Escape backslashes first
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, "\\n")   // Escape newlines
    .replace(/\r/g, "\\r")   // Escape carriage returns
    .replace(/\t/g, "\\t")}"`; // Escape tabs
}

/**
 * Formats a Prometheus metric with labels.
 * 
 * @param metricName - The metric name (must match [a-zA-Z_:][a-zA-Z0-9_:]*)
 * @param value - The metric value
 * @param labels - Optional label key-value pairs
 * @returns Formatted metric line
 */
export function formatPrometheusMetric(
  metricName: string,
  value: number | string,
  labels?: Record<string, string>
): string {
  let labelStr = "";
  if (labels && Object.keys(labels).length > 0) {
    const labelPairs = Object.entries(labels)
      .map(([key, val]) => `${key}=${escapePrometheusLabelValue(val)}`)
      .join(",");
    labelStr = `{${labelPairs}}`;
  }
  
  return `${metricName}${labelStr} ${value}`;
}

