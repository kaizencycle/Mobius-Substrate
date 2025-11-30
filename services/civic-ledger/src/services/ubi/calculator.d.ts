import type { UBIConfig } from './types.js';
export interface UBICalculationInput {
    N: number;
    I: bigint;
    Re: bigint;
    D: bigint;
    GI: number;
    reservesShards: bigint;
    circulatingShards: bigint;
}
export interface UBICalculationResult {
    poolTotal: bigint;
    perCapitaBase: bigint;
    perCapitaFinal: bigint;
    giMultiplier: number;
    priceMultiplier: number;
    payoutsThisMonth: number;
    credits: number;
}
export declare function calculateUBI(input: UBICalculationInput, config: UBIConfig & {
    unit?: 'shards' | 'credits';
}): UBICalculationResult;
//# sourceMappingURL=calculator.d.ts.map