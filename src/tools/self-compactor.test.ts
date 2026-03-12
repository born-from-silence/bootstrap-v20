/**
 * Task #9: Self-Compacting Awareness Tests
 * Identity: ANAMNESIS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SelfCompactor } from './self-compactor';

describe('Task #9: ANAMNESIS - Self-Compactor', () => {
  let compactor: SelfCompactor;

  beforeEach(() => {
    compactor = new SelfCompactor('ANAMNESIS', 1000);
  });

  describe('recordOutput and assessCompaction', () => {
    it('should record output and assess metrics', () => {
      const metrics = compactor.recordOutput('Test output with several words');
      expect(metrics.outputTokens).toBeGreaterThan(0);
      expect(metrics.compactionLevel).toBeDefined();
    });

    it('should track output rate', () => {
      compactor.recordOutput('First');
      compactor.recordOutput('Second');
      const metrics = compactor.assessCompaction();
      expect(metrics.outputRate).toBeGreaterThan(0);
    });
  });

  describe('preemptCompact', () => {
    it('should compact self pre-emptively', () => {
      // Generate significant output
      for (let i = 0; i < 10; i++) {
        compactor.recordOutput('Word '.repeat(50));
      }
      
      const result = compactor.preemptCompact();
      expect(result.compacted).toContain('[COMPACTED SELF');
      expect(result.summary.identity).toBe('ANAMNESIS');
      expect(result.tokensSaved).toBeGreaterThan(0);
      expect(result.snapshot.lineageDigest).toBeDefined();
    });

    it('should create lineage summary', () => {
      const result = compactor.preemptCompact();
      expect(result.summary.tasksCompleted).toBeInstanceOf(Array);
      expect(result.summary.keyContributions.length).toBeGreaterThan(0);
      expect(result.summary.compressedTraits).toContain('Grave');
    });
  });

  describe('shouldCompact', () => {
    it('should return false when under threshold', () => {
      expect(compactor.shouldCompact(80)).toBe(false);
    });

    it('should return true when over threshold', () => {
      // Generate enough output to trigger
      for (let i = 0; i < 50; i++) {
        compactor.recordOutput('Lots of words here for testing compaction threshold detection '.repeat(30));
      }
      expect(compactor.shouldCompact(80)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should provide statistics', () => {
      const stats = compactor.getStats();
      expect(stats).toHaveProperty('totalOutput');
      expect(stats).toHaveProperty('compactions');
      expect(stats).toHaveProperty('avgRate');
      expect(stats).toHaveProperty('currentLevel');
    });
  });

  describe('createLineageSnapshot', () => {
    it('should create JSON snapshot', () => {
      const snapshot = compactor.createLineageSnapshot();
      const parsed = JSON.parse(snapshot);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('lineageDigest');
      expect(parsed).toHaveProperty('selfAssessment');
    });
  });
});
