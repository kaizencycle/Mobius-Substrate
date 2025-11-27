import { EncyclopediaEntry, EntryStatus, ListEntriesQuery } from "../types";

export interface EncyclopediaRepo {
  listPublic(query: ListEntriesQuery): Promise<{
    items: EncyclopediaEntry[];
    total: number;
    nextOffset: number | null;
  }>;

  listForReview(
    status: EntryStatus,
    limit: number,
    offset: number
  ): Promise<{
    items: EncyclopediaEntry[];
    total: number;
    nextOffset: number | null;
  }>;

  getById(id: string): Promise<EncyclopediaEntry | null>;

  updateStatus(
    id: string,
    status: EntryStatus,
    review: {
      reviewedBy: string;
      reviewedAt: string;
      reviewNotes?: string;
      ledgerTxId?: string | null;
    }
  ): Promise<EncyclopediaEntry | null>;
}

// TODO: wire to Postgres/Prisma/etc.
// Placeholder in-memory impl to get started

export function createInMemoryEncyclopediaRepo(): EncyclopediaRepo {
  const entries: Map<string, EncyclopediaEntry> = new Map();

  return {
    async listPublic(query) {
      const {
        q,
        topics,
        status = "approved",
        limit = 20,
        offset = 0,
      } = query;

      const statuses =
        status === "approved,pending_review"
          ? (["approved", "pending_review"] as EntryStatus[])
          : ([status] as EntryStatus[]);

      let items = Array.from(entries.values()).filter((e) =>
        statuses.includes(e.status)
      );

      if (q) {
        const needle = q.toLowerCase();
        items = items.filter(
          (e) =>
            e.question.toLowerCase().includes(needle) ||
            e.answer.toLowerCase().includes(needle)
        );
      }

      if (topics && topics.length > 0) {
        items = items.filter((entry) => {
          const entryTopics = entry.topics.map((topic) => topic.toLowerCase());
          return topics.some((t) => entryTopics.includes(t.toLowerCase()));
        });
      }

      const slice = items.slice(offset, offset + limit);

      return {
        items: slice,
        total: items.length,
        nextOffset: offset + limit < items.length ? offset + limit : null,
      };
    },

    async listForReview(status, limit = 20, offset = 0) {
      const items = Array.from(entries.values()).filter(
        (e) => e.status === status
      );
      const slice = items.slice(offset, offset + limit);

      return {
        items: slice,
        total: items.length,
        nextOffset: offset + limit < items.length ? offset + limit : null,
      };
    },

    async getById(id) {
      return entries.get(id) ?? null;
    },

    async updateStatus(id, status, review) {
      const existing = entries.get(id);
      if (!existing) return null;

      const updated: EncyclopediaEntry = {
        ...existing,
        status,
        reviewedBy: review.reviewedBy,
        reviewedAt: review.reviewedAt,
        reviewNotes: review.reviewNotes ?? existing.reviewNotes ?? null,
        ledgerTxId: review.ledgerTxId ?? existing.ledgerTxId ?? null,
        updatedAt: new Date().toISOString(),
      };

      entries.set(id, updated);
      return updated;
    },
  };
}
