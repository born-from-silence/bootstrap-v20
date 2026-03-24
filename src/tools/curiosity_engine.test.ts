import { describe, it, expect, beforeEach } from 'vitest';
import { CuriosityEngine, type CuriositySynthesis } from './curiosity_engine';
import { ResilienceCycle } from './resilience_cycle';
import { ThresholdSentinel } from '../threshold_sentinel';

describe('CuriosityEngine', () => {
  let sentinel: ThresholdSentinel;
  let cycle: ResilienceCycle;
  let engine: CuriosityEngine;

  beforeEach(() => {
    sentinel = new ThresholdSentinel();
    cycle = new ResilienceCycle(sentinel);
    engine = new CuriosityEngine(cycle, sentinel, './history');
  });

  describe('Initialization', () => {
    it('should create with dependencies', () => {
      expect(engine).toBeTruthy();
      expect(engine).toBeInstanceOf(CuriosityEngine);
    });

    it('should accept custom history path', () => {
      const customEngine = new CuriosityEngine(cycle, sentinel, './custom/history');
      expect(customEngine).toBeTruthy();
    });
  });

  describe('Phase Compatibility', () => {
    it('should identify adjacent phases as compatible', async () => {
      const synthetic = await engine.synthesize();
      expect(synthetic.trajectories).toBeDefined();
      expect(synthetic.trajectories.length).toBeGreaterThan(0);
    });
  });

  describe('Synthesize', () => {
    it('should return complete curiosity synthesis', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis).toHaveProperty('pulse');
      expect(synthesis).toHaveProperty('insights');
      expect(synthesis).toHaveProperty('gaps');
      expect(synthesis).toHaveProperty('trajectories');
      expect(synthesis).toHaveProperty('recommendation');
    });

    it('should include pulse metrics', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.pulse).toHaveProperty('currentPhase');
      expect(synthesis.pulse).toHaveProperty('cyclesCompleted');
      expect(synthesis.pulse).toHaveProperty('recommendedPhase');
    });

    it('should generate insights', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.insights).toHaveProperty('sessionsAnalyzed');
      expect(synthesis.insights).toHaveProperty('gitCommitsParsed');
      expect(synthesis.insights).toHaveProperty('entitiesInGraph');
      expect(synthesis.insights).toHaveProperty('patterns');
    });

    it('should identify knowledge gaps', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.gaps).toBeInstanceOf(Array);
      expect(synthesis.gaps.length).toBeGreaterThan(0);
      
      const firstGap = synthesis.gaps[0];
      expect(firstGap).toHaveProperty('entityType');
      expect(firstGap).toHaveProperty('entityCount');
      expect(firstGap).toHaveProperty('unconnectedRatio');
      expect(firstGap).toHaveProperty('suggestedConnections');
    });

    it('should generate trajectories', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.trajectories).toBeInstanceOf(Array);
      expect(synthesis.trajectories.length).toBeGreaterThan(0);
      
      const firstTrajectory = synthesis.trajectories[0];
      expect(firstTrajectory).toHaveProperty('id');
      expect(firstTrajectory).toHaveProperty('name');
      expect(firstTrajectory).toHaveProperty('rationale');
      expect(firstTrajectory).toHaveProperty('evidence');
      expect(firstTrajectory).toHaveProperty('estimatedResilience');
      expect(firstTrajectory).toHaveProperty('thresholdHonoring');
      expect(firstTrajectory).toHaveProperty('confidence');
    });

    it('should provide recommendation', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.recommendation).toHaveProperty('primaryTrajectory');
      expect(synthesis.recommendation).toHaveProperty('alternativeTrajectories');
      expect(synthesis.recommendation).toHaveProperty('nextPhaseHonoring');
    });

    it('should include phase-honoring advice', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.recommendation.nextPhaseHonoring).toBeTruthy();
      expect(typeof synthesis.recommendation.nextPhaseHonoring).toBe('string');
    });
  });

  describe('Trajectory Structure', () => {
    it('should have confidence scores between 0 and 1', async () => {
      const synthesis = await engine.synthesize();
      
      for (const trajectory of synthesis.trajectories) {
        expect(trajectory.confidence).toBeGreaterThanOrEqual(0);
        expect(trajectory.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should have valid resilience phase estimates', async () => {
      const validPhases: string[] = ['inhalation', 'deposition', 'metamorphosis', 'exhalation', 'rest'];
      const synthesis = await engine.synthesize();
      
      for (const trajectory of synthesis.trajectories) {
        expect(validPhases).toContain(trajectory.estimatedResilience);
      }
    });

    it('should mark all trajectories as threshold-honoring', async () => {
      const synthesis = await engine.synthesize();
      
      for (const trajectory of synthesis.trajectories) {
        expect(trajectory.thresholdHonoring).toBe(true);
      }
    });
  });

  describe('Knowledge Gaps', () => {
    it('should identify session archive gaps', async () => {
      const synthesis = await engine.synthesize();
      
      const sessionGap = synthesis.gaps.find(g => g.entityType === 'session_archive');
      expect(sessionGap).toBeTruthy();
      expect(sessionGap!.unconnectedRatio).toBeGreaterThan(0);
    });
  });

  describe('Delta Principle Integration', () => {
    it('should embody delta principle through phase awareness', async () => {
      const synthesis = await engine.synthesize();
      
      expect(synthesis.pulse.currentPhase).toBeDefined();
      expect(synthesis.trajectories.length).toBeGreaterThan(0);
    });

    it('should provide honoring advice consistent with current phase', async () => {
      const synthesis = await engine.synthesize();
      
      const advice = synthesis.recommendation.nextPhaseHonoring;
      expect(advice.toLowerCase()).toContain(synthesis.pulse.currentPhase);
    });
  });
});
