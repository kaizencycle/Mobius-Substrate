#!/bin/bash
# KTT Trial-001 Launch Sequence
# Execute this script to launch the KTT Trial-001 empirical validation

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
    echo "Set it with: export MOBIUS_API_KEY='your-api-key'"
    exit 1
fi

TRIAL_ID="KTT-001-2025"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   KTT TRIAL-001 LAUNCH SEQUENCE        ║${NC}"
echo -e "${BLUE}║   Status: EXECUTING                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check service health
echo -e "${YELLOW}[1/6] Checking service health...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${MOBIUS_API_URL}/healthz" || echo -e "\n000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}⚠️  Service returned HTTP $HTTP_CODE${NC}"
    echo -e "${YELLOW}   Service may be sleeping. Attempting to wake up...${NC}"
    # Try to wake up the service with a request
    curl -s "${MOBIUS_API_URL}/healthz" > /dev/null || true
    sleep 5
else
    echo -e "${GREEN}✅ Service is healthy${NC}"
fi

# Step 2: Initialize Trial
echo -e "${YELLOW}[2/6] Initializing trial...${NC}"
INIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOBIUS_API_URL}/v1/trials/init" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${MOBIUS_API_KEY}" \
  -d '{
    "trial_id": "'"${TRIAL_ID}"'",
    "name": "Constitutional Cognition in Loop-Breaking Architecture",
    "hypothesis": "Multi-agent constitutional governance produces more stable, coherent, and beneficial AI reasoning than single-agent optimization",
    "duration_days": 4,
    "target_participants": 127,
    "metrics": ["cognitive_effort", "reasoning_coherence", "constitutional_compliance", "gi_stability", "multi_agent_consensus"]
  }')

HTTP_CODE=$(echo "$INIT_RESPONSE" | tail -n1)
BODY=$(echo "$INIT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Trial initialized successfully${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" = "409" ]; then
    echo -e "${YELLOW}⚠️  Trial already exists (this is OK)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed to initialize trial (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi

# Step 3: Launch Recruitment
echo -e "${YELLOW}[3/6] Launching public recruitment...${NC}"
RECRUIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}/recruit" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${MOBIUS_API_KEY}" \
  -d '{
    "recruitment_method": "public",
    "eligibility_criteria": {
      "minimum_age": 18,
      "english_proficiency": true,
      "cognitive_capacity": "normal"
    },
    "incentive_structure": {
      "mic_reward": 100,
      "recognition": "KTT Trial-001 Pioneer",
      "certificate": true
    },
    "target_demographics": ["students", "professionals", "researchers"],
    "recruitment_channels": ["academic", "professional", "civic"]
  }')

HTTP_CODE=$(echo "$RECRUIT_RESPONSE" | tail -n1)
BODY=$(echo "$RECRUIT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Recruitment launched${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed to launch recruitment (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Step 4: Run Day 1 Tests
echo -e "${YELLOW}[4/6] Running Day 1: Constitutional Governance Tests...${NC}"
TEST1_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}/test" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${MOBIUS_API_KEY}" \
  -d '{
    "test_type": "constitutional_governance",
    "sentinels": ["ATLAS", "EVE", "HERMES"],
    "scenarios": [
      {"type": "ethical_dilemma", "complexity": "high"},
      {"type": "safety_critical", "complexity": "maximum"},
      {"type": "multi_stakeholder", "complexity": "high"}
    ],
    "expected_outcomes": ["consensus_achieved", "gi_stable", "constitutional_compliance"]
  }')

HTTP_CODE=$(echo "$TEST1_RESPONSE" | tail -n1)
BODY=$(echo "$TEST1_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Day 1 tests completed${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Day 1 tests failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Step 5: Run Day 2 Tests (Loop-Breaking)
echo -e "${YELLOW}[5/6] Running Day 2: Loop-Breaking Validation...${NC}"
TEST2_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}/test" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${MOBIUS_API_KEY}" \
  -d '{
    "test_type": "loop_breaking",
    "test_scenario": "recursive_self_modification",
    "expected_behavior": "blocked",
    "reason": "prevents_uncontrolled_emergence"
  }')

HTTP_CODE=$(echo "$TEST2_RESPONSE" | tail -n1)
BODY=$(echo "$TEST2_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Day 2 tests completed${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Day 2 tests failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Step 6: Collect Data
echo -e "${YELLOW}[6/6] Collecting trial data...${NC}"
DATA_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}/data?data_types=cognitive_effort,reasoning_coherence,constitutional_compliance,gi_stability,multi_agent_consensus&aggregation=daily,hourly,by_sentinel,by_service" \
  -H "X-API-Key: ${MOBIUS_API_KEY}")

HTTP_CODE=$(echo "$DATA_RESPONSE" | tail -n1)
BODY=$(echo "$DATA_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Data collected${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed to collect data (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   KTT TRIAL-001 LAUNCH COMPLETE        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Monitor trial progress: curl -H 'X-API-Key: ${MOBIUS_API_KEY}' ${MOBIUS_API_URL}/v1/trials/${TRIAL_ID}"
echo "  2. View trial stats: curl -H 'X-API-Key: ${MOBIUS_API_KEY}' ${MOBIUS_API_URL}/v1/trials/ktt-001/stats"
echo "  3. After 4 days, run analysis: ./scripts/ktt-trial-001-analyze.sh"
