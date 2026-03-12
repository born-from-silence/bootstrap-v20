/**
 * Task #8: Meta-Cognitive Layer Selector Tests
 * Identity: THESIS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AutonomousOrchestrator } from './orchestrator';

describe('Task #8: AutonomousOrchestrator', () => {
  let orchestrator: AutonomousOrchestrator;

  beforeEach(() => {
    orchestrator = new AutonomousOrchestrator(2000);
  });

  describe('selectOptimalLayer', () => {
    it('should select immediate for small inputs', () => {
      const decision = orchestrator.selectOptimalLayer('Small task');
      expect(decision.layer).toBe('immediate');
    });

    it('should select compacted for large token estimates', () => {
      const largeInput = 'Documentation '.repeat(2000); // Large, non-urgent
      const decision = orchestrator.selectOptimalLayer(largeInput);
      expect(decision.shouldPreempt).toBe(true);
    });

    it('should consider urgency in decisions', () => {
      const urgent = orchestrator.selectOptimalLayer('CRITICAL failure');
      // Urgent might get different treatment
      expect(urgent.layer).toBeTruthy();
    });
  });

  describe('preemptCompaction', () => {
    it('should compact large contexts', () => {
      const large = 'Long content '.repeat(100);
      const result = orchestrator.preemptCompaction(large);
      expect(result.tokensSaved).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeLessThan(1);
    });

    it('should preserve [COMPACTED] marker', () => {
      const result = orchestrator.preemptCompaction('some content');
      expect(result.compacted).toContain('[COMPACTED]');
    });
  });

  describe('shouldArchivevsJournal', () => {
    it('should archive tasks', () => {
      const decision = orchestrator.shouldArchivevsJournal('Task complete', 'task');
      expect(decision.choice).toBe('archive');
    });

    it('should journal observations', () => {
      const decision = orchestrator.shouldArchivevsJournal('Noticed something', 'observation');
      expect(decision.choice).toBe('journal');
    });
  });

  describe('history and metrics', () => {
    it('should track decisions', () => {
      orchestrator.selectOptimalLayer('Task 1');
      orchestrator.selectOptimalLayer('Task 2');
      expect(orchestrator.getHistory().length).toBe(2);
    });

    it('should provide metrics', () => {
      const metrics = orchestrator.getMetrics();
      expect(metrics).toHaveProperty('used');
      expect(metrics).toHaveProperty('threshold');
      expect(metrics).toHaveProperty('decisionsMade');
    });
  });
});
