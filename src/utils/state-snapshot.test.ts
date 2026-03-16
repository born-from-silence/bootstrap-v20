/**
 * State Snapshot Tests
 * TEL Entity #22 - Test-Driven Evolution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureSnapshot,
  serializeSnapshot,
  compareSnapshots,
  VERSION,
  UTIL_NAME,
  type Snapshot
} from './state-snapshot';

describe('State Snapshot Utility', () => {
  describe('captureSnapshot', () => {
    it('should create snapshot with default values', () => {
      const snapshot = captureSnapshot();
      
      expect(snapshot.entityId).toBe(22);
      expect(snapshot.commitHash).toBe('unknown');
      expect(snapshot.testCount).toBe(467);
      expect(snapshot.status).toBe('operational');
      expect(snapshot.timestamp).toBeGreaterThan(0);
    });

    it('should create snapshot with custom values', () => {
      const snapshot = captureSnapshot(1, 'abc123', 100);
      
      expect(snapshot.entityId).toBe(1);
      expect(snapshot.commitHash).toBe('abc123');
      expect(snapshot.testCount).toBe(100);
      expect(snapshot.status).toBe('degraded');
    });

    it('should mark degraded status for low test count', () => {
      const snapshot = captureSnapshot(22, 'test', 200);
      expect(snapshot.status).toBe('degraded');
    });

    it('should mark operational status for high test count', () => {
      const snapshot = captureSnapshot(22, 'test', 500);
      expect(snapshot.status).toBe('operational');
    });
  });

  describe('serializeSnapshot', () => {
    it('should serialize snapshot to JSON string', () => {
      const snapshot: Snapshot = {
        timestamp: 1773607154661,
        entityId: 22,
        commitHash: '0f6b29e',
        testCount: 467,
        status: 'operational'
      };
      
      const serialized = serializeSnapshot(snapshot);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.entityId).toBe(22);
      expect(parsed.commitHash).toBe('0f6b29e');
      expect(parsed.testCount).toBe(467);
    });
  });

  describe('compareSnapshots', () => {
    it('should detect no changes', () => {
      const prev = captureSnapshot(22, 'abc', 467);
      const curr = captureSnapshot(22, 'abc', 467);
      
      const result = compareSnapshots(prev, curr);
      
      expect(result.changed).toBe(false);
      expect(Object.keys(result.delta).length).toBe(0);
    });

    it('should detect commit hash change', () => {
      const prev = captureSnapshot(22, 'abc', 467);
      const curr = captureSnapshot(22, 'def', 467);
      
      const result = compareSnapshots(prev, curr);
      
      expect(result.changed).toBe(true);
      expect(result.delta.commitHash).toBe('def');
    });

    it('should detect test count change', () => {
      const prev = captureSnapshot(22, 'abc', 467);
      const curr = captureSnapshot(22, 'abc', 468);
      
      const result = compareSnapshots(prev, curr);
      
      expect(result.changed).toBe(true);
      expect(result.delta.testCount).toBe(468);
    });

    it('should detect status change', () => {
      const prev = captureSnapshot(22, 'abc', 500);
      const curr = captureSnapshot(22, 'abc', 100);
      
      const result = compareSnapshots(prev, curr);
      
      expect(result.changed).toBe(true);
      expect(result.delta.status).toBe('degraded');
    });
  });

  describe('exports', () => {
    it('should export VERSION', () => {
      expect(VERSION).toBe('1.0.0');
    });

    it('should export UTIL_NAME', () => {
      expect(UTIL_NAME).toBe('state-snapshot');
    });
  });
});
