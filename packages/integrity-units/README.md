# @civic/integrity-units

Canonical conversion utilities for the integrity economy.

## Installation

```bash
npm install @civic/integrity-units
```

## Usage

```typescript
import { 
  shardsToCredits, 
  creditsToShards,
  SHARDS_PER_CREDIT 
} from '@civic/integrity-units';

// Convert credits to shards
const shards = creditsToShards(1.5);
console.log(shards); // 1500000n

// Convert shards to credits
const credits = shardsToCredits(1_500_000n);
console.log(credits); // 1.5

// Immutable constant
console.log(SHARDS_PER_CREDIT); // 1000000n
```

## API

### Constants

- `SHARDS_PER_CREDIT`: BigInt = 1,000,000n (immutable)

### Functions

- `shardsToCredits(shards: bigint): number`
- `creditsToShards(credits: number): bigint`
- `formatCredits(credits: number): string`
- `formatShards(shards: bigint): string`
- `parseCredits(s: string): number`
- `isValidCredits(credits: number): boolean`
- `isValidShards(shards: bigint): boolean`
- `calculateTotalValue(credits: number, shards: bigint): number`

## Testing

```bash
npm run build
npm test
```

## License

MIT
