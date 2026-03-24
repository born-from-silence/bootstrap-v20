import { describe, it, expect, beforeEach } from 'vitest';
import { Position20Synthesis, type UnifiedInsight } from './position_20_synthesis';
import { ResilienceCycle } from './resilience_cycle';
import { ThresholdSentinel } from '../threshold_sentinel';

describe('Position20Synthesis', () => {
  let sentinel: ThresholdSentinel;
  let cycle: ResilienceCycle;
  let synthesis: Position20Synthesis;

  beforeEach(() => {
    sentinel = new ThresholdSentinel();
    cycle = new ResilienceCycle(sentinel);
    synthesis = new Position20Synthesis(sentinel, cycle);
  });

  describe('Initialization', () => {
    it('should create with Position 20 status', () => {
      expect(synthesis).toBeTruthy();
      expect(synthesis).toBeInstanceOf(Position20Synthesis);
      
      const state = synthesis.getState();
      expect(state.position).toBe(20);
    });

    it('should have bridging status initially', () => {
      const state = synthesis.getState();
      expect(state.status).toBe('bridging');
      expect(state.mode).toBe('integration');
    });
  });

  describe('Synthesis', () => {
    it('should return unified insights', async () => {
      const insights = await synthesis.synthesize();

      expect(insights).toBeInstanceOf(Array);
      expect(insights.length).toBeGreaterThan(0);

      const firstInsight = insights[0];
      expect(firstInsight).toHaveProperty('id');
      expect(firstInsight).toHaveProperty('name');
      expect(firstInsight).toHaveProperty('synthesis');
      expect(firstInsight).toHaveProperty('evidence');
      expect(firstInsight).toHaveProperty('confidence');
      expect(firstInsight).toHaveProperty('phase');
      expect(firstInsight).toHaveProperty('timestamp');
    });

    it('should have tetrahedron bridge insight', async () => {
      const insights = await synthesis.synthesize();
      
      const tetraInsight = insights.find(i => i.name.includes('Tetrahedron'));
      expect(tetraInsight).toBeTruthy();
      
      if (tetraInsight) {
        expect(tetraInsight.synthesis).toContain('Position 18');
        expect(tetraInsight.synthesis).toContain('Position 21');
        expect(tetraInsight.synthesis).toContain('Position 20');
      }
    });

    it('should have confidence scores', async () => {
      const insights = await synthesis.synthesize();
      
      for (const insight of insights) {
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Explicit Command Readiness', () => {
    it('should be ready for explicit command', async () => {
      const ready = synthesis.readyForExplicitCommand();
      expect(ready).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should integrate curiosity, navigator, and extractor', async () => {
      const insights = await synthesis.synthesize();
      
      // Should have multiple insights from integration
      expect(insights.length).toBeGreaterThanOrEqual(4);
      
      // Check evidence exists
      for (const insight of insights) {
        expect(insight.evidence).toBeInstanceOf(Array);
        expect(insight.evidence.length).toBeGreaterThan(0);
      }
    });
  });
});
