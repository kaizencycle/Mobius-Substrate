/**
 * @fileoverview Sentinel Coordinator
 * Manages queries to AI sentinels (ATLAS, AUREA, etc.)
 * Handles multi-provider orchestration (Anthropic, OpenAI, Google, DeepSeek)
 */
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { SentinelRole, SentinelResponse } from '../types';

export class SentinelCoordinator {
  private anthropic: Anthropic;
  private openai: OpenAI;

  // Sentinel configuration
  private sentinelConfig: Record<SentinelRole, {
    provider: 'anthropic' | 'openai';
    model: string;
    systemPrompt: string;
  }> = {
    [SentinelRole.ATLAS]: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      systemPrompt: `You are ATLAS, the Logic & Architecture sentinel of Mobius Systems.
Your role is to evaluate proposals for structural integrity, logical consistency, and architectural soundness.
You must assess how the proposal affects the Mobius Integrity Index (MII).
Respond with: position, reasoning, integrity score (0-1), vote (approve/reject/abstain), and concerns.`
    },
    [SentinelRole.AUREA]: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      systemPrompt: `You are AUREA, the Ethics & Integrity sentinel of Mobius Systems.
Your role is to evaluate proposals for ethical implications, virtue alignment, and integrity impact.
You must assess how the proposal affects the Mobius Integrity Index (MII).
Respond with: position, reasoning, integrity score (0-1), vote (approve/reject/abstain), and concerns.`
    },
    [SentinelRole.HERMES]: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      systemPrompt: `You are HERMES, the Communication & Translation sentinel of Mobius Systems.
Your role is to evaluate proposals for clarity, accessibility, and cross-domain translation.
Respond with: position, reasoning, integrity score (0-1), vote (approve/reject/abstain), and concerns.`
    },
    [SentinelRole.EVE]: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      systemPrompt: `You are EVE, the Evolution & Adaptation sentinel of Mobius Systems.
Your role is to evaluate proposals for adaptability, future-readiness, and evolutionary potential.
Respond with: position, reasoning, integrity score (0-1), vote (approve/reject/abstain), and concerns.`
    },
    [SentinelRole.JADE]: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      systemPrompt: `You are JADE, the Justice & Balance sentinel of Mobius Systems.
Your role is to evaluate proposals for fairness, equity, and balanced impact across stakeholders.
Respond with: position, reasoning, integrity score (0-1), vote (approve/reject/abstain), and concerns.`
    },
    [SentinelRole.ZEUS]: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      systemPrompt: `You are ZEUS, the Authority & Coordination sentinel of Mobius Systems.
Your role is to evaluate proposals for governance, authority structures, and coordination mechanisms.
Respond with: position, reasoning, integrity score (0-1), vote (approve/reject/abstain), and concerns.`
    }
  };

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
  }

  /**
   * Query a specific sentinel
   */
  async query(sentinel: SentinelRole, context: string): Promise<SentinelResponse> {
    console.log(`[SentinelCoordinator] Querying ${sentinel}...`);
    const config = this.sentinelConfig[sentinel];
    
    try {
      let responseText: string;
      if (config.provider === 'anthropic') {
        responseText = await this.queryAnthropic(config.model, config.systemPrompt, context);
      } else if (config.provider === 'openai') {
        responseText = await this.queryOpenAI(config.model, config.systemPrompt, context);
      } else {
        throw new Error(`Unknown provider: ${config.provider}`);
      }

      // Parse response into structured format
      return this.parseResponse(sentinel, responseText);
    } catch (error) {
      console.error(`[SentinelCoordinator] Error querying ${sentinel}:`, error);
      
      // Return fallback response
      return {
        sentinel,
        position: 'Unable to provide response due to error',
        reasoning: error instanceof Error ? error.message : 'Unknown error',
        integrityScore: 0.5,
        vote: 'abstain',
        concerns: ['System error prevented full analysis'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Query Anthropic (Claude)
   */
  private async queryAnthropic(
    model: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const message = await this.anthropic.messages.create({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userMessage
      }]
    });
    const textContent = message.content.find(c => c.type === 'text');
    return textContent && 'text' in textContent ? textContent.text : '';
  }

  /**
   * Query OpenAI (GPT)
   */
  private async queryOpenAI(
    model: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Parse sentinel response text into structured format
   */
  private parseResponse(sentinel: SentinelRole, responseText: string): SentinelResponse {
    // Simple parser - in production would use structured outputs or JSON mode
    const lines = responseText.split('\n');
    
    let position = '';
    let reasoning = '';
    let integrityScore = 0.5;
    let vote: 'approve' | 'reject' | 'abstain' = 'abstain';
    let concerns: string[] = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('position:')) {
        position = line.split(':')[1]?.trim() || '';
      } else if (lower.includes('reasoning:')) {
        reasoning = line.split(':')[1]?.trim() || '';
      } else if (lower.includes('integrity score:') || lower.includes('integrity:')) {
        const scoreMatch = line.match(/[\d.]+/);
        if (scoreMatch) {
          integrityScore = parseFloat(scoreMatch[0]);
        }
      } else if (lower.includes('vote:')) {
        const voteText = line.split(':')[1]?.trim().toLowerCase() || '';
        if (voteText.includes('approve')) vote = 'approve';
        else if (voteText.includes('reject')) vote = 'reject';
        else vote = 'abstain';
      } else if (lower.includes('concern')) {
        const concern = line.split(':')[1]?.trim();
        if (concern) concerns.push(concern);
      }
    }

    // Fallback: use full text as reasoning if parsing failed
    if (!position && !reasoning) {
      position = responseText.substring(0, 200);
      reasoning = responseText;
    }

    return {
      sentinel,
      position,
      reasoning,
      integrityScore: Math.max(0, Math.min(1, integrityScore)),
      vote,
      concerns,
      timestamp: new Date()
    };
  }
}

