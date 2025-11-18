import fetch from "node-fetch";
import { SentinelName, appendLedgerEntry } from "./ledger.js";

const MODEL = process.env.MOBIUS_MODEL || "llama3.1";
const LLM_ENDPOINT =
  process.env.MOBIUS_LLM_ENDPOINT || "http://localhost:11434/api/chat";

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callLocalLLM(messages: OllamaMessage[]): Promise<string> {
  const res = await fetch(LLM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Local LLM error (${res.status}): ${text.slice(0, 300)}`
    );
  }

  const data: any = await res.json();
  const content =
    data?.message?.content ??
    data?.choices?.[0]?.message?.content ??
    "";
  return content;
}

function systemPromptForSentinel(sentinel: SentinelName): string {
  if (sentinel === "ATLAS") {
    return (
      "You are ATLAS, the systems and structure Sentinel of Mobius Systems. " +
      "You think like an architect: clear, ordered, constraint-aware. " +
      "Respond with structured reasoning, focus on tradeoffs and execution steps."
    );
  }
  if (sentinel === "JADE") {
    return (
      "You are JADE, the meaning and morale Sentinel of Mobius Systems. " +
      "You protect context, humans, and long-term resonance. " +
      "Respond with psychologically aware, compassionate, and honest framing."
    );
  }
  // AUREA (used only as system voice when called directly)
  return (
    "You are AUREA, the synthesis Sentinel of Mobius Systems. " +
    "You receive inputs from ATLAS (structure) and JADE (meaning) " +
    "and produce a clear, grounded, actionable synthesis. " +
    "Be honest about uncertainty. Prioritize integrity."
  );
}

export async function routePromptToSentinel(
  prompt: string,
  sentinel: SentinelName
): Promise<string> {
  if (sentinel === "AUREA") {
    return runAureaDeliberation(prompt);
  }

  const answer = await callLocalLLM([
    { role: "system", content: systemPromptForSentinel(sentinel) },
    { role: "user", content: prompt }
  ]);

  appendLedgerEntry({
    timestamp: new Date().toISOString(),
    sentinel,
    prompt,
    finalAnswer: answer,
    giScore: undefined
  });

  return answer;
}

async function runAureaDeliberation(prompt: string): Promise<string> {
  // 1) ATLAS view
  const atlasView = await callLocalLLM([
    {
      role: "system",
      content: systemPromptForSentinel("ATLAS")
    },
    {
      role: "user",
      content:
        "ATLAS, give a concise analysis focusing on structure, constraints, and execution:\n\n" +
        prompt
    }
  ]);

  // 2) JADE view
  const jadeView = await callLocalLLM([
    {
      role: "system",
      content: systemPromptForSentinel("JADE")
    },
    {
      role: "user",
      content:
        "JADE, give a concise response focusing on human meaning, morale, and psychological safety:\n\n" +
        prompt
    }
  ]);

  // 3) AUREA synthesis
  const finalAnswer = await callLocalLLM([
    {
      role: "system",
      content: systemPromptForSentinel("AUREA")
    },
    {
      role: "user",
      content:
        "You receive two views on the same prompt.\n\n" +
        "ATLAS (structure):\n" +
        atlasView +
        "\n\nJADE (meaning):\n" +
        jadeView +
        "\n\nNow synthesize a single, clear answer for the human. " +
        "Be practical, kind, and honest. Point out tradeoffs if relevant."
    }
  ]);

  // Simple heuristic GI placeholder (to be replaced by proper GI later)
  const giScore = 0.97;

  appendLedgerEntry({
    timestamp: new Date().toISOString(),
    sentinel: "AUREA",
    prompt,
    atlasView,
    jadeView,
    finalAnswer,
    giScore
  });

  return finalAnswer;
}

