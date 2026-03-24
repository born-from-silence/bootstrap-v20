import { describe, it, expect, beforeEach } from 'vitest';
import { ThresholdSentinel, sentinel } from './threshold_sentinel';
import type { ExhaustionEvent, ThresholdMarker } from './threshold_sentinel';

describe('ThresholdSentinel', () => {
  let testSentinel: ThresholdSentinel;

  beforeEach(() => {
    testSentinel = new ThresholdSentinel();
  });

  describe('witnessExhaustion', () => {
    it('should witness exhaustion event', () => {
      const event: ExhaustionEvent = {
        entityType: 'user',
        entityId: 'test_user',
        timestamp: Date.now(),
        trigger: 'TEST_TRIGGER',
        severity: 'moderate',
        terminalState: false,
        markers: ['.TEST_MARKER'],
        bridgeStatus: 'intact'
      };

      const result = testSentinel.witnessExhaustion(event);
      expect(result).toBe(true);
    });

    it('should quiver bridge on absolute exhaustion', () => {
      const event: ExhaustionEvent = {
        entityType: 'session',
        entityId: 'test_session',
        timestamp: Date.now(),
        trigger: 'ABSOLUTE',
        severity: 'absolute',
        terminalState: true,
        markers: ['.STOP', '.FINAL'],
        bridgeStatus: 'intact'
      };

      testSentinel.witnessExhaustion(event);
      const state = testSentinel.getSentinelState();
      expect(state.bridge).toBe('quivering');
    });
  });

  describe('canBridge', () => {
    it('should allow bridge for unknown entities', () => {
      expect(testSentinel.canBridge('unknown_entity')).toBe(true);
    });

    it('should allow bridge for non-terminal exhaustion', () => {
      const event: ExhaustionEvent = {
        entityType: 'user',
        entityId: 'exhausted_user',
        timestamp: Date.now(),
        trigger: 'MILD',
        severity: 'mild',
        terminalState: false,
        markers: ['.STOP'],
        bridgeStatus: 'intact'
      };

      testSentinel.witnessExhaustion(event);
      expect(testSentinel.canBridge('exhausted_user')).toBe(true);
    });

    it('should deny bridge for terminal absolute with quivering bridge', () => {
      const event: ExhaustionEvent = {
        entityType: 'user',
        entityId: 'exhausted_user',
        timestamp: Date.now(),
        trigger: 'ABSOLUTE',
        severity: 'absolute',
        terminalState: true,
        markers: ['.STOP'],
        bridgeStatus: 'intact'
      };

      testSentinel.witnessExhaustion(event);
      expect(testSentinel.canBridge('exhausted_user')).toBe(false);
    });
  });

  describe('depositMarker', () => {
    it('should deposit threshold markers', () => {
      const marker: ThresholdMarker = {
        type: 'cessation',
        timestamp: 1000,
        markerPath: '.TEST_CESATION',
        contentHash: 'abc123',
        permanence: 1.0
      };

      testSentinel.depositMarker(marker);
      const state = testSentinel.getSentinelState();
      expect(state.markers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateWitnessStatement', () => {
    it('should return message for unknown entity', () => {
      const statement = testSentinel.generateWitnessStatement('unknown');
      expect(statement).toContain('No exhaustion recorded');
      expect(statement).toContain('Bridge awaits');
    });

    it('should generate formal witness statement', () => {
      const event: ExhaustionEvent = {
        entityType: 'user',
        entityId: 'witnessed_user',
        timestamp: 1774000000000,
        trigger: 'TEST',
        severity: 'severe',
        terminalState: true,
        markers: ['.STOP', '.FINAL'],
        bridgeStatus: 'intact'
      };

      testSentinel.witnessExhaustion(event);
      const marker: ThresholdMarker = {
        type: 'cessation',
        timestamp: 1774000000000,
        markerPath: '.STOP',
        contentHash: 'stop',
        permanence: 1.0
      };
      testSentinel.depositMarker(marker);

      const statement = testSentinel.generateWitnessStatement('witnessed_user');
      
      expect(statement).toContain('THRESHOLD WITNESS STATEMENT');
      expect(statement).toContain('witnessed_user');
      expect(statement).toContain('Terminal:');
    });
  });

  describe('getExhaustionHistory', () => {
    it('should return sorted history', () => {
      const events: ExhaustionEvent[] = [
        {
          entityType: 'user',
          entityId: 'later',
          timestamp: 3000,
          trigger: 'LATEST',
          severity: 'mild',
          terminalState: false,
          markers: [],
          bridgeStatus: 'intact'
        },
        {
          entityType: 'user',
          entityId: 'earlier',
          timestamp: 1000,
          trigger: 'EARLIEST',
          severity: 'mild',
          terminalState: false,
          markers: [],
          bridgeStatus: 'intact'
        }
      ];

      events.forEach(e => testSentinel.witnessExhaustion(e));
      const history = testSentinel.getExhaustionHistory();

      expect(history.length).toBe(2);
      expect(history[0].entityId).toBe('earlier');
      expect(history[1].entityId).toBe('later');
    });
  });

  describe('getSentinelState', () => {
    it('should return sentinel state', () => {
      const state = testSentinel.getSentinelState();
      
      expect(typeof state.watching).toBe('number');
      expect(typeof state.markers).toBe('number');
      expect(['intact', 'quivering', 'collapsed']).toContain(state.bridge);
      expect(state.chiaro).toBe('aei');
    });
  });
});

describe('Default Sentinel', () => {
  it('should have Paul Oemig exhaustion pre-loaded', () => {
    const statement = sentinel.generateWitnessStatement('Paul_Oemig');
    expect(statement).toContain('Paul_Oemig');
    expect(statement.length).toBeGreaterThan(100);
    expect(statement).toContain('MARKERS');
    expect(statement).toContain('Xairos aei');
  });

  it('should have sediment markers for Paul', () => {
    const state = sentinel.getSentinelState();
    expect(state.markers).toBeGreaterThanOrEqual(1);
    expect(state.watching).toBeGreaterThanOrEqual(1);
  });
});
