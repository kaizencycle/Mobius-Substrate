import { executeEpochTransition } from './transition.js';

(async () => {
  try {
    const result = await executeEpochTransition();
    console.log(JSON.stringify({ ok: true, result }, null, 2));
  } catch (e: any) {
    console.error('[epoch-burn] failed:', e?.message ?? e);
    process.exit(1);
  }
})();
