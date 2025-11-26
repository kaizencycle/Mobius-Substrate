import { EchoEntry } from './types';

class EchoMemoryStore {
  private store = new Map<string, EchoEntry>();

  save(entry: EchoEntry): void {
    this.store.set(entry.question, entry);
  }

  get(question: string): EchoEntry | null {
    return this.store.get(question) ?? null;
  }

  all(): EchoEntry[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

export const memoryStore = new EchoMemoryStore();
