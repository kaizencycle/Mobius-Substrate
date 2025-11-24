// Integrity Tier and Civic Provenance Protocol types

export type HighRiskDomain =
  | 'news'
  | 'politics'
  | 'finance'
  | 'health'
  | 'public_figure'
  | 'crisis';

export type LowRiskDomain = 'opinion' | 'fiction' | 'low_risk' | 'other';

export type ContentDomain = HighRiskDomain | LowRiskDomain;

export interface CivicSourceRef {
  id: string; // local UUID or ledger id
  type: 'article' | 'dataset' | 'interview' | 'legal_doc' | 'sensor' | 'other';
  title?: string;
  url?: string;
  hash?: string; // sha256 of canonical content if available
  publishedAt?: string; // ISO timestamp
}

export interface IntegrityClaim {
  id: string;
  text: string;
  sourceIds: string[]; // references CivicSourceRef.id
  aiInvolved: boolean;
}

export interface IntegrityTierInput {
  draftId: string;
  draftText: string;
  domain: ContentDomain;
  sources?: CivicSourceRef[];
  claims?: IntegrityClaim[];
  sentinelVerdicts: {
    consensusLabel: 'approve' | 'uncertain' | 'reject';
    giScore: number; // Global Integrity snapshot from Sentinels
    notes?: string;
  };
}

export type IntegrityRiskLevel = 'low' | 'medium' | 'high';

export type IntegrityRequiredAction =
  | 'auto_publish'
  | 'human_review'
  | 'block';

export interface IntegrityTierReport {
  draftId: string;
  articleIntegrityScore: number; // AIS 0..1
  riskLevel: IntegrityRiskLevel;
  issues: string[];
  requiredAction: IntegrityRequiredAction;
  normalizedSources: CivicSourceRef[];
}

// Civic Provenance envelope (CPP v0.1)

export interface CivicArticleMeta {
  id: string;
  title: string;
  canonicalUrl?: string;
  contentHash: string; // sha256 of canonical text
  publishedAt?: string;
  language?: string;
  tags?: string[];
}

export interface AiInvolvementMeta {
  used: boolean;
  roles?: ('drafting' | 'summarizing' | 'language_polish' | 'fact_checking')[];
  models?: {
    name: string; // e.g. "gpt-5.1"
    provider: 'openai' | 'google' | 'anthropic' | 'deepseek' | 'other';
    temperature?: number;
    tools?: string[];
  }[];
  humanEditorResponsible?: string; // newsroom/editor id
}

export interface IntegrityAttestationMeta {
  mii?: number; // Mobius Integrity Index snapshot
  gi?: number; // Global Integrity snapshot
  ais: number; // articleIntegrityScore
  sentinelVerdict: 'approve' | 'uncertain' | 'reject';
  checkedDomains: ('facts' | 'bias' | 'hallucination' | 'safety')[];
  ledgerTx?: string; // civic ledger transaction id
  signedBy?: string[]; // public keys
}

export interface RevisionMeta {
  revisionId: string; // "v1", "v2", etc.
  timestamp: string; // ISO
  reason: string;
  hash: string; // content hash for this revision
  ledgerTx?: string;
}

export interface CivicProvenanceEnvelope {
  version: 'cpp.v1';
  article: CivicArticleMeta;
  sourceGraph: {
    nodes: CivicSourceRef[];
    claims: IntegrityClaim[];
  };
  aiInvolvement: AiInvolvementMeta;
  integrityAttestation: IntegrityAttestationMeta;
  revisionHistory: RevisionMeta[];
  signatures?: {
    role: 'reporter' | 'editor' | 'newsroom' | 'mobius_sentinel' | 'other';
    publicKey: string;
    signature: string; // base64
  }[];
}
