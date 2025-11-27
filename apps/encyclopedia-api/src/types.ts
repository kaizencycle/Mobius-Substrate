export type EntryStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface EncyclopediaSource {
  url: string;
  label?: string;
}

export interface EncyclopediaEntry {
  id: string;
  question: string;
  answer: string;
  topics: string[];
  giScore: number; // 0–1
  consensusLevel?: "low" | "medium" | "high";
  status: EntryStatus;
  echoId?: string | null;
  ledgerTxId?: string | null;
  sources: EncyclopediaSource[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
}

export interface ListEntriesQuery {
  q?: string;
  topics?: string[];
  status?: EntryStatus | "approved,pending_review";
  limit?: number;
  offset?: number;
}

export interface ReviewDecisionPayload {
  decision: "approve" | "reject";
  notes?: string;
  attachLedger?: boolean;
}
