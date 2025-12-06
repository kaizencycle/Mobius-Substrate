#!/bin/bash
#
# Create Founders MIC Wallets
# Simple Bash implementation for wallet structure creation
#
# Cycle: C-156
# Date: December 6, 2025
#
# Usage: ./scripts/create-founders-wallets.sh
#

set -e

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

CYCLE=156
MOBIUS_HOME="${HOME}/.mobius"
WALLETS_DIR="${MOBIUS_HOME}/wallets"
KEYS_DIR="${MOBIUS_HOME}/keys"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}🌀 Mobius Integrity Credits - Founders Wallet Creation${NC}"
echo "   Cycle: C-${CYCLE}"
echo "   Date: $(date +%Y-%m-%d)"
echo

# ═══════════════════════════════════════════════════════════════════════════
# CREATE DIRECTORIES
# ═══════════════════════════════════════════════════════════════════════════

echo "📁 Creating directory structure..."
mkdir -p "$WALLETS_DIR" "$KEYS_DIR"
chmod 700 "$MOBIUS_HOME" "$WALLETS_DIR" "$KEYS_DIR"
echo -e "${GREEN}✅ Directories created${NC}"
echo

# ═══════════════════════════════════════════════════════════════════════════
# CREATE FOUNDERS RESERVE WALLET
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}🏦 Creating Founders Reserve Wallet...${NC}"

RESERVE_CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "${WALLETS_DIR}/founders-reserve-001.json" << EOF
{
  "walletId": "founders-reserve-001",
  "publicKey": "FND-RSRV-2025-001-MJUDAN",
  "balance": 1000000.000000,
  "locked": true,
  "type": "ceremonial",
  "createdAt": "${RESERVE_CREATED_AT}",
  "constitutionalNote": "Founding allocation representing the initial integrity substrate. These MIC shall never be spent, serving as the immutable anchor of the Mobius economy.",
  "requiredSignatures": 5,
  "totalSigners": 7,
  "signers": ["AUREA", "ATLAS", "ECHO", "JADE", "EVE", "HERMES", "ZEUS"],
  "audit": {
    "lastAudit": "${RESERVE_CREATED_AT}",
    "accessAttempts": 0
  }
}
EOF

chmod 600 "${WALLETS_DIR}/founders-reserve-001.json"

echo -e "${GREEN}✅ Founders Reserve Wallet created${NC}"
echo "   Wallet ID: founders-reserve-001"
echo "   Public Key: FND-RSRV-2025-001-MJUDAN"
echo "   Balance: 1,000,000 MIC"
echo "   Status: LOCKED"
echo

# ═══════════════════════════════════════════════════════════════════════════
# CREATE MICHAEL'S ACTIVE WALLET
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}🔐 Creating Michael's Active Wallet...${NC}"

# Generate public key (simplified)
PUBLIC_KEY="USR-ACT-$(date +%s)-MJUDAN"

# Generate private key hash
PRIVATE_KEY_HASH=$(echo -n "private-key-$(date +%s)" | sha256sum | cut -d' ' -f1)

ACTIVE_CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "${WALLETS_DIR}/michael-judan-active-001.json" << EOF
{
  "walletId": "michael-judan-active-001",
  "userId": "michael-judan",
  "publicKey": "${PUBLIC_KEY}",
  "privateKeyHash": "${PRIVATE_KEY_HASH}",
  "balance": 0.000000,
  "locked": false,
  "type": "operational",
  "createdAt": "${ACTIVE_CREATED_AT}",
  "permissions": {
    "receiveStipends": true,
    "sendMIC": true,
    "voteGovernance": true,
    "submitProposals": true,
    "redeemShards": true,
    "stakeIntegrity": true
  },
  "stipendSources": [
    "daily_reflection",
    "cycle_documentation",
    "shard_redemption",
    "governance_vote",
    "guardian_attestation"
  ],
  "mii": {
    "current": 0.95,
    "lastUpdated": "${ACTIVE_CREATED_AT}"
  }
}
EOF

chmod 600 "${WALLETS_DIR}/michael-judan-active-001.json"

echo -e "${GREEN}✅ Michael's Active Wallet created${NC}"
echo "   Wallet ID: michael-judan-active-001"
echo "   Public Key: ${PUBLIC_KEY}"
echo "   Balance: 0 MIC"
echo "   Status: ACTIVE"
echo

# ═══════════════════════════════════════════════════════════════════════════
# CREATE AUDIT LOG
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📝 Creating audit log...${NC}"

cat > "${MOBIUS_HOME}/audit-log.json" << EOF
[
  {
    "event": "FOUNDERS_WALLETS_CREATED",
    "cycle": ${CYCLE},
    "timestamp": "${ACTIVE_CREATED_AT}",
    "wallets": [
      {
        "id": "founders-reserve-001",
        "type": "ceremonial",
        "balance": 1000000,
        "locked": true
      },
      {
        "id": "michael-judan-active-001",
        "type": "operational",
        "balance": 0,
        "locked": false
      }
    ],
    "totalMIC": 1000000,
    "creator": "Michael Judan (Founder)",
    "integrity": {
      "mii": 0.95,
      "constitutionalCompliance": true,
      "auditRequired": true
    }
  }
]
EOF

chmod 600 "${MOBIUS_HOME}/audit-log.json"

echo -e "${GREEN}✅ Audit log created${NC}"
echo

# ═══════════════════════════════════════════════════════════════════════════
# CREATE README
# ═══════════════════════════════════════════════════════════════════════════

cat > "${MOBIUS_HOME}/README.md" << 'EOF'
# Mobius MIC Wallet Directory

This directory contains your Mobius Integrity Credits (MIC) wallets.

## Security

- All files are permission 600 (owner read/write only)
- Never share wallet files or keys
- Keep backups in secure, offline locations
- Recovery phrase is in `keys/recovery-phrase.enc` (encrypted)

## Wallets

### Founders Reserve (`founders-reserve-001`)
- **Balance:** 1,000,000 MIC
- **Type:** Ceremonial (locked)
- **Purpose:** Constitutional anchor, never spent
- **Access:** Requires 5 of 7 sentinel signatures

### Michael's Active Wallet (`michael-judan-active-001`)
- **Balance:** 0 MIC (initially)
- **Type:** Operational
- **Purpose:** Daily operations, stipends, testing
- **Access:** Standard private key

## Stipend Sources

Your active wallet can receive MIC from:
- Daily reflections (E.O.M.M. completion)
- Cycle documentation
- Shard redemption (7 shards → MIC)
- Governance participation
- Guardian attestations

## Next Steps

1. Back up this directory to secure location
2. Configure stipend distribution rules
3. Test shard redemption workflow
4. Set up governance voting
5. Create hardware backup of recovery phrase

## Support

For questions: See `specs/civic-ledger/economy/founders-mic-wallets.md`

---

*"Integrity moves. Wallets follow."*
EOF

echo -e "${GREEN}✅ README created${NC}"
echo

# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}📊 FOUNDERS MIC WALLET STRUCTURE COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo
echo "Wallets Created:"
echo "  1. founders-reserve-001"
echo "     Balance: 1,000,000 MIC"
echo "     Status: LOCKED (Ceremonial)"
echo
echo "  2. michael-judan-active-001"
echo "     Balance: 0 MIC"
echo "     Status: ACTIVE (Operational)"
echo
echo "System Summary:"
echo "  Total MIC: 1,000,000"
echo "  Reserve (Locked): 1,000,000"
echo "  Circulating: 0"
echo
echo "Files Created:"
echo "  ${WALLETS_DIR}/founders-reserve-001.json"
echo "  ${WALLETS_DIR}/michael-judan-active-001.json"
echo "  ${MOBIUS_HOME}/audit-log.json"
echo "  ${MOBIUS_HOME}/README.md"
echo
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  - Back up ~/.mobius directory"
echo "  - Keep private keys secure"
echo "  - Ready for stipend distribution"
echo
echo -e "${GREEN}✨ Wallet creation complete!${NC}"
echo "═══════════════════════════════════════════════════════════════"
