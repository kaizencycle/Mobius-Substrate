import { dbPool } from '../db/pool';
import {
  CreateEncyclopediaEntryInput,
  EncyclopediaEngineVote,
  EncyclopediaEntry,
  EncyclopediaSource,
  EncyclopediaStatus,
} from '../types/encyclopedia';

const CANONICAL_GI_THRESHOLD = Number(process.env.GI_CANONICAL_THRESHOLD ?? 0.95);

function parseJsonArray<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (err) {
      console.warn('[encyclopediaService] Failed to parse JSON', err);
      return fallback;
    }
  }
  return value as T;
}

function normalizeDate(value?: string | Date | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function mapRow(row: Record<string, any>): EncyclopediaEntry {
  return {
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    giScore: Number(row.gi_score),
    status: row.status,
    engines: parseJsonArray<EncyclopediaEngineVote[]>(row.engines, [] as EncyclopediaEngineVote[]),
    sources: parseJsonArray<EncyclopediaSource[]>(row.sources, [] as EncyclopediaSource[]),
    version: Number(row.version),
    ledgerTxId: row.ledger_tx_id,
    createdBy: row.created_by,
    createdAt: normalizeDate(row.created_at) ?? new Date().toISOString(),
    updatedAt: normalizeDate(row.updated_at) ?? new Date().toISOString(),
    lastReviewedAt: normalizeDate(row.last_reviewed_at),
    jurisdictionId: row.jurisdiction_id,
  };
}

export async function getCanonicalEntryByTopicId(
  topicId: string,
  opts?: { jurisdictionId?: string },
): Promise<EncyclopediaEntry | null> {
  const params: any[] = [topicId];
  let jurisdictionClause = '';

  if (opts?.jurisdictionId) {
    params.push(opts.jurisdictionId);
    jurisdictionClause = 'AND (jurisdiction_id = $2 OR jurisdiction_id IS NULL)';
  }

  const result = await dbPool.query(
    `
      SELECT *
      FROM encyclopedia_entries
      WHERE topic_id = $1
        AND status = 'CANONICAL'
        ${jurisdictionClause}
      ORDER BY version DESC
      LIMIT 1
    `,
    params,
  );

  if (result.rowCount === 0) return null;
  return mapRow(result.rows[0]);
}

export async function searchEntries(
  query: string,
  limit = 20,
  opts?: { jurisdictionId?: string },
): Promise<EncyclopediaEntry[]> {
  const q = `%${query.toLowerCase()}%`;
  const params: any[] = [q, limit];
  let jurisdictionClause = '';

  if (opts?.jurisdictionId) {
    params.push(opts.jurisdictionId);
    jurisdictionClause = `AND (jurisdiction_id = $3 OR jurisdiction_id IS NULL)`;
  }

  const result = await dbPool.query(
    `
      SELECT *
      FROM encyclopedia_entries
      WHERE (LOWER(topic_id) LIKE $1
        OR LOWER(title) LIKE $1
        OR LOWER(summary) LIKE $1)
        ${jurisdictionClause}
      ORDER BY gi_score DESC, updated_at DESC
      LIMIT $2
    `,
    params,
  );

  return result.rows.map(mapRow);
}

export async function createEntry(
  input: CreateEncyclopediaEntryInput,
): Promise<EncyclopediaEntry> {
  const status: EncyclopediaStatus =
    input.giScore >= CANONICAL_GI_THRESHOLD ? 'CANONICAL' : input.status ?? 'DRAFT';

  const versionResult = await dbPool.query<{ max_version: number }>(
    `
      SELECT COALESCE(MAX(version), 0) AS max_version
      FROM encyclopedia_entries
      WHERE topic_id = $1
    `,
    [input.topicId],
  );

  const nextVersion = Number(versionResult.rows[0]?.max_version ?? 0) + 1;

  const result = await dbPool.query(
    `
      INSERT INTO encyclopedia_entries (
        topic_id,
        title,
        summary,
        content,
        gi_score,
        status,
        engines,
        sources,
        version,
        ledger_tx_id,
        created_by,
        jurisdiction_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12
      )
      RETURNING *
    `,
    [
      input.topicId,
      input.title,
      input.summary,
      input.content,
      input.giScore,
      status,
      JSON.stringify(input.engines ?? []),
      JSON.stringify(input.sources ?? []),
      nextVersion,
      input.ledgerTxId ?? null,
      input.createdBy ?? 'system',
      input.jurisdictionId ?? null,
    ],
  );

  return mapRow(result.rows[0]);
}
