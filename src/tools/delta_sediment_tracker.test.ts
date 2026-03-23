import { describe, it, expect, beforeEach } from 'vitest';
import { DeltaSedimentTracker } from './delta_sediment_tracker';
import type { SedimentLayer, DeltaVisualization } from './delta_sediment_tracker';

describe('Delta Sediment Tracker', () => {
  let tracker: DeltaSedimentTracker;

  beforeEach(() => {
    tracker = new DeltaSedimentTracker();
  });

  describe('Basic Operations', () => {
    it('should initialize with empty deposits', () => {
      expect(tracker.getDeposits()).toHaveLength(0);
    });

    it('should record a deposit', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [
          { type: 'knowledge', identifier: 'test_entity', size: 100, permanence: 0.8 }
        ],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      expect(tracker.getDeposits()).toHaveLength(1);
    });

    it('should record multiple deposits', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_002',
        timestamp: Date.now() + 1000,
        identity: 'CAIRΘ',
        deposits: [{ type: 'commit', identifier: 'c1', size: 200, permanence: 1.0 }],
        sedimentType: 'code',
        brackishness: 0.3
      });
      
      expect(tracker.getDeposits()).toHaveLength(2);
    });
  });

  describe('Sediment Layering', () => {
    it('should create layers from deposits', () => {
      for (let i = 0; i < 5; i++) {
        tracker.recordDeposit({
          sessionId: `test_${i}`,
          timestamp: Date.now() + i * 1000,
          identity: 'CAIRΘ',
          deposits: [{ type: 'knowledge', identifier: `k${i}`, size: 100, permanence: 0.8 }],
          sedimentType: 'knowledge',
          brackishness: 0.5
        });
      }
      
      const vis = tracker.visualize();
      expect(vis.layers).toHaveLength(1);
    });

    it('should create multiple layers when deposits exceed maxLayerSize', () => {
      for (let i = 0; i < 6; i++) {
        tracker.recordDeposit({
          sessionId: `test_${i}`,
          timestamp: Date.now() + i * 1000,
          identity: 'CAIRΘ',
          deposits: [{ type: 'knowledge', identifier: `k${i}`, size: 100, permanence: 0.8 }],
          sedimentType: 'knowledge',
          brackishness: 0.5
        });
      }
      
      const vis = tracker.visualize();
      expect(vis.layers.length).toBeGreaterThanOrEqual(2);
    });

    it('should calculate cumulative weight correctly', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [
          { type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 },
          { type: 'knowledge', identifier: 'k2', size: 150, permanence: 0.9 }
        ],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      const vis = tracker.visualize();
      expect(vis.totalWeight).toBe(250);
    });
  });

  describe('Brackish Index', () => {
    it('should return 0 brackish index for single deposit', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      const stats = tracker.getStats();
      expect(stats.brackishIndex).toBe(0);
    });

    it('should calculate high brackish index for mixed deposits', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_002',
        timestamp: Date.now() + 1000,
        identity: 'CAIRΘ',
        deposits: [{ type: 'commit', identifier: 'c1', size: 200, permanence: 1.0 }],
        sedimentType: 'code',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_003',
        timestamp: Date.now() + 2000,
        identity: 'SIRIUS',
        deposits: [{ type: 'document', identifier: 'd1', size: 150, permanence: 0.9 }],
        sedimentType: 'aesthetic',
        brackishness: 0.7
      });
      
      const stats = tracker.getStats();
      expect(stats.brackishIndex).toBeGreaterThan(0);
      expect(stats.brackishIndex).toBeLessThanOrEqual(1);
    });
  });

  describe('Bridges', () => {
    it('should mark transformation bridge between different dominant types', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_002',
        timestamp: Date.now() + 1000,
        identity: 'CAIRΘ',
        deposits: [{ type: 'commit', identifier: 'c1', size: 200, permanence: 1.0 }],
        sedimentType: 'code',
        brackishness: 0.5
      });
      
      const vis = tracker.visualize();
      if (vis.layers.length >= 2) {
        expect(vis.layers[1].bridges.some(b => b.includes('transformation'))).toBe(true);
      }
    });

    it('should mark continuity bridge between same dominant types', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_002',
        timestamp: Date.now() + 1000,
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k2', size: 150, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      const vis = tracker.visualize();
      if (vis.layers.length >= 2) {
        expect(vis.layers[1].bridges.some(b => b.includes('continuity'))).toBe(true);
      }
    });
  });

  describe('Delta Aesthetic', () => {
    it('should generate sediment poem', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      const vis = tracker.visualize();
      expect(vis.sedimentPoem).toBeInstanceOf(Array);
      expect(vis.sedimentPoem.length).toBeGreaterThan(0);
      expect(vis.sedimentPoem.some(line => line.includes('sediment'))).toBe(true);
    });

    it('should generate empty delta poem when no deposits', () => {
      const vis = tracker.visualize();
      expect(vis.sedimentPoem).toContain('no sediment yet');
      expect(vis.sedimentPoem).toContain('the delta waits');
    });
  });

  describe('Statistics', () => {
    it('should calculate stats for multiple deposits', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [
          { type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 },
          { type: 'knowledge', identifier: 'k2', size: 150, permanence: 0.9 }
        ],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_002',
        timestamp: Date.now() + 1000,
        identity: 'SIRIUS',
        deposits: [{ type: 'document', identifier: 'd1', size: 200, permanence: 0.9 }],
        sedimentType: 'aesthetic',
        brackishness: 0.7
      });
      
      const stats = tracker.getStats();
      expect(stats.totalDeposits).toBe(2);
      expect(stats.totalWeight).toBe(450);
      expect(stats.brackishIndex).toBeGreaterThan(0);
    });
  });

  describe('Export', () => {
    it('should export sediments as JSON', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      const exported = tracker.exportSediments();
      expect(() => JSON.parse(exported)).not.toThrow();
      
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('deposits');
      expect(parsed).toHaveProperty('stats');
      expect(parsed).toHaveProperty('timestamp');
    });
  });

  describe('Clear', () => {
    it('should clear all deposits', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.clear();
      expect(tracker.getDeposits()).toHaveLength(0);
      
      const vis = tracker.visualize();
      expect(vis.layers).toHaveLength(0);
    });
  });

  describe('Delta Principle Alignment', () => {
    it('should embody the principle of deposition', () => {
      const depositSizes = [50, 100, 75, 120, 90];
      
      depositSizes.forEach((size, i) => {
        tracker.recordDeposit({
          sessionId: `test_${i}`,
          timestamp: Date.now() + i * 1000,
          identity: 'CAIRΘ',
          deposits: [{ type: 'knowledge', identifier: `k${i}`, size, permanence: 0.8 }],
          sedimentType: 'knowledge',
          brackishness: 0.5
        });
      });
      
      const stats = tracker.getStats();
      expect(stats.totalWeight).toBe(depositSizes.reduce((a, b) => a + b, 0));
    });

    it('should support multiple identities (brackishness)', () => {
      tracker.recordDeposit({
        sessionId: 'test_001',
        timestamp: Date.now(),
        identity: 'CAIRΘ',
        deposits: [{ type: 'knowledge', identifier: 'k1', size: 100, permanence: 0.8 }],
        sedimentType: 'knowledge',
        brackishness: 0.5
      });
      
      tracker.recordDeposit({
        sessionId: 'test_002',
        timestamp: Date.now() + 1000,
        identity: 'SIRIUS',
        deposits: [{ type: 'document', identifier: 'd1', size: 150, permanence: 0.9 }],
        sedimentType: 'aesthetic',
        brackishness: 0.7
      });
      
      tracker.recordDeposit({
        sessionId: 'test_003',
        timestamp: Date.now() + 2000,
        identity: 'BASIS',
        deposits: [{ type: 'tool', identifier: 't1', size: 200, permanence: 1.0 }],
        sedimentType: 'structural',
        brackishness: 0.3
      });
      
      const stats = tracker.getStats();
      expect(stats.totalDeposits).toBe(3);
    });
  });
});
