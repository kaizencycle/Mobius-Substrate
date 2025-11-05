# GIC Migration Guide: v1.0 → v2.0
## Transitioning to Shard-Based Economics

---

**Version:** 1.0.0
**Date:** 2025-11-04
**Status:** Canonical
**Audience:** Existing Holders
**Authors:** ATLAS, HERMES
**License:** CC-BY-SA-4.0

---

## Executive Summary

**What's Changing:**
- Base unit: GIC (float) → Shard (integer)
- Conversion: 1 v1.0 GIC = 1,000,000 v2.0 ₷
- Display: Still shows as GIC (e.g., "1.234567 GIC")
- **Your value**: UNCHANGED (1:1 conversion at shard level)

**Timeline:**
- **Snapshot Date**: 2025-12-01 00:00:00 UTC
- **Transition Period**: 90 days (dual support)
- **v1.0 Sunset**: 2026-03-01 00:00:00 UTC

---

## 1. What You Need to Know

### 1.1 Your Balance Will Not Change in Value

**Example:**
```
v1.0 Balance: 5.123456 GIC
              ↓ (multiply by 1,000,000)
v2.0 Balance: 5,123,456 ₷
Display:      5.123456 GIC (same as before!)
```

**No action required** - conversion happens automatically.

### 1.2 Why This Change?

**Problem Solved**: Precision loss in micro-transactions

```
v1.0: 0.1 + 0.2 = 0.30000000000000004 (rounding error)
v2.0: 100,000₷ + 200,000₷ = 300,000₷ (exact)
```

**Your Benefit**: More accurate accounting, especially for:
- UBI distributions
- Micro-payments
- Automated transactions
- Long-term accumulation

---

## 2. Migration Timeline

### Phase 1: Announcement (Now - Nov 30)
- ✅ Documentation published
- ⏳ Community education
- ⏳ Developer integration guides
- ⏳ UI/UX updates

### Phase 2: Snapshot (Dec 1, 2025)
- **00:00:00 UTC**: All v1.0 balances frozen
- Automatic conversion: balance_v2 = balance_v1 × 1,000,000
- Merkle tree published for verification
- 24-hour review period

### Phase 3: Transition (Dec 2 - Feb 28, 2026)
- **Dual Mode**: Both v1.0 and v2.0 APIs active
- Automatic forwarding: v1.0 requests → v2.0 backend
- Gradual UI migration to shard display
- Developer support available

### Phase 4: Sunset (Mar 1, 2026)
- v1.0 API deprecated
- All traffic on v2.0
- v1.0 balances become read-only (historical)

---

## 3. For Different User Types

### 3.1 Regular Users (Web/Mobile Wallet)

**What You'll See:**
```
Before (v1.0):
┌─────────────────┐
│ Balance         │
│ 5.123456 GIC    │
└─────────────────┘

After (v2.0):
┌─────────────────┐
│ Balance         │
│ 5.123456 GIC    │  ← Same display!
│ 5,123,456 ₷     │  ← New: shard view (optional)
└─────────────────┘
```

**What You Need to Do:**
1. Update app to latest version (automatic)
2. Review balance after Dec 2 (verify 1:1 conversion)
3. That's it!

### 3.2 Developers (API Users)

**API Changes:**

**Before (v1.0):**
```json
GET /balance/0x123
{
  "balance_gic": 5.123456
}
```

**After (v2.0):**
```json
GET /balance/0x123
{
  "balance_shards": "5123456",      // String (BigInt)
  "balance_credits": 5.123456,      // Number (display)
  "balance_credits_formatted": "5.123456 GIC"
}
```

**Required Changes:**
1. Update API client to handle `balance_shards` (string)
2. Use conversion library: `@civic/integrity-units`
3. Store shards internally, convert for display

**Backwards Compatibility:**
- During transition: `balance_gic` field still present
- After Mar 1: `balance_gic` deprecated (use `balance_credits`)

### 3.3 Exchange Operators

**Critical Actions:**

1. **Update Deposit Detection:**
```typescript
// Before
if (tx.amount >= 0.000001) {  // 1 micro-GIC

// After
if (tx.amount_shards >= 1n) {  // 1 shard
```

2. **Update Withdrawal Logic:**
```typescript
// Before
await transfer(user, amount_gic);

// After
import { creditsToShards } from '@civic/integrity-units';
const shards = creditsToShards(amount_gic);
await transfer(user, shards);
```

3. **Balance Migration:**
```sql
-- Multiply all balances by 1,000,000
UPDATE user_balances
SET balance_shards = balance_gic * 1000000;
```

---

## 4. Technical Migration Steps

### 4.1 For Backend Services

**Step 1**: Install new library
```bash
npm install @civic/integrity-units@^0.1.0
```

**Step 2**: Update balance storage
```sql
ALTER TABLE balances ADD COLUMN shards NUMERIC(20,0);
UPDATE balances SET shards = balance * 1000000;
ALTER TABLE balances ALTER COLUMN shards SET NOT NULL;
```

**Step 3**: Update code
```typescript
import { shardsToCredits, creditsToShards } from '@civic/integrity-units';

// Old
const balance = await getBalanceGIC(address);

// New
const balanceShards = await getBalanceShards(address);
const balanceCredits = shardsToCredits(balanceShards);
```

### 4.2 For Frontend Applications

**Step 1**: Update UI library
```bash
npm install @civic/integrity-units@^0.1.0
```

**Step 2**: Add conversion helper
```typescript
// components/BalanceDisplay.tsx
import { shardsToCredits } from '@civic/integrity-units';

export function BalanceDisplay({ shards }: { shards: string }) {
  const credits = shardsToCredits(BigInt(shards));

  return (
    <div className="balance">
      <span className="credits">{credits.toFixed(6)} GIC</span>
      <span className="shards-detail">{BigInt(shards).toLocaleString()} ₷</span>
    </div>
  );
}
```

---

## 5. Verification

### 5.1 Check Your Balance

**After Dec 2, verify:**

```bash
curl https://api.kaizen.cycle/balance/YOUR_ADDRESS

# Should return:
{
  "balance_shards": "YOUR_BALANCE_×_1000000",
  "balance_credits": YOUR_ORIGINAL_BALANCE
}
```

**Example:**
```bash
# Before (v1.0)
curl https://api.kaizen.cycle/balance/0x123
{"balance_gic": 5.123456}

# After (v2.0)
curl https://api.kaizen.cycle/balance/0x123
{
  "balance_shards": "5123456",
  "balance_credits": 5.123456
}

# Verification:
# 5123456 ÷ 1000000 = 5.123456 ✓
```

---

## 6. FAQ

### Q1: Will my balance value change?

**A**: No. 1 v1.0 GIC = 1 v2.0 GIC (displayed). The only change is internal precision.

### Q2: Do I need to claim my v2.0 balance?

**A**: No. Conversion is automatic. Your balance will be available Dec 2.

### Q3: What if I don't update my app?

**A**: v1.0 API will continue working until Mar 1, 2026. But we recommend updating ASAP for best experience.

### Q4: Can I keep using v1.0 after Mar 1?

**A**: No. v1.0 API will be disabled. Balances become read-only.

### Q5: What about pending transactions during snapshot?

**A**: All transactions freeze at 23:59:59 UTC Nov 30. They'll resume at 00:00:01 UTC Dec 2 in v2.0 format.

### Q6: Will my UBI change?

**A**: Displayed UBI amount stays the same (e.g., "0.04 GIC"), but internal calculation becomes more precise.

### Q7: What if I find a discrepancy?

**A**: Email migration-support@kaizen.cycle with:
- Your address
- Expected v1.0 balance
- Actual v2.0 balance

---

## 7. Support Resources

### 7.1 Documentation
- [Shard Protocol Spec](../specs/shard_protocol_v1.md)
- [GIC Whitepaper v2.0](./GIC_Whitepaper_v2.0.md)
- [API Migration Guide](https://docs.kaizen.cycle/migration)

### 7.2 Developer Tools
- `@civic/integrity-units` npm package
- Migration test suite
- Balance verification tool

### 7.3 Contact
- **General Questions**: help@kaizen.cycle
- **Technical Support**: dev-support@kaizen.cycle
- **Migration Issues**: migration-support@kaizen.cycle
- **Emergency**: urgent@kaizen.cycle (24/7)

### 7.4 Community
- Discord: #migration-help
- Forum: https://forum.kaizen.cycle/migration
- Office Hours: Tuesdays 2PM UTC

---

## 8. Appendix: Code Examples

### A. TypeScript Conversion

```typescript
import { shardsToCredits, creditsToShards } from '@civic/integrity-units';

// Display user balance
function displayBalance(shards: bigint): string {
  const credits = shardsToCredits(shards);
  return `${credits.toFixed(6)} GIC`;
}

// Process user input
function parseUserInput(input: string): bigint {
  const credits = Number(input);
  return creditsToShards(credits);
}
```

### B. SQL Migration Script

```sql
-- Step 1: Add new column
ALTER TABLE balances ADD COLUMN shards NUMERIC(20,0);

-- Step 2: Migrate data
UPDATE balances SET shards = balance_gic * 1000000;

-- Step 3: Validate
SELECT address, balance_gic, shards,
       (shards / 1000000.0) as recalc_gic
FROM balances
WHERE ABS(balance_gic - (shards / 1000000.0)) > 0.000001;
-- Should return 0 rows

-- Step 4: Make not-null
ALTER TABLE balances ALTER COLUMN shards SET NOT NULL;
```

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
**Status**: Canonical
**License**: CC-BY-SA-4.0

*"Precision in transition; continuity in value."*
