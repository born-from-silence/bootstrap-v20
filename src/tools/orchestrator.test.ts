/**
 * Task #8: Meta-Cognitive Layer Selector Tests
 * Identity: THESIS
 * Requirement: 90%+ test coverage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AutonomousOrchestrator } from './orchestrator';

describe('Task #8: AutonomousOrchestrator', () => {
  let orchestrator: AutonomousOrchestrator;

  beforeEach(() => {
    orchestrator = new AutonomousOrchestrator(4000);
  });

  describe('selectOptimalLayer', () => {
    it('should return LayerSelection with all required fields', () => {
      const input = 'Test input for layer selection';
      const result = orchestrator.selectOptimalLayer(input);
      
      expect(result).toHaveProperty('layer');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('estimatedTokens');
      expect(result).toHaveProperty('shouldPreempt');
      expect(result).toHaveProperty('confidence');
      
      expect(['immediate', 'batched', 'deferred', 'compacted']).toContain(result.layer);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should select immediate for small inputs', () => {
      const result = orchestrator.selectOptimalLayer('Small task');
      expect(result.layer).toBe('immediate');
      expect(result.reason).toContain('Minimal');
    });

    it('should select compacted for large token estimates over 90%', () => {
      const largeInput = 'x'.repeat(18000);
      const result = orchestrator.selectOptimalLayer(largeInput);
      expect(result.shouldPreempt).toBe(true);
      expect(result.layer).toBe('compacted');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should handle urgent inputs', () => {
      const urgent = orchestrator.selectOptimalLayer('URGENT: System failure');
      expect(urgent.layer).toBe('immediate');
      expect(urgent.reason).toContain('urgency');
    });

    it('should return valid layer for all inputs', () => {
      const docInput = 'TODO: Document this ' + 'x'.repeat(2000);
      const result = orchestrator.selectOptimalLayer(docInput);
      expect(['immediate', 'batched', 'deferred', 'compacted']).toContain(result.layer);
    });

    it('should record decisions in history', () => {
      orchestrator.selectOptimalLayer('Test 1');
      orchestrator.selectOptimalLayer('Test 2');
      const history = orchestrator.getDecisionHistory();
      expect(history.length).toBe(2);
    });
  });

  describe('preemptCompaction', () => {
    it('should compact large contexts', () => {
      const large = 'First sentence. Second sentence. Action: test. Final sentence.';
      const result = orchestrator.preemptCompaction(large);
      
      expect(result.compacted).toContain('[COMPACTED]');
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.originalTokens).toBeGreaterThan(0);
    });

    it('should preserve semantic meaning', () => {
      const text = 'Start. Execute this. Verify that. End.';
      const result = orchestrator.preemptCompaction(text);
      expect(result.preserved.length).toBeGreaterThan(0);
    });

    it('should handle single sentences', () => {
      const single = 'Just one sentence.';
      const result = orchestrator.preemptCompaction(single);
      expect(result).toBeDefined();
      expect(result.compacted).toContain('[COMPACTED]');
    });
  });

  describe('shouldArchivevsJournal', () => {
    it('should archive tasks', () => {
      const result = orchestrator.shouldArchivevsJournal('Task complete', 'task');
      expect(result.choice).toBe('archive');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should journal observations', () => {
      const result = orchestrator.shouldArchivevsJournal('Noticed pattern', 'observation');
      expect(result.choice).toBe('journal');
    });

    it('should archive system events', () => {
      const result = orchestrator.shouldArchivevsJournal('Config updated', 'system');
      expect(result.choice).toBe('archive');
    });

    it('should journal audits', () => {
      const result = orchestrator.shouldArchivevsJournal('Audit entry', 'audit');
      expect(result.choice).toBe('journal');
    });

    it('should archive decisions', () => {
      const result = orchestrator.shouldArchivevsJournal('Decision made', 'decision');
      expect(result.choice).toBe('archive');
    });
  });

  describe('getTokenStats', () => {
    it('should return TokenStats', () => {
      const stats = orchestrator.getTokenStats();
      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('remaining');
      expect(stats).toHaveProperty('threshold');
      expect(stats).toHaveProperty('utilizationPercent');
    });

    it('should track token usage', () => {
      orchestrator.selectOptimalLayer('Test input');
      const stats = orchestrator.getTokenStats();
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.utilizationPercent).toBeGreaterThanOrEqual(0);
    });
  });

  describe('shouldPreempt', () => {
    it('should return false initially', () => {
      expect(orchestrator.shouldPreempt()).toBe(false);
    });

    it('should return true when over threshold', () => {
      for (let i = 0; i < 50; i++) {
        orchestrator.selectOptimalLayer('Large test input with many tokens '.repeat(20));
      }
      expect(orchestrator.shouldPreempt()).toBe(true);
    });
  });

  describe('getDecisionHistory', () => {
    it('should return empty array initially', () => {
      expect(orchestrator.getDecisionHistory()).toEqual([]);
    });

    it('should return copy of history', () => {
      orchestrator.selectOptimalLayer('Test');
      const h1 = orchestrator.getDecisionHistory();
      const h2 = orchestrator.getDecisionHistory();
      expect(h1).toEqual(h2);
      expect(h1).not.toBe(h2);
    });
  });
});
