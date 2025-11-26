// apps/broker-api/src/utils/embedding.ts
// Vector embedding operations for semantic search

import OpenAI from "openai";

const EMBEDDING_DIMENSION = 1536;
const EMBEDDING_MODEL = "text-embedding-3-small"; // or "text-embedding-ada-002"

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Generates embeddings for text
 */
export async function embedText(text: string): Promise<number[]> {
  if (!openai) {
    console.warn("[Embedding] OpenAI API key not configured, returning empty embedding");
    return [];
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSION
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[Embedding] Failed to generate embedding:", error);
    return [];
  }
}

/**
 * Generates embeddings for multiple texts (batch)
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!openai || texts.length === 0) {
    return texts.map(() => []);
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSION
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error("[Embedding] Failed to generate batch embeddings:", error);
    return texts.map(() => []);
  }
}

/**
 * Computes cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds best match from embedding index
 */
export async function findBestEmbeddingMatch(
  queryEmbedding: number[],
  candidateEmbeddings: number[][]
): Promise<{ index: number; similarity: number }> {
  if (queryEmbedding.length === 0 || candidateEmbeddings.length === 0) {
    return { index: -1, similarity: 0 };
  }

  let bestIndex = -1;
  let bestSimilarity = -1;

  for (let i = 0; i < candidateEmbeddings.length; i++) {
    const similarity = cosineSimilarity(queryEmbedding, candidateEmbeddings[i]);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestIndex = i;
    }
  }

  return { index: bestIndex, similarity: bestSimilarity };
}

