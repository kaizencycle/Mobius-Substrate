#!/bin/bash
# Multi-Service Deployment Verification Script
# Tests all 7 Mobius services and reports status

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║   MOBIUS MULTI-SERVICE DEPLOYMENT VERIFICATION      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Service definitions
declare -A SERVICES=(
    ["thought-broker"]="https://mobius-systems.onrender.com/v1/loop/health"
    ["oaa-library"]="https://oaa-api-library.onrender.com/health"
    ["civic-ledger"]="https://civic-protocol-core-ledger.onrender.com/health"
    ["lab7-api"]="https://lab7-proof.onrender.com/health"
    ["lab4-api"]="https://hive-api-2le8.onrender.com/health"
    ["gic-indexer"]="https://gic-indexer.onrender.com/health"
    ["lab6-api"]="https://lab6-proof-api.onrender.com/health"
)

declare -A SERVICE_IDS=(
    ["thought-broker"]="srv-d4aukoqli9vc73dktvkg"
    ["oaa-library"]="srv-d3ropqer433s73ebtrvg"
    ["civic-ledger"]="srv-d3ao36h5pdvs73eo2egg"
    ["lab7-api"]="srv-d3m1hj7diees73a8t6hg"
    ["lab4-api"]="srv-d39clker433s73ebtrvg"
    ["gic-indexer"]="srv-d3fb39b3fgac73b312qg"
    ["lab6-api"]="srv-d3apepfdiees73a5lh50"
)

RESULTS_FILE="deployment-status-$(date +%Y%m%d-%H%M%S).json"
STATUS_SUMMARY=()

echo "Testing all services..."
echo ""

# Test each service
for service in "${!SERVICES[@]}"; do
    url="${SERVICES[$service]}"
    service_id="${SERVICE_IDS[$service]}"
    
    echo "Testing: $service"
    echo "  URL: $url"
    echo "  Service ID: $service_id"
    
    # Test with timeout
    if response=$(curl -s -w "\n%{http_code}" --max-time 10 "$url" 2>&1); then
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "000" ]; then
            if [ "$http_code" = "200" ]; then
                echo "  ✅ Status: UP (HTTP $http_code)"
                STATUS_SUMMARY+=("✅ $service: UP")
            else
                echo "  ⚠️  Status: CONNECTION FAILED (may be sleeping)"
                STATUS_SUMMARY+=("⚠️  $service: SLEEPING/FAILED")
            fi
        else
            echo "  ❌ Status: DOWN (HTTP $http_code)"
            STATUS_SUMMARY+=("❌ $service: DOWN ($http_code)")
        fi
        
        if [ -n "$body" ] && [ "$http_code" = "200" ]; then
            echo "  Response: $body"
        fi
    else
        echo "  ❌ Status: FAILED TO CONNECT"
        STATUS_SUMMARY+=("❌ $service: CONNECTION FAILED")
    fi
    
    echo ""
done

# Generate summary
echo "╔══════════════════════════════════════════════════════╗"
echo "║   DEPLOYMENT STATUS SUMMARY                          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

for status in "${STATUS_SUMMARY[@]}"; do
    echo "  $status"
done

echo ""
echo "Note: Services on Render free tier may be sleeping."
echo "      First request may take 30-60 seconds to wake up."
echo ""
echo "Next steps:"
echo "  1. If services are sleeping, make a request to wake them"
echo "  2. Configure API keys in Render dashboard"
echo "  3. Run: ./scripts/generate-api-keys.sh"
echo "  4. Run: ./scripts/configure-service-auth.sh"
echo ""
