import { computeReward } from './computeReward';
import { fetchLedgerActivities, writeRewardAttestation } from './ledgerClient';
import type { NodeActivity } from './schema';

export async function runPayoutCron() {
  const activities = await fetchLedgerActivities();
  const results = activities.map(activity =>
    computeReward(activity, {
      sentinelCount: activity.sentinelCount,
      isNewKnowledge: activity.isNewKnowledge,
      correctedDrift: activity.correctedDrift
    })
  );

  for (const result of results) {
    await writeRewardAttestation(result);
  }

  return results;
}

if (require.main === module) {
  runPayoutCron()
    .then(results => {
      console.log(`[tokenomics-engine] Processed ${results.length} reward entries`);
    })
    .catch(error => {
      console.error('[tokenomics-engine] Payout cron failed:', error);
      process.exitCode = 1;
    });
}
