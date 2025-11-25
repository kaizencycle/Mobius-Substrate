import { analyzeWageFairness } from "../../apps/civic-os/labor/src/wageFairnessAgent";

describe("wageFairnessAgent", () => {
  it("flags below-market salary relative to external band", async () => {
    const result = await analyzeWageFairness({
      orgId: "test-org",
      requesterId: "tester",
      worker: {
        workerId: "w1",
        role: "senior-analyst",
        currentSalary: 90000
      },
      externalMarketBand: {
        p25: 95000,
        p50: 110000,
        p75: 120000
      }
    });

    expect(result.verdict).toBe("BELOW_MARKET");
  });
});
