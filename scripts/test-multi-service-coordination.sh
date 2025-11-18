#!/bin/bash
# Test multi-service coordination and consensus

set -e

# Load API keys from .env.mobius-services if it exists
if [ -f ".env.mobius-services" ]; then
    source .env.mobius-services
fi

echo "╔══════════════════════════════════════════════════════╗"
echo "║   TESTING MULTI-SERVICE COORDINATION                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

THOUGHT_BROKER_URL="${THOUGHT_BROKER_URL:-https://mobius-systems.onrender.com}"
THOUGHT_BROKER_KEY="${THOUGHT_BROKER_API_KEY:-}"

if [ -z "$THOUGHT_BROKER_KEY" ]; then
    echo "⚠️  Warning: THOUGHT_BROKER_API_KEY not set"
    echo "   Run: ./scripts/generate-api-keys.sh first"
    echo ""
fi

echo "Step 1: Testing Thought Broker Health"
echo "  URL: $THOUGHT_BROKER_URL/v1/loop/health"
echo ""

if response=$(curl -s -w "\n%{http_code}" --max-time 30 "$THOUGHT_BROKER_URL/v1/loop/health" 2>&1); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "  ✅ Thought Broker is UP"
        echo "  Response: $body"
    else
        echo "  ⚠️  Thought Broker returned HTTP $http_code"
        echo "  Response: $body"
        echo "  Note: Service may be sleeping (first request takes 30-60s)"
    fi
else
    echo "  ❌ Failed to connect to Thought Broker"
fi

echo ""
echo "Step 2: Testing Multi-Service Deliberation"
echo "  This requires Thought Broker to be configured with service URLs"
echo ""

# Test Thought Broker loop start endpoint
echo "  Testing Thought Broker loop start..."
    
LOOP_START_PAYLOAD='{
    "cycle": "C-127",
    "proposalRef": "test-proposal-001",
    "goal": "Test multi-service coordination",
    "models": [{"id": "oaa-llm-a"}, {"id": "oaa-llm-b"}]
}'

if response=$(curl -s -w "\n%{http_code}" \
    -X POST "$THOUGHT_BROKER_URL/v1/loop/start" \
    -H "Content-Type: application/json" \
    -d "$LOOP_START_PAYLOAD" \
    --max-time 60 2>&1); then
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "  ✅ Loop start request accepted"
        echo "  Response: $body"
        
        # Extract loopId if present
        if echo "$body" | grep -q "loopId"; then
            loop_id=$(echo "$body" | grep -o '"loopId":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$loop_id" ]; then
                echo ""
                echo "  Checking loop status..."
                sleep 2
                if status_response=$(curl -s "$THOUGHT_BROKER_URL/v1/loop/$loop_id/status" 2>&1); then
                    echo "  Status: $status_response"
                fi
            fi
        fi
    else
        echo "  ⚠️  Loop start returned HTTP $http_code"
        echo "  Response: $body"
        echo "  Note: This is expected if Thought Broker needs configuration"
    fi
else
    echo "  ⚠️  Failed to send loop start request"
fi

echo ""
echo "Step 3: Testing Cross-Service Health Checks"
echo ""

SERVICES=(
    "OAA Library:https://oaa-api-library.onrender.com/health"
    "Civic Ledger:https://civic-protocol-core-ledger.onrender.com/health"
    "Lab7 API:https://lab7-proof.onrender.com/health"
    "Lab4 API:https://hive-api-2le8.onrender.com/health"
    "GIC Indexer:https://gic-indexer.onrender.com/health"
    "Lab6 API:https://lab6-proof-api.onrender.com/health"
)

for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r name url <<< "$service_info"
    echo "  Testing: $name"
    
    if response=$(curl -s -w "\n%{http_code}" --max-time 10 "$url" 2>&1); then
        http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" = "200" ]; then
            echo "    ✅ UP"
        else
            echo "    ⚠️  HTTP $http_code (may be sleeping)"
        fi
    else
        echo "    ❌ Connection failed"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   COORDINATION TEST COMPLETE                        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Ensure all services are awake (may take 30-60s)"
echo "  2. Configure API keys in Render dashboard"
echo "  3. Test deliberation flow end-to-end"
echo "  4. Verify multi-sentinel consensus"
echo ""
