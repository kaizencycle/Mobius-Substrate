import { LaborAnalysisContext, GIResult } from "./index";

export interface ContractAuditInput extends LaborAnalysisContext {
  workerId: string;
  contractText: string;
}

export type ClauseSeverity = "low" | "medium" | "high";

export interface ContractIssue {
  clauseId: string;
  severity: ClauseSeverity;
  tag:
    | "noncompete"
    | "nondisclosure"
    | "arbitration"
    | "ip_ownership"
    | "overtime"
    | "other";
  explanation: string;
}

export interface SuggestedRewrite {
  clauseId: string;
  replacement: string;
}

export interface ContractAuditResult extends GIResult {
  issues: ContractIssue[];
  suggestedRewrites: SuggestedRewrite[];
}

/**
 * Analyze a contract for potentially coercive or unfair clauses.
 *
 * NOTE: This is a scaffold. Real implementations should:
 * - Use specialized Sentinel models
 * - Incorporate jurisdiction-specific rules
 * - Produce explainable GI scoring
 */
export async function auditContract(
  input: ContractAuditInput
): Promise<ContractAuditResult> {
  const issues: ContractIssue[] = [];
  const suggestedRewrites: SuggestedRewrite[] = [];

  const text = input.contractText.toLowerCase();

  if (text.includes("non-compete") || text.includes("noncompete")) {
    issues.push({
      clauseId: "auto-noncompete-detected",
      severity: "high",
      tag: "noncompete",
      explanation:
        "Detected a non-compete clause. These can be coercive or unenforceable depending on jurisdiction."
    });

    suggestedRewrites.push({
      clauseId: "auto-noncompete-detected",
      replacement:
        "Replace with a narrowly scoped non-solicitation clause limited in time and geography."
    });
  }

  const giScore = issues.length === 0 ? 0.97 : 0.88;

  return {
    giScore,
    verdict: giScore >= 0.95 ? "OK" : "REQUIRES_REVIEW",
    issues,
    suggestedRewrites,
    notes: [
      "Heuristic contract scan only. Integrate real Sentinel-based analysis in production."
    ]
  };
}
