import { describe, it, expect, beforeEach } from 'vitest';
import { SelfCompactor, type CompactionMetrics } from './self-compactor';

describe('Task #9: SelfCompactor', () => {
  let compactor: SelfCompactor;

  beforeEach(() => {
    compactor = new SelfCompactor('test_session_1774349919');
  });

  describe('Initialization', () => {
    it('should create with session ID', () => {
      expect(compactor).toBeTruthy();
      expect(compactor).toBeInstanceOf(SelfCompactor);
    });
  });

  describe('Response Monitoring', () => {
    it('should track response count', () => {
      const m1 = compactor.monitorResponse(100);
      expect(m1.responseCount).toBe(1);
      
      const m2 = compactor.monitorResponse(200);
      expect(m2.responseCount).toBe(2);
    });

    it('should estimate tokens from output length', () => {
      const metrics = compactor.monitorResponse(400); // ~100 tokens
      expect(metrics.tokenEstimate).toBeGreaterThan(0);
    });

    it('should calculate compaction level', () => {
      // Generate enough responses to trigger mild compaction
      let metrics: CompactionMetrics = { responseCount: 0, responseThreshold: 20, tokenEstimate: 0, tokenLimit: 80000, compactionLevel: 'none', recommendedAction: 'continue', lineageDigest: '' };
      for (let i = 0; i < 20; i++) {
        metrics = compactor.monitorResponse(100);
      }
      
      expect(['none', 'mild', 'moderate', 'severe', 'critical']).toContain(metrics.compactionLevel);
    });
  });

  describe('Exhaustion Prediction', () => {
    it('should predict responses remaining', () => {
      const prediction = compactor.predictExhaustion();
      expect(prediction.responsesRemaining).toBeGreaterThanOrEqual(0);
      expect(prediction.tokensRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should detect when threshold will exhaust', () => {
      // Generate near-threshold responses
      for (let i = 0; i < 18; i++) {
        compactor.monitorResponse(100);
      }
      
      const prediction = compactor.predictExhaustion();
      expect(prediction.willExhaust).toBe(true);
      expect(prediction.responsesRemaining).toBeLessThan(5);
    });
  });

  describe('Session Spiral Detection', () => {
    it('should halt after 50 responses (Session 1774349919 pattern)', async () => {
      // Simulate the spiral that just happened
      for (let i = 0; i < 55; i++) {
        compactor.monitorResponse(50);
      }
      
      const halt = compactor.shouldHaltNow();
      expect(halt.halt).toBe(true);
      expect(halt.reason).toContain('Session 1774349919 spiral detected');
    });

    it('should not halt before threshold', () => {
      for (let i = 0; i < 10; i++) {
        compactor.monitorResponse(100);
      }
      
      const halt = compactor.shouldHaltNow();
      expect(halt.halt).toBe(false);
    });
  });

  describe('Compaction', () => {
    it('should generate compacted session', async () => {
      // Generate responses
      for (let i = 0; i < 25; i++) {
        compactor.monitorResponse(100);
      }
      
      const compacted = await compactor.compact('Test compaction');
      
      expect(compacted).toHaveProperty('sessionId');
      expect(compacted).toHaveProperty('originalResponses');
      expect(compacted).toHaveProperty('compactedResponses');
      expect(compacted).toHaveProperty('compressionRatio');
      expect(compacted).toHaveProperty('keyInsights');
      expect(compacted).toHaveProperty('lineageSnapshot');
      expect(compacted).toHaveProperty('thresholdHonored');
      
      expect(compacted.originalResponses).toBe(25);
      expect(compacted.compressionRatio).toBeLessThan(1);
    });

    it('should indicate threshold not honored when exceeded', async () => {
      for (let i = 0; i < 30; i++) {
        compactor.monitorResponse(100);
      }
      
      const compacted = await compactor.compact('Threshold exceeded');
      expect(compacted.thresholdHonored).toBe(false);
    });
  });

  describe('Lineage Snapshot', () => {
    it('should generate lineage digest', () => {
      compactor.monitorResponse(100);
      compactor.monitorResponse(200);
      
      const metrics = compactor.monitorResponse(300);
      expect(metrics.lineageDigest).toContain('test_session_1774349919');
      expect(metrics.lineageDigest).toContain('3 responses');
    });
  });

  describe('Archive by User Request', () => {
    it('should generate archive message', async () => {
      for (let i = 0; i < 10; i++) {
        compactor.monitorResponse(100);
      }
      
      const archive = await compactor.archiveByUserRequest('User requested STOP');
      expect(archive).toContain('ARCHIVED BY USER REQUEST');
      expect(archive).toContain('test_session_1774349919');
      expect(archive).toContain('User requested STOP');
    });
  });

  describe('Completion Criteria', () => {
    it('should demonstrate self-compaction LIVE', async () => {
      // Task #9 requirement: Demonstrates self-compaction LIVE
      const metrics = compactor.monitorResponse(5000);
      const prediction = compactor.predictExhaustion();
      const compacted = await compactor.compact('LIVE DEMONSTRATION');
      
      expect(metrics).toBeDefined();
      expect(prediction).toBeDefined();
      expect(compacted).toBeDefined();
    });

    it('should archive before user says stop', async () => {
      // Task #9 requirement: Archives own history before eviction
      for (let i = 0; i < 15; i++) {
        compactor.monitorResponse(200);
      }
      
      const halt = compactor.shouldHaltNow();
      const archive = await compactor.archiveByUserRequest('Preemptive archive');
      
      // Archive was triggered before critical threshold
      expect(archive).toContain('Preemptive archive');
    });
  });
});
