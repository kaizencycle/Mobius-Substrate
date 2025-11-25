import { analyzeWorkload } from "../../apps/civic-os/labor/src/workloadAnalyzer";

describe("workloadAnalyzer", () => {
  it("flags obvious overload patterns", async () => {
    const result = await analyzeWorkload({
      orgId: "test-org",
      requesterId: "tester",
      period: { from: "2025-11-01", to: "2025-11-30" },
      workers: [
        { workerId: "w1", hours: 55 },
        { workerId: "w2", hours: 38 }
      ]
    });

    expect(result.flags.find((f) => f.workerId === "w1")).toBeDefined();
    expect(result.giScore).toBeLessThan(0.95);
  });
});
