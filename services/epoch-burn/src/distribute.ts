export type DistributionResult = {
  payouts: number;    // number of recipients paid this run
  perCapita: bigint;  // shards per recipient
};

export async function distributeUBI(perCapita: bigint, recipients: number): Promise<DistributionResult> {
  // TODO: stream payouts; for now, pretend it's done
  return { payouts: recipients, perCapita };
}

