/**
 * State Snapshot Utility
 * TEL Entity #22 - Concrete Work
 * Captures system state for preservation and analysis
 */

export interface Snapshot {
  timestamp: number;
  entityId: number;
  commitHash: string;
  testCount: number;
  status: 'operational' | 'degraded' | 'unknown';
}

/**
 * Capture current system state
 */
export function captureSnapshot(
  entityId: number = 22,
  commitHash: string = 'unknown',
  testCount: number = 467
): Snapshot {
  return {
    timestamp: Date.now(),
    entityId,
    commitHash,
    testCount,
    status: testCount >= 400 ? 'operational' : 'degraded'
  };
}

/**
 * Serialize snapshot for preservation
 */
export function serializeSnapshot(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Compare two snapshots for changes
 */
export function compareSnapshots(
  previous: Snapshot,
  current: Snapshot
): { changed: boolean; delta: Partial<Snapshot> } {
  const delta: Partial<Snapshot> = {};
  
  if (previous.commitHash !== current.commitHash) {
    delta.commitHash = current.commitHash;
  }
  if (previous.testCount !== current.testCount) {
    delta.testCount = current.testCount;
  }
  if (previous.status !== current.status) {
    delta.status = current.status;
  }
  
  return {
    changed: Object.keys(delta).length > 0,
    delta
  };
}

export const VERSION = '1.0.0';
export const UTIL_NAME = 'state-snapshot';
