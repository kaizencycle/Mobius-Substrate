import { config } from '../config';
import type { GiSnapshot } from '../services/giSnapshot';
import { recordIntegritySnapshot, recordSafeMode } from '../metrics';

type IntegrityState = {
  snapshot: GiSnapshot | null;
  updatedAt: number | null;
};

const state: IntegrityState = {
  snapshot: null,
  updatedAt: null,
};

let safeModeFlag = config.safeModeDefault;

export function updateIntegritySnapshot(snapshot: GiSnapshot): void {
  state.snapshot = snapshot;
  state.updatedAt = Date.now();
  recordIntegritySnapshot(snapshot, config.miiThreshold);
}

export function getIntegritySnapshot(): GiSnapshot | null {
  return state.snapshot;
}

export function getIntegrityState(): IntegrityState {
  return { ...state };
}

export function setSafeModeEnabled(enabled: boolean): void {
  safeModeFlag = enabled;
  recordSafeMode(enabled);
}

export function isSafeModeEnabled(): boolean {
  return safeModeFlag;
}
