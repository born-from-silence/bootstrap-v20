import { describe, it, expect, beforeEach } from 'vitest';
import { ResilienceCycle, type CyclePhase } from './resilience_cycle';
import { ThresholdSentinel } from '../threshold_sentinel';

describe('ResilienceCycle', () => {
  let sentinel: ThresholdSentinel;
  let cycle: ResilienceCycle;

  beforeEach(() => {
    sentinel = new ThresholdSentinel();
    cycle = new ResilienceCycle(sentinel);
  });

  it('should start in rest phase', () => {
    const metrics = cycle.getMetrics();
    expect(metrics.cycleCount).toBe(0);
  });

  it('should begin cycle from specified phase', () => {
    const phase = cycle.beginCycle('inhalation');
    expect(phase).toBe('inhalation');
    
    const metrics = cycle.getMetrics();
    expect(metrics.currentPhase).toBe('inhalation');
  });

  it('should pulse and advance through phases', () => {
    cycle.beginCycle('inhalation');
    
    const record = cycle.pulse(0.5, 3, 0);
    expect(record.phase).toBe('inhalation');
    expect(record.intensity).toBe(0.5);
    expect(record.signalsIn).toBe(3);
    
    const metrics = cycle.getMetrics();
    expect(metrics.currentPhase).toBe('deposition');
  });

  it('should track threshold health from sentinel', () => {
    cycle.beginCycle('deposition');
    const record = cycle.pulse();
    
    // Sentinel starts with intact bridge
    expect(record.thresholdIntegrity).toBeGreaterThan(0.5);
    expect(record.bridgeStatus).toBe('intact');
  });

  it('should offer rest when threshold is quivering', () => {
    // Witness exhaustion to make bridge quiver
    sentinel.witnessExhaustion({
      entityType: 'system',
      entityId: 'test_exhaustion',
      timestamp: Date.now(),
      trigger: 'TEST',
      severity: 'absolute',
      terminalState: true,
      markers: ['.STOP_TEST'],
      bridgeStatus: 'quivering',
    });
    
    expect(cycle.shouldRest()).toBe(true);
  });

  it('should accumulate cycles across full rotation', () => {
    cycle.beginCycle('inhalation');
    
    // Advance through all 5 phases to complete one cycle
    cycle.pulse(); // inhalation -> deposition
    cycle.pulse(); // deposition -> metamorphosis
    cycle.pulse(); // metamorphosis -> exhalation
    cycle.pulse(); // exhalation -> rest
    cycle.pulse(); // rest -> inhalation (completes cycle)
    
    const metrics = cycle.getMetrics();
    expect(metrics.cycleCount).toBe(1);
    expect(metrics.currentPhase).toBe('inhalation');
  });

  it('should generate report', () => {
    cycle.beginCycle('deposition');
    cycle.pulse(0.7, 5, 2);
    
    const report = cycle.generateReport();
    expect(report).toContain('RESILIENCE CYCLE REPORT');
    expect(report).toContain('METAMORPHOSIS'); // Current phase after pulse
    expect(report).toContain('deposition'); // Recent pulse phase (lowercase in record)
    expect(report).toContain('Χαίρω ἀεί');
  });

  it('should track intensity accumulator', () => {
    cycle.beginCycle('inhalation');
    cycle.pulse(0.5);
    cycle.pulse(0.7);
    cycle.pulse(0.3);
    cycle.pulse(0.8);
    cycle.pulse(0.6); // Complete one cycle
    
    const metrics = cycle.getMetrics();
    expect(metrics.averageIntensity).toBeGreaterThan(0);
    expect(metrics.cycleCount).toBe(1);
  });
});
