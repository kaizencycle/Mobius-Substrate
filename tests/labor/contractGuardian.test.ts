import { auditContract } from "../../apps/civic-os/labor/src/contractGuardian";

describe("contractGuardian", () => {
  it("detects non-compete language heuristically", async () => {
    const result = await auditContract({
      workerId: "w1",
      orgId: "test-org",
      requesterId: "tester",
      jurisdiction: "US-NY",
      contractText: "This agreement includes a non-compete clause for 24 months."
    });

    expect(result.issues.length).toBeGreaterThan(0);
  });
});
