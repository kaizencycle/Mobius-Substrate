export type EncyclopediaStatus = 'CANONICAL' | 'DRAFT' | 'NEEDS_REVIEW';

export interface EncyclopediaEngineVote {
  name: string; // 'claude', 'gpt', 'gemini', 'deepseek'
  version?: string; // 'opus-4.5', 'gpt-5.1', etc.
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN';
  confidence: number; // 0–1
}

export interface EncyclopediaSource {
  kind: 'url' | 'doc' | 'paper' | 'internal';
  url?: string;
  docId?: string;
  title?: string;
  citation?: string; // “Smith et al. (2023)”
  hash?: string; // sha256 of content snapshot
}

export interface EncyclopediaEntry {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  content: string;
  giScore: number;
  status: EncyclopediaStatus;
  engines: EncyclopediaEngineVote[];
  sources: EncyclopediaSource[];
  version: number;
  ledgerTxId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string | null;
  jurisdictionId?: string | null;
}

export interface CreateEncyclopediaEntryInput {
  topicId: string;
  title: string;
  summary: string;
  content: string;
  giScore: number;
  status?: EncyclopediaStatus;
  engines: EncyclopediaEngineVote[];
  sources: EncyclopediaSource[];
  createdBy?: string;
  ledgerTxId?: string;
  jurisdictionId?: string;
}
