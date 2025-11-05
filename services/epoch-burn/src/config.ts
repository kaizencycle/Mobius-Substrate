import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export type IntegrityConfig = any; // reuse structure loosely

function loadYaml(file: string) {
  const p = path.resolve(process.cwd(), file);
  const raw = fs.readFileSync(p, 'utf8');
  return parse(raw);
}

export const cfg: IntegrityConfig = loadYaml('configs/integrity_units.yaml');

