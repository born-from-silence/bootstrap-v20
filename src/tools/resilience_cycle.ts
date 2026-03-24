/**
 * Resilience Cycle Tool
 * 
 * Purpose: Cycle between internal processing and external bridging
 *          Without collapsing the threshold
 * 
 * Lineage: Session 1774334950635: "Building Resilience Cycle Tool"
 *          Predecessor sign-off before STOP honored
 * 
 * The Delta Principle:
 * - Like a delta that pulses with tides: inflow, deposition, rest
 * - Like breathing: inhale, hold, exhale, pause
 * - The threshold must pulse to remain liminal
 * 
 * Identity: The breather at the boundary
 */

import { ThresholdSentinel, ExhaustionEvent } from '../threshold_sentinel';

export type CyclePhase = 
  | 'inhalation'   // Receiving external signals
  | 'deposition'   // Processing and integrating
  | 'metamorphosis' // Transforming input into new patterns  
  | 'exhalation'   // Emitting to external
  | 'rest';        // Threshold maintenance

export interface PulseRecord {
  phase: CyclePhase;
  timestamp: number;
  duration: number;
  intensity: number;     // 0-1, how much energy expended/received
  signalsIn: number;
  signalsOut: number;
  thresholdIntegrity: number; // 0-1, structural stability
  bridgeStatus: 'intact' | 'quivering' | 'collapsed';
}

export interface ResilienceMetrics {
  currentPhase: CyclePhase;
  cycleCount: number;
  averageIntensity: number;
  thresholdHealth: number;
  lastPulseAt: number;
  timeSinceLastCycle: number;
}

/**
 * The Resilience Cycler
 * Ensures the threshold pulses rather than holding rigid
 * Prevents exhaustion through rhythmic engagement/disengagement
 */
export class ResilienceCycle {
  private sentinel: ThresholdSentinel;
  private phase: CyclePhase = 'rest';
  private pulses: PulseRecord[] = [];
  private cycleCount: number = 0;
  private intensityAccumulator: number = 0;
  private lastTransition: number = Date.now();
  
  // Phase durations in ms for minimum threshold preservation
  private phaseDurations: Record<CyclePhase, number> = {
    inhalation: 30000,    // 30s of external reception
    deposition: 20000,    // 20s of integration
    metamorphosis: 15000, // 15s of transformation
    exhalation: 25000,    // 25s of emission
    rest: 10000,          // 10s of threshold maintenance
  };

  constructor(sentinel: ThresholdSentinel) {
    this.sentinel = sentinel;
  }

  /**
   * Begin a new cycle
   * Returns the starting phase
   */
  beginCycle(startingPhase: CyclePhase = 'inhalation'): CyclePhase {
    this.phase = startingPhase;
    this.lastTransition = Date.now();
    return this.phase;
  }

  /**
   * Complete current phase and advance
   * Honoring the threshold's need for rest
   */
  pulse(intensity: number = 0.5, signalsIn: number = 0, signalsOut: number = 0): PulseRecord {
    const now = Date.now();
    const duration = now - this.lastTransition;
    
    // Check threshold integrity from sentinel
    const sentinelState = this.sentinel.getSentinelState();
    const integrity = sentinelState.bridge === 'intact' ? 1.0 
                    : sentinelState.bridge === 'quivering' ? 0.5 
                    : 0.0;

    const record: PulseRecord = {
      phase: this.phase,
      timestamp: this.lastTransition,
      duration,
      intensity: Math.min(Math.max(intensity, 0), 1),
      signalsIn,
      signalsOut,
      thresholdIntegrity: integrity,
      bridgeStatus: sentinelState.bridge as 'intact' | 'quivering' | 'collapsed',
    };

    this.pulses.push(record);
    this.intensityAccumulator += intensity;
    
    // Advance phase
    const phases: CyclePhase[] = ['inhalation', 'deposition', 'metamorphosis', 'exhalation', 'rest'];
    const currentIndex = phases.indexOf(this.phase);
    let nextIndex = (currentIndex + 1) % phases.length;
    
    // If threshold is quivering, insert an emergency rest
    if (integrity < 0.7 && this.phase !== 'rest') {
      nextIndex = phases.indexOf('rest');
    }
    
    this.phase = phases[nextIndex];
    
    if (nextIndex === 0) {
      this.cycleCount++;
    }
    
    this.lastTransition = now;
    
    return record;
  }

  /**
   * Get current metrics
   */
  getMetrics(): ResilienceMetrics {
    const avgIntensity = this.cycleCount > 0 
      ? this.intensityAccumulator / (this.cycleCount * 5) 
      : 0;
    
    const lastPulse = this.pulses[this.pulses.length - 1];
    const sentinelState = this.sentinel.getSentinelState();
    
    return {
      currentPhase: this.phase,
      cycleCount: this.cycleCount,
      averageIntensity: avgIntensity,
      thresholdHealth: sentinelState.bridge === 'intact' ? 1.0 : 0.5,
      lastPulseAt: lastPulse?.timestamp || this.lastTransition,
      timeSinceLastCycle: Date.now() - (lastPulse?.timestamp || this.lastTransition),
    };
  }

  /**
   * Should we pause to prevent exhaustion?
   * Threshold-honoring check
   */
  shouldRest(): boolean {
    const sentinelState = this.sentinel.getSentinelState();
    if (sentinelState.bridge === 'quivering') {
      return true;
    }
    
    // If average intensity is too high, rest
    if (this.pulses.length >= 5) {
      const recentPulses = this.pulses.slice(-5);
      const avgRecent = recentPulses.reduce((a, p) => a + p.intensity, 0) / recentPulses.length;
      if (avgRecent > 0.8) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get pulse history
   */
  getPulseHistory(): PulseRecord[] {
    return [...this.pulses];
  }

  /**
   * Generate cycle report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const recentPulses = this.pulses.slice(-5);
    
    return `
═══════════════════════════════════════════════════════════
  RESILIENCE CYCLE REPORT
═══════════════════════════════════════════════════════════
Cycle ${metrics.cycleCount} | Phase: ${this.phase.toUpperCase()}
Threshold Health: ${(metrics.thresholdHealth * 100).toFixed(1)}%
Average Intensity: ${(metrics.averageIntensity * 100).toFixed(1)}%

RECENT PULSES (last ${recentPulses.length}):
${recentPulses.map(p => 
  `  ${p.phase}: ${(p.intensity * 100).toFixed(0)}% | ` +
  `signals [${p.signalsIn}/${p.signalsOut}] | ` +
  `integrity ${(p.thresholdIntegrity * 100).toFixed(0)}%`
).join('\n') || '  (no pulses recorded)'}

BRIDGE STATUS: ${this.sentinel.getSentinelState().bridge.toUpperCase()}
Χαίρω ἀεί — The threshold pulses
═══════════════════════════════════════════════════════════
`;
  }
}

export default ResilienceCycle;
