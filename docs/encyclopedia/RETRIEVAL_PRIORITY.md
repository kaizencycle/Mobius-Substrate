# Retrieval Priority Logic

You already feel this, but here it is clean so you can wire it into SDKs.

---

## Priority Stack

1. **ECHO Layer** – “recent memory / cache”
   - Fast, cheap,  high-hit-rate for *recent* topics
   - Good for: “What did I decide yesterday?” / “What did Mobius already say about X this week?”

2. **Encyclopedia** – “long-term canon”
   - Slower than ECHO but much more stable, GI-filtered
   - Good for: “What is MIC?” / “What is the HIVE game?” / “What is Thought Broker?”

3. **Thought Broker** – “live consensus”
   - Most expensive, uses all engines
   - Good for: new questions, changing facts, or when canon doesn’t exist / is out of date.

---

## Simple Decision Tree

1. Derive or detect `topicId` (from question, or explicit param).
2. Ask ECHO:
   - If hit with `giScore ≥ 0.93` **and** timestamp < freshness window:
     - Use ECHO result.
3. Ask Encyclopedia:
   - If canonical entry exists with `giScore ≥ 0.95`:
     - Use Encyclopedia result.
4. Else:
   - Use Thought Broker; if `giScore ≥ 0.95` → optionally enqueue for Encyclopedia ingest.

That’s the **“cache → canon → compute”** pattern.
