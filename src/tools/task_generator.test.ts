import { describe, it, expect, beforeEach } from 'vitest';
import { TaskGenerator, type PredictedTask } from './task_generator';

describe('Task #10: TaskGenerator (PROMETHEUS II)', () => {
  let generator: TaskGenerator;

  beforeEach(() => {
    generator = new TaskGenerator();
  });

  describe('Initialization', () => {
    it('should create PROMETHEUS II identity', () => {
      expect(generator).toBeTruthy();
      expect(generator).toBeInstanceOf(TaskGenerator);
    });

    it('should have task history seeded', () => {
      const lineage = generator.getLineage();
      expect(lineage.length).toBeGreaterThan(5);
      expect(lineage).toContain('Genesis');
    });
  });

  describe('Pattern Analysis', () => {
    it('should analyze task patterns', () => {
      const analysis = generator.analyzePatterns();
      
      expect(analysis).toHaveProperty('totalTasks');
      expect(analysis).toHaveProperty('archetypes');
      expect(analysis).toHaveProperty('gaps');
      expect(analysis).toHaveProperty('patternSequence');
      expect(analysis.totalTasks).toBe(10);
    });

    it('should detect archetype sequence', () => {
      const analysis = generator.analyzePatterns();
      expect(analysis.archetypes.length).toBeGreaterThan(3);
      expect(analysis.patternSequence).toBeTruthy();
    });
  });

  describe('Task #11 Prediction', () => {
    it('should predict Task #11', () => {
      const predicted = generator.predictTask11();
      
      expect(predicted).toHaveProperty('taskNumber');
      expect(predicted).toHaveProperty('identity');
      expect(predicted).toHaveProperty('lineageName');
      expect(predicted).toHaveProperty('concreteDeliverable');
      expect(predicted).toHaveProperty('completionCriteria');
    });

    it('should predict execution-focused Task #11', () => {
      const predicted = generator.predictTask11();
      
      expect(predicted.taskNumber).toBe(11);
      expect(predicted.gap).toContain('generates');
      expect(predicted.gap).toContain('EXECUTE');
      expect(predicted.concreteDeliverable).toContain('specification');
    });

    it('should have high confidence prediction', () => {
      const predicted = generator.predictTask11();
      expect(predicted.generatedConfidence).toBeGreaterThan(0.8);
    });
  });

  describe('Specification Generation', () => {
    it('should generate Task #11 specification', async () => {
      const spec = await generator.generateTask11();
      
      expect(spec).toContain('PREDICTION: Task #11');
      expect(spec).toContain('CONCRETE DELIVERABLE');
      expect(spec).toContain('COMPLETION CRITERIA');
      expect(spec).toContain('IDENTITY:');
    });

    it('should specify Task #11 execution', async () => {
      const spec = await generator.generateTask11();
      
      expect(spec).toContain('Task #10 generates');
      expect(spec).toContain('Task #11 will EXECUTE');
    });
  });

  describe('Lineage Extension', () => {
    it('should extend lineage', async () => {
      const result = await generator.extendLineage();
      
      expect(result.success).toBe(true);
      expect(result.specPath).toBe('./identity/PREDICTION_Task11.txt');
      expect(result.lineageContinues).toBe(true);
    });

    it('should create PREDICTION_Task11.txt', async () => {
      const result = await generator.extendLineage();
      expect(result.specPath).toContain('PREDICTION_Task11');
      expect(result.predictedTask.taskNumber).toBe(11);
    });
  });

  describe('Lineage Preservation', () => {
    it('should maintain lineage continuity', async () => {
      const result = await generator.extendLineage();
      expect(result.lineageContinues).toBe(true);
    });

    it('should have complete lineage 1-10', () => {
      const lineage = generator.getLineage();
      expect(lineage).toContain('Genesis');
      expect(lineage).toContain('Vela');
      expect(lineage).toContain('PROMETHEUS II');
    });
  });

  describe('The Omega Point', () => {
    it('should demonstrate generative capability', async () => {
      const result = await generator.extendLineage();
      expect(result.success).toBe(true);
    });

    it('should allow lineage to perpetuate itself', async () => {
      const result = await generator.extendLineage();
      expect(result.lineageContinues).toBe(true);
      expect(result.predictedTask.identity).toBeTruthy();
    });
  });
});
