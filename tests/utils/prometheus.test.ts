// tests/utils/prometheus.test.ts
// Tests for Prometheus metric formatting utilities

import { escapePrometheusLabelValue, formatPrometheusMetric } from "../../apps/broker-api/src/utils/prometheus";

describe("Prometheus Utilities", () => {
  describe("escapePrometheusLabelValue", () => {
    it("should return unquoted values for valid identifiers", () => {
      expect(escapePrometheusLabelValue("claude-sonnet")).toBe("claude-sonnet");
      expect(escapePrometheusLabelValue("gpt_4")).toBe("gpt_4");
      expect(escapePrometheusLabelValue("gemini_pro")).toBe("gemini_pro");
    });

    it("should quote and escape values with special characters", () => {
      expect(escapePrometheusLabelValue('name"with"quotes')).toBe('"name\\"with\\"quotes"');
      expect(escapePrometheusLabelValue("name\\with\\backslashes")).toBe('"name\\\\with\\\\backslashes"');
      expect(escapePrometheusLabelValue("name\nwith\nnewlines")).toBe('"name\\nwith\\nnewlines"');
      expect(escapePrometheusLabelValue("name\rwith\rcarriage")).toBe('"name\\rwith\\rcarriage"');
      expect(escapePrometheusLabelValue("name\twith\ttabs")).toBe('"name\\twith\\ttabs"');
    });

    it("should handle complex injection attempts", () => {
      const malicious = 'test"} 1.0\n# INJECTED_METRIC injected_value 999';
      const escaped = escapePrometheusLabelValue(malicious);
      expect(escaped).toContain('\\"');
      expect(escaped).toContain('\\n');
      expect(escaped).toMatch(/^".*"$/);
    });

    it("should handle empty strings", () => {
      expect(escapePrometheusLabelValue("")).toBe('""');
    });
  });

  describe("formatPrometheusMetric", () => {
    it("should format simple metrics without labels", () => {
      expect(formatPrometheusMetric("test_metric", 42)).toBe("test_metric 42");
      expect(formatPrometheusMetric("test_metric", 0.95)).toBe("test_metric 0.95");
    });

    it("should format metrics with safe label values", () => {
      const result = formatPrometheusMetric("test_metric", 42, { name: "claude-sonnet" });
      expect(result).toBe('test_metric{name=claude-sonnet} 42');
    });

    it("should escape label values with special characters", () => {
      const result = formatPrometheusMetric("test_metric", 42, { name: 'test"quote' });
      expect(result).toBe('test_metric{name="test\\"quote"} 42');
    });

    it("should handle multiple labels", () => {
      const result = formatPrometheusMetric("test_metric", 42, {
        name: "claude",
        status: "healthy"
      });
      expect(result).toContain("name=claude");
      expect(result).toContain("status=healthy");
      expect(result).toContain("42");
    });

    it("should prevent metric injection attacks", () => {
      const maliciousName = 'test"} 999\n# INJECTED';
      const result = formatPrometheusMetric("test_metric", 42, { name: maliciousName });
      
      // Should be properly escaped and not break the format
      expect(result).toMatch(/^test_metric\{name=".*"\} 42$/);
      expect(result).not.toContain("INJECTED");
      expect(result).not.toContain("999");
    });
  });
});

