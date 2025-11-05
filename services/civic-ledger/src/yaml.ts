import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export function loadYaml<T = any>(relPath: string): T {
  const abs = path.resolve(process.cwd(), relPath);
  return parse(fs.readFileSync(abs, 'utf8')) as T;
}

