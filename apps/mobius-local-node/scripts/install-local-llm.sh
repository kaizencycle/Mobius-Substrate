#!/usr/bin/env bash
set -euo pipefail

MODEL="${MOBIUS_MODEL:-llama3.1}"

echo "🔧 Installing local LLM for Mobius Local Node"
echo "   Model: ${MODEL}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "❌ Ollama not found. Please install from https://ollama.com/download"
  exit 1
fi

echo "📥 Pulling model via Ollama..."
ollama pull "${MODEL}"

echo "✅ Model ready."
echo
echo "Next steps:"
echo "  cd apps/mobius-local-node"
echo "  npm run dev"

