// Entry point for Civic OS Labor module

export * from "./workloadAnalyzer";
export * from "./contractGuardian";
export * from "./wageFairnessAgent";

export interface LaborAnalysisContext {
  orgId: string;
  requesterId: string;
  jurisdiction?: string;
  metadata?: Record<string, unknown>;
}

export interface GIResult {
  giScore: number;
  verdict: "OK" | "REQUIRES_REVIEW" | "BLOCK";
  notes?: string[];
}
