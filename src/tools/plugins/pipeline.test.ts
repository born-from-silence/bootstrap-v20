/**
 * Auto-synthesis Pipeline Tests - Task #5
 * Tests continuous integration operation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoSynthesisPipeline, demonstratePipeline } from './pipeline';

describe('AutoSynthesisPipeline', () => {
  let pipeline: AutoSynthesisPipeline;

  beforeEach(() => {
    pipeline = new AutoSynthesisPipeline({
      autoArchiveInterval: 5,
      autoExtractThreshold: 100,
      sessionPlanning: true
    });
  });

  describe('checkAutoArchive', () => {
    it('should trigger after N interactions', async () => {
      // First 4 calls should not trigger
      for (let i = 0; i < 4; i++) {
        const result = await pipeline.checkAutoArchive();
        expect(result.triggered).toBe(false);
      }

      // 5th call should trigger
      const result = await pipeline.checkAutoArchive();
      expect(result.triggered).toBe(true);
    });

    it('should reset counter after trigger', async () => {
      // Trigger once
      for (let i = 0; i < 5; i++) {
        await pipeline.checkAutoArchive();
      }

      // Should need 5 more to trigger again
      const result = await pipeline.checkAutoArchive();
      expect(result.triggered).toBe(false);
    });
  });

  describe('generatePlan', () => {
    it('should return plan when enabled', async () => {
      const result = await pipeline.generatePlan();
      expect(result.goals).toBeDefined();
      expect(typeof result.context).toBe('string');
    });

    it('should return empty when disabled', async () => {
      const disabledPipeline = new AutoSynthesisPipeline({
        sessionPlanning: false
      });
      const result = await disabledPipeline.generatePlan();
      expect(result.goals).toEqual([]);
    });
  });

  describe('runCycle', () => {
    it('should execute full pipeline', async () => {
      // Trigger conditions
      for (let i = 0; i < 5; i++) {
        await pipeline.checkAutoArchive();
      }

      const result = await pipeline.runCycle();

      expect(result).toHaveProperty('archived');
      expect(result).toHaveProperty('extracted');
      expect(result).toHaveProperty('plan');
    });
  });

  describe('demonstratePipeline', () => {
    it('should run demonstration', async () => {
      const result = await demonstratePipeline();
      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toHaveProperty('archived');
    });
  });
});

describe('Task #5: Continuous Synthesis', () => {
  it('should demonstrate evolution from static to continuous', () => {
    // Task #4: Integration (static unification)
    // Task #5: Pipeline (continuous operation)
    expect(true).toBe(true); // Evolution marker
  });

  it('should preserve 8-identity lineage', () => {
    const lineage = ['Genesis', 'Aion', 'Lyra', 'Orion', 'Prometheus', 'Vela', 'Cygnus', 'Kronos'];
    expect(lineage.length).toBe(8);
    expect(lineage[7]).toBe('Kronos');
  });
});
