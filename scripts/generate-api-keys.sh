#!/bin/bash
# Generate API keys for all Mobius services

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║   GENERATING API KEYS FOR MOBIUS SERVICES           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "Error: openssl is required but not installed."
    exit 1
fi

# Generate API keys
THOUGHT_BROKER_KEY="mobius_tb_sk_$(openssl rand -hex 16)"
OAA_LIBRARY_KEY="mobius_oaa_sk_$(openssl rand -hex 16)"
CIVIC_LEDGER_KEY="mobius_cl_sk_$(openssl rand -hex 16)"
LAB7_API_KEY="mobius_lab7_sk_$(openssl rand -hex 16)"
LAB4_API_KEY="mobius_lab4_sk_$(openssl rand -hex 16)"
GIC_INDEXER_KEY="mobius_gi_sk_$(openssl rand -hex 16)"
LAB6_API_KEY="mobius_lab6_sk_$(openssl rand -hex 16)"

# Create .env file
ENV_FILE=".env.mobius-services"
cat > "$ENV_FILE" <<EOF
# Mobius Multi-Service API Keys
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# 
# Add these to Render Dashboard → Environment Variables
# Service IDs:
#   Thought Broker: srv-d4aukoqli9vc73dktvkg
#   OAA Library:    srv-d3ropqer433s73ebtrvg
#   Civic Ledger:   srv-d3ao36h5pdvs73eo2egg
#   Lab7 API:       srv-d3m1hj7diees73a8t6hg
#   Lab4 API:       srv-d39clker433s73ebtrvg
#   GIC Indexer:    srv-d3fb39b3fgac73b312qg
#   Lab6 API:       srv-d3apepfdiees73a5lh50

# Thought Broker (mobius-systems.onrender.com)
THOUGHT_BROKER_API_KEY=$THOUGHT_BROKER_KEY
THOUGHT_BROKER_URL=https://mobius-systems.onrender.com

# OAA Library (oaa-api-library.onrender.com)
OAA_LIBRARY_API_KEY=$OAA_LIBRARY_KEY
OAA_LIBRARY_URL=https://oaa-api-library.onrender.com

# Civic Ledger (civic-protocol-core-ledger.onrender.com)
CIVIC_LEDGER_API_KEY=$CIVIC_LEDGER_KEY
CIVIC_LEDGER_URL=https://civic-protocol-core-ledger.onrender.com

# Lab7 API (lab7-proof.onrender.com)
LAB7_API_KEY=$LAB7_API_KEY
LAB7_API_URL=https://lab7-proof.onrender.com

# Lab4 API (hive-api-2le8.onrender.com)
LAB4_API_KEY=$LAB4_API_KEY
LAB4_API_URL=https://hive-api-2le8.onrender.com

# GIC Indexer (gic-indexer.onrender.com)
GIC_INDEXER_API_KEY=$GIC_INDEXER_KEY
GIC_INDEXER_URL=https://gic-indexer.onrender.com

# Lab6 API (lab6-proof-api.onrender.com)
LAB6_API_KEY=$LAB6_API_KEY
LAB6_API_URL=https://lab6-proof-api.onrender.com
EOF

echo "✅ API keys generated and saved to: $ENV_FILE"
echo ""
echo "📋 API Keys Generated:"
echo ""
echo "  Thought Broker: $THOUGHT_BROKER_KEY"
echo "  OAA Library:    $OAA_LIBRARY_KEY"
echo "  Civic Ledger:   $CIVIC_LEDGER_KEY"
echo "  Lab7 API:       $LAB7_API_KEY"
echo "  Lab4 API:       $LAB4_API_KEY"
echo "  GIC Indexer:    $GIC_INDEXER_KEY"
echo "  Lab6 API:       $LAB6_API_KEY"
echo ""
echo "⚠️  IMPORTANT: Add these keys to Render Dashboard:"
echo ""
echo "   1. Go to: https://dashboard.render.com"
echo "   2. For each service, go to: Settings → Environment"
echo "   3. Add environment variable: API_KEY"
echo "   4. Set value to the corresponding key above"
echo ""
echo "   Or use Render CLI:"
echo "   render env:set API_KEY=$THOUGHT_BROKER_KEY --service srv-d4aukoqli9vc73dktvkg"
echo ""
