/**
 * Session Management
 * Manages agent session lifecycle and linking
 * Phase 2: Agent Memory & Learning Persistence
 */

import type { FoundingAgent, MemorySession } from '../../types';
import { getMemoryStorage } from './storage';
import { generateTraceId } from '../util/hash';

/**
 * Active session tracker
 */
const activeSessions = new Map<string, MemorySession>();

/**
 * Create a new session for an agent
 */
export async function createSession(
  agent: FoundingAgent,
  tags?: string[]
): Promise<MemorySession> {
  const sessionId = generateTraceId({ agent, type: 'session', t: Date.now() });
  const storage = await getMemoryStorage();

  const session = await storage.createSession(sessionId, agent, tags);
  activeSessions.set(sessionId, session);

  console.log(
    `[Memory] Created session ${sessionId} for "${String(agent).replace(/[\r\n]/g, '')}"`
  );

  return session;
}

/**
 * Get active session for an agent (or create new one)
 */
export async function getOrCreateSession(
  agent: FoundingAgent,
  sessionId?: string,
  tags?: string[]
): Promise<MemorySession> {
  const storage = await getMemoryStorage();

  // If sessionId provided, try to get it
  if (sessionId) {
    const existing = await storage.getSession(sessionId);
    if (existing) {
      activeSessions.set(sessionId, existing);
      return existing;
    }
  }

  // Check if there's an active session for this agent
  const agentActiveSession = Array.from(activeSessions.values()).find(
    (s) => s.agent === agent && !s.endTime
  );

  if (agentActiveSession) {
    return agentActiveSession;
  }

  // Create new session
  return createSession(agent, tags);
}

/**
 * End a session
 */
export async function endSession(sessionId: string): Promise<void> {
  const storage = await getMemoryStorage();
  await storage.endSession(sessionId);
  activeSessions.delete(sessionId);

  console.log(`[Memory] Ended session ${sessionId}`);
}

/**
 * End all active sessions for an agent
 */
export async function endAgentSessions(agent: FoundingAgent): Promise<void> {
  const storage = await getMemoryStorage();
  const sessions = Array.from(activeSessions.values()).filter(
    (s) => s.agent === agent && !s.endTime
  );

  for (const session of sessions) {
    await storage.endSession(session.sessionId);
    activeSessions.delete(session.sessionId);
  }

  console.log(`[Memory] Ended ${sessions.length} sessions for ${agent}`);
}

/**
 * Get session statistics
 */
export async function getSessionStats(
  sessionId: string
): Promise<{
  session: MemorySession;
  durationMs: number;
  deliberationsPerMinute: number;
} | null> {
  const storage = await getMemoryStorage();
  const session = await storage.getSession(sessionId);

  if (!session) return null;

  const startMs = new Date(session.startTime).getTime();
  const endMs = session.endTime
    ? new Date(session.endTime).getTime()
    : Date.now();
  const durationMs = endMs - startMs;
  const durationMinutes = durationMs / (1000 * 60);
  const deliberationsPerMinute =
    durationMinutes > 0 ? session.deliberationCount / durationMinutes : 0;

  return {
    session,
    durationMs,
    deliberationsPerMinute,
  };
}

/**
 * Link multiple sessions (for complex multi-session workflows)
 */
export interface SessionLink {
  sessions: string[];
  linkType: 'sequential' | 'parallel' | 'hierarchical';
  description?: string;
}

const sessionLinks = new Map<string, SessionLink>();

/**
 * Create a link between sessions
 */
export function linkSessions(
  sessions: string[],
  linkType: 'sequential' | 'parallel' | 'hierarchical',
  description?: string
): string {
  const linkId = generateTraceId({ sessions, linkType, t: Date.now() });

  sessionLinks.set(linkId, {
    sessions,
    linkType,
    description,
  });

  console.log(`[Memory] Linked ${sessions.length} sessions as ${linkType}`);

  return linkId;
}

/**
 * Get linked sessions
 */
export function getLinkedSessions(linkId: string): SessionLink | undefined {
  return sessionLinks.get(linkId);
}

/**
 * Cleanup old sessions (remove from active tracker)
 */
export function cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of activeSessions.entries()) {
    const sessionTime = new Date(session.startTime).getTime();
    if (now - sessionTime > maxAgeMs) {
      activeSessions.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Memory] Cleaned up ${cleaned} old sessions`);
  }

  return cleaned;
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): MemorySession[] {
  return Array.from(activeSessions.values());
}

/**
 * Get active sessions for an agent
 */
export function getActiveAgentSessions(agent: FoundingAgent): MemorySession[] {
  return Array.from(activeSessions.values()).filter((s) => s.agent === agent);
}
