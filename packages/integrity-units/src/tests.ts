import { strict as assert } from "node:assert";
import { 
  SHARDS_PER_CREDIT, 
  shardsToCredits, 
  creditsToShards,
  formatCredits,
  formatShards,
  parseCredits,
  isValidCredits,
  isValidShards,
  calculateTotalValue
} from "./index.js";

// Test constant
assert.equal(Number(SHARDS_PER_CREDIT), 1_000_000);

// Test conversions
assert.equal(creditsToShards(1.0), 1_000_000n);
assert.equal(creditsToShards(0.000001), 1n);
assert.equal(creditsToShards(1.5), 1_500_000n);
assert.equal(shardsToCredits(1_000_000n), 1.0);
assert.ok(Math.abs(shardsToCredits(345_678n) - 0.345678) < 1e-12);
assert.ok(Math.abs(shardsToCredits(1_500_000n) - 1.5) < 1e-12);

// Test round-trip
const testCredits = 12.345678;
const asShards = creditsToShards(testCredits);
const backToCredits = shardsToCredits(asShards);
assert.ok(Math.abs(testCredits - backToCredits) < 1e-6);

// Test formatting
assert.equal(formatCredits(1.5), "1.500000");
assert.equal(formatShards(1_500_000n), "1500000");

// Test parsing
assert.equal(parseCredits("1.5"), 1.5);
assert.equal(parseCredits("0.000001"), 0.000001);

// Test validation
assert.ok(isValidCredits(1.5));
assert.ok(!isValidCredits(-1));
assert.ok(!isValidCredits(NaN));
assert.ok(isValidShards(1_000_000n));
assert.ok(!isValidShards(-1n));

// Test total value calculation
assert.equal(calculateTotalValue(10, 500_000n), 10.5);

// Test error cases
try {
  creditsToShards(-1);
  assert.fail("Should throw for negative credits");
} catch (e: any) {
  assert.ok(e.message.includes("invalid credits"));
}

try {
  parseCredits("invalid");
  assert.fail("Should throw for invalid string");
} catch (e: any) {
  assert.ok(e.message.includes("invalid credit string"));
}

console.log("✅ integrity-units tests: OK");
