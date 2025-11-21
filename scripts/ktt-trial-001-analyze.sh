#!/bin/bash
# KTT Trial-001 Analysis Script
# Run this after the 4-day trial period to analyze results

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
MOBIUS_API_URL="${MOBIUS_API_URL:-https://mobius-systems.onrender.com}"
MOBIUS_API_KEY="${MOBIUS_API_KEY:-${THOUGHT_BROKER_API_KEY}}"

if [ -z "$MOBIUS_API_KEY" ]; then
    echo -e "${RED}ERROR: MOBIUS_API_KEY or THOUGHT_BROKER_API_KEY not set${NC}"
    exit 1
fi

TRIAL_ID="KTT-001-2025"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   KTT TRIAL-001 ANALYSIS               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Collect final data
echo -e "${YELLOW}[1/2] Collecting final trial data...${NC}"
DATA_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}/data?data_types=cognitive_effort,reasoning_coherence,constitutional_compliance,gi_stability,multi_agent_consensus&aggregation=daily,hourly,by_sentinel,by_service" \
  -H "X-API-Key: ${MOBIUS_API_KEY}")

HTTP_CODE=$(echo "$DATA_RESPONSE" | tail -n1)
BODY=$(echo "$DATA_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Data collected${NC}"
    echo "$BODY" | jq . > "/tmp/ktt-001-data-$(date +%Y%m%d).json" 2>/dev/null || echo "$BODY" > "/tmp/ktt-001-data-$(date +%Y%m%d).json"
else
    echo -e "${RED}❌ Failed to collect data (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi

# Step 2: Run analysis
echo -e "${YELLOW}[2/2] Running comprehensive analysis...${NC}"
ANALYZE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${MOBIUS_API_KEY}" \
  -d '{
    "analysis_type": "comprehensive",
    "hypothesis_test": "multi_agent_constitutional > single_agent_optimization",
    "significance_level": 0.05,
    "output_formats": ["academic_paper", "conference_presentation", "public_report"]
  }')

HTTP_CODE=$(echo "$ANALYZE_RESPONSE" | tail -n1)
BODY=$(echo "$ANALYZE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Analysis complete${NC}"
    echo "$BODY" | jq . > "/tmp/ktt-001-analysis-$(date +%Y%m%d).json" 2>/dev/null || echo "$BODY" > "/tmp/ktt-001-analysis-$(date +%Y%m%d).json"
    echo ""
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}Analysis saved to: /tmp/ktt-001-analysis-$(date +%Y%m%d).json${NC}"
else
    echo -e "${RED}❌ Analysis failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   KTT TRIAL-001 ANALYSIS COMPLETE      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
