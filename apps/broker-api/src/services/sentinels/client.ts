// apps/broker-api/src/services/sentinels/client.ts
// Sentinel Orchestration Client

import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ECHO_CONFIG } from "../../config/echo";

const anthropic = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface SentinelResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    url: string;
    title?: string;
    timestamp?: string;
  }>;
  vote?: "APPROVE" | "REJECT" | "UNCERTAIN";
  reasoning?: string;
}

export interface SentinelCallOptions {
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Calls a sentinel by name with query and context
 */
export async function callSentinel(
  sentinelName: string,
  query: string,
  context: any = {},
  options: SentinelCallOptions = {}
): Promise<SentinelResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[Sentinel] ${sentinelName} starting query: "${query.substring(0, 50)}..."`);

    const response = await executeSentinelCall(sentinelName, query, context, options);

    const duration = Date.now() - startTime;
    console.log(`[Sentinel] ${sentinelName} completed in ${duration}ms, confidence: ${response.confidence}`);

    // Track metrics
    await trackSentinelMetrics(sentinelName, {
      duration,
      confidence: response.confidence,
      status: "success"
    });

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Sentinel] ${sentinelName} failed:`, error);

    await trackSentinelMetrics(sentinelName, {
      duration,
      error: error.message,
      status: "error"
    });

    throw new Error(`Sentinel ${sentinelName} failed: ${error.message}`);
  }
}

/**
 * Executes the actual LLM call based on sentinel type
 */
async function executeSentinelCall(
  sentinelName: string,
  query: string,
  context: any,
  options: SentinelCallOptions
): Promise<SentinelResponse> {
  const systemPrompt = buildSentinelPrompt(sentinelName, context);

  switch (sentinelName) {
    case "claude-opus":
    case "claude-sonnet":
      return await callClaude(sentinelName, systemPrompt, query, options);
    
    case "gpt-4":
    case "gpt-4-turbo":
    case "gpt-3.5-turbo":
      return await callOpenAI(sentinelName, systemPrompt, query, options);
    
    case "gemini-pro":
    case "gemini-flash":
      return await callGoogle(sentinelName, systemPrompt, query, options);
    
    case "deepseek":
      return await callDeepSeek(sentinelName, systemPrompt, query, options);
    
    default:
      throw new Error(`Unknown sentinel: ${sentinelName}`);
  }
}

/**
 * Builds the system prompt for a sentinel
 */
function buildSentinelPrompt(sentinelName: string, context: any): string {
  const basePrompt = `You are a knowledge validator in the ECHO Layer consensus system. 
Your role is to:
1. Provide accurate, sourced answers
2. Cite specific URLs or documents
3. Rate your confidence 0.0-1.0
4. Vote: APPROVE, REJECT, or UNCERTAIN

If you lack sufficient information, vote UNCERTAIN.`;

  if (context.candidates) {
    return `${basePrompt}

You are reviewing candidate answers from other AI systems.
Evaluate them critically and provide your own informed answer.

Candidates: ${JSON.stringify(context.candidates, null, 2)}`;
  }

  if (context.baselineAnswer) {
    return `${basePrompt}

You are validating a baseline answer:
Baseline: ${context.baselineAnswer}

Provide an independent assessment.`;
  }

  return basePrompt;
}

/**
 * Calls Anthropic Claude API
 */
async function callClaude(
  model: string,
  systemPrompt: string,
  query: string,
  options: SentinelCallOptions
): Promise<SentinelResponse> {
  const response = await anthropic.messages.create({
    model: model.replace("claude-", ""),
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature || 0.1,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: query
    }]
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  return parseSentinelResponse(content);
}

/**
 * Calls OpenAI GPT API
 */
async function callOpenAI(
  model: string,
  systemPrompt: string,
  query: string,
  options: SentinelCallOptions
): Promise<SentinelResponse> {
  const response = await openai.chat.completions.create({
    model,
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature || 0.1,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ]
  });

  const content = response.choices[0]?.message?.content || "";

  return parseSentinelResponse(content);
}

/**
 * Calls Google Gemini API
 */
async function callGoogle(
  model: string,
  systemPrompt: string,
  query: string,
  options: SentinelCallOptions
): Promise<SentinelResponse> {
  const modelInstance = google.getGenerativeModel({ 
    model: model.replace("gemini-", ""),
    generationConfig: {
      maxOutputTokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.1,
    }
  });

  const response = await modelInstance.generateContent(
    `${systemPrompt}\n\nUser: ${query}`
  );

  const content = response.response.text();

  return parseSentinelResponse(content);
}

/**
 * Calls DeepSeek API
 */
async function callDeepSeek(
  model: string,
  systemPrompt: string,
  query: string,
  options: SentinelCallOptions
): Promise<SentinelResponse> {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json() as any;
  const content = data.choices[0]?.message?.content || "";

  return parseSentinelResponse(content);
}

/**
 * Parses LLM response into SentinelResponse format
 */
function parseSentinelResponse(content: string): SentinelResponse {
  // Attempt to extract structured data from the response
  // This is a simplified parser - in production, use structured output
  const confidenceMatch = content.match(/Confidence:\s*(\d+\.\d+)/);
  const voteMatch = content.match(/Vote:\s*(APPROVE|REJECT|UNCERTAIN)/i);
  
  // Extract URLs from content
  const urlMatches = content.match(/https?:\/\/[^\s)]+/g) || [];
  const sources = urlMatches.map(url => ({ url }));

  return {
    answer: content,
    confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.85,
    sources,
    vote: voteMatch ? voteMatch[1].toUpperCase() as "APPROVE" | "REJECT" | "UNCERTAIN" : "UNCERTAIN",
    reasoning: content.substring(0, 500)
  };
}

/**
 * Tracks sentinel performance metrics
 */
async function trackSentinelMetrics(
  sentinelName: string,
  metrics: { duration: number; confidence?: number; error?: string; status: string }
): Promise<void> {
  // Write to Prometheus/Grafana via DVA.LITE
  const dvaUrl = process.env.DVA_LITE_URL;
  if (!dvaUrl) return;

  try {
    await fetch(`${dvaUrl}/metrics/sentinel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.DVA_LITE_API_KEY || ""
      },
      body: JSON.stringify({
        sentinel: sentinelName,
        ...metrics,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Non-critical, don't throw
    console.warn(`[Metrics] Failed to track sentinel metrics:`, error);
  }
}

