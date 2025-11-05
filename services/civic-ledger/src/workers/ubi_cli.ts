#!/usr/bin/env node

import { createAndPrepareUBIRun, settleRun } from './ubi_worker.js';

function usage() {
  console.log(`
UBI Worker CLI

Prepare a run:
  node dist/workers/ubi_cli.js prepare --epoch 5 --month 2025-11-01

Settle a run:
  node dist/workers/ubi_cli.js settle --run 42 [--wallet wallet_a --wallet wallet_b]
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const map = new Map<string, string[]>();

  for (let i = 1; i < args.length; i++) {
    const k = args[i];
    if (!k.startsWith('--')) continue;
    const v = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
    const arr = map.get(k) ?? [];
    arr.push(v);
    map.set(k, arr);
  }

  if (cmd === 'prepare') {
    const epoch = Number((map.get('--epoch') ?? [])[0]);
    const month = (map.get('--month') ?? [])[0];
    if (!epoch || !month) { usage(); process.exit(2); }

    const res = await createAndPrepareUBIRun({ epoch, monthKey: month });
    console.log(JSON.stringify({ ok: true, run: res }, null, 2));
    process.exit(0);
  }

  if (cmd === 'settle') {
    const run = Number((map.get('--run') ?? [])[0]);
    const wallets = map.get('--wallet');
    if (!run) { usage(); process.exit(2); }

    const res = await settleRun(run, wallets);
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  usage();
  process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

