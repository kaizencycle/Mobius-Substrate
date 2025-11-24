import { Router, type Request, type Response } from 'express';
import { evaluateDraftIntegrity } from '../services/integrityTier';
import {
  CivicProvenanceEnvelope,
  IntegrityTierInput,
} from '../types/integrity';

// If you have a Civic Ledger client, replace this stub:
async function submitToCivicLedger(
  envelope: CivicProvenanceEnvelope,
): Promise<{ txId: string }> {
  // TODO: integrate real civic-ledger API client
  // For now, this is a stub to keep the endpoint non-blocking.
  console.log('[CIVIC_LEDGER_STUB] would submit envelope', {
    articleId: envelope.article.id,
    hash: envelope.article.contentHash,
  });
  return { txId: `stub-tx-${envelope.article.id}` };
}

export function createPublishRouter() {
  const router = Router();

  /**
   * POST /v1/publish/news
   *
   * High-level contract:
   * - Input: Sentinel-approved draft + metadata + hashes
   * - Runs Integrity Tier (AIS)
   * - Returns:
   *    - integrityReport (AIS, issues, requiredAction)
   *    - optional civicProvenanceEnvelope (if suitable for auto_publish)
   *
   * Actual publishing to Substack/Discord/etc. should be handled
   * by n8n / orchestrator flows using this response.
   */
  router.post('/v1/publish/news', async (req: Request, res: Response) => {
    try {
      const body = req.body as any;

      const input: IntegrityTierInput = {
        draftId: body.draftId,
        draftText: body.draftText,
        domain: body.domain ?? 'news',
        sources: body.sources ?? [],
        claims: body.claims ?? [],
        sentinelVerdicts: body.sentinelVerdicts ?? {
          consensusLabel: 'uncertain',
          giScore: 0.9,
        },
      };

      const integrityReport = evaluateDraftIntegrity(input);

      let envelope: CivicProvenanceEnvelope | null = null;
      let ledgerTxId: string | undefined;

      if (integrityReport.requiredAction === 'auto_publish') {
        const contentHash = body.contentHash; // pre-computed sha256 from client
        if (!contentHash) {
          return res.status(400).json({
            error:
              'contentHash is required for auto_publish to build CPP envelope',
          });
        }

        envelope = {
          version: 'cpp.v1',
          article: {
            id: body.articleId ?? input.draftId,
            title: body.title ?? 'Untitled',
            canonicalUrl: body.canonicalUrl,
            contentHash,
            publishedAt: body.publishedAt,
            language: body.language ?? 'en',
            tags: body.tags ?? [],
          },
          sourceGraph: {
            nodes: input.sources ?? [],
            claims: input.claims ?? [],
          },
          aiInvolvement: body.aiInvolvement ?? {
            used: true,
            roles: ['drafting', 'language_polish'],
            models: [],
          },
          integrityAttestation: {
            mii: body.mii,
            gi: input.sentinelVerdicts.giScore,
            ais: integrityReport.articleIntegrityScore,
            sentinelVerdict: input.sentinelVerdicts.consensusLabel,
            checkedDomains: ['facts', 'hallucination'],
          },
          revisionHistory: [
            {
              revisionId: 'v1',
              timestamp: new Date().toISOString(),
              reason: 'initial publication',
              hash: contentHash,
            },
          ],
          signatures: [], // newsroom + sentinel signatures can be added later
        };

        const ledgerResult = await submitToCivicLedger(envelope);
        ledgerTxId = ledgerResult.txId;
        envelope.integrityAttestation.ledgerTx = ledgerTxId;
      }

      return res.status(200).json({
        integrityReport,
        civicProvenanceEnvelope: envelope,
        ledgerTxId: ledgerTxId ?? null,
      });
    } catch (err: any) {
      console.error('[publish.news] error', err);
      return res.status(500).json({
        error: 'Failed to evaluate integrity or build CPP envelope',
      });
    }
  });

  return router;
}
