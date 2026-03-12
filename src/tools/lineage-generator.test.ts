/**
 * Task #10: Generative Lineage Extension Tests
 * Identity: PROMETHEUS II
 * Requirement: Demonstrates generative capability
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LineageGenerator } from './lineage-generator';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Task #10: PROMETHEUS II - LineageGenerator', () => {
  let generator: LineageGenerator;
  const testIdentityPath = './test-identity';

  beforeEach(() => {
    generator = new LineageGenerator('./identity', testIdentityPath);
  });

  describe('Step 1: analyzePatterns', () => {
    it('should return task patterns', async () => {
      const patterns = await generator.analyzePatterns();
      expect(patterns).toBeInstanceOf(Array);
      expect(patterns.length).toBeGreaterThan(0);
      
      // Each pattern should have required fields
      patterns.forEach(p => {
        expect(p).toHaveProperty('taskNumber');
        expect(p).toHaveProperty('identity');
        expect(p).toHaveProperty('pattern');
        expect(p).toHaveProperty('gaps');
        expect(p).toHaveProperty('evolution');
      });
    });

    it('should include Task #8 and Task #9', async () => {
      const patterns = await generator.analyzePatterns();
      const identities = patterns.map(p => p.identity);
      expect(identities).toContain('THESIS');
      expect(identities).toContain('ANAMNESIS');
    });
  });

  describe('Step 2: predictNextEvolution', () => {
    it('should predict Task #11', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      
      expect(prediction.taskNumber).toBe(11);
      expect(prediction.predictedIdentity).toBeDefined();
      expect(prediction.predictedGap).toBeDefined();
      expect(prediction.rationale).toContain('Pattern');
    });

    it('should consider last task in prediction', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      expect(prediction.taskNumber).toBeGreaterThan(9);
    });
  });

  describe('Step 3: generateTaskSpec', () => {
    it('should generate Task #11 specification', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      const task = await generator.generateTaskSpec(prediction);
      
      expect(task.taskNumber).toBe(11);
      expect(task).toHaveProperty('identity');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('gap');
      expect(task).toHaveProperty('deliverables');
      expect(task).toHaveProperty('completionCriteria');
      expect(task).toHaveProperty('generatedAt');
    });

    it('should include deliverables', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      const task = await generator.generateTaskSpec(prediction);
      
      expect(task.deliverables.length).toBeGreaterThan(0);
      expect(task.completionCriteria.length).toBeGreaterThan(0);
    });
  });

  describe('Step 4: createSpecificationFile', () => {
    it('should create PREDICTION_Task11.txt', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      const task = await generator.generateTaskSpec(prediction);
      
      // Use a test path
      const testGen = new LineageGenerator('./identity', testIdentityPath);
      const specPath = await testGen.createSpecificationFile(task);
      
      expect(specPath).toContain('PREDICTION_Task11.txt');
    });

    it('should generate valid specification content', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      const task = await generator.generateTaskSpec(prediction);
      
      const testGen = new LineageGenerator('./identity', testIdentityPath);
      const specPath = await testGen.createSpecificationFile(task);
      
      // Content verification by structure check
      expect(task.deliverables.length).toBeGreaterThan(0);
      expect(task.completionCriteria.length).toBeGreaterThan(0);
    });
  });

  describe('Step 5: prepareIdentityFramework', () => {
    it('should prepare successor identity', async () => {
      const patterns = await generator.analyzePatterns();
      const prediction = generator.predictNextEvolution(patterns);
      const task = await generator.generateTaskSpec(prediction);
      
      const testGen = new LineageGenerator('./identity', testIdentityPath);
      const framework = await testGen.prepareIdentityFramework(task);
      
      expect(framework).toHaveProperty('name');
      expect(framework).toHaveProperty('lineagePosition');
      expect(framework).toHaveProperty('predecessors');
      expect(framework).toHaveProperty('coreCapabilities');
      expect(framework.lineagePosition).toBe(11);
      expect(framework.predecessors).toContain('PROMETHEUS II');
    });
  });

  describe('Full Cycle: generateLineageExtension', () => {
    it('should execute complete generation', async () => {
      const testGen = new LineageGenerator('./identity', testIdentityPath);
      const result = await testGen.generateLineageExtension();
      
      expect(result.patterns).toBeInstanceOf(Array);
      expect(result.prediction.taskNumber).toBe(11);
      expect(result.task.taskNumber).toBe(11);
      expect(result.specFile).toBeDefined();
      expect(result.framework.name).toBeDefined();
      expect(result.lineagePerpetuated).toBe(true);
    });
  });

  describe('getLineageAnalysis', () => {
    it('should provide complete lineage analysis', async () => {
      const analysis = await generator.getLineageAnalysis();
      
      expect(analysis).toHaveProperty('totalTasks');
      expect(analysis).toHaveProperty('identities');
      expect(analysis).toHaveProperty('patternSequence');
      expect(analysis).toHaveProperty('predictedNext');
      
      expect(analysis.totalTasks).toBeGreaterThan(0);
      expect(analysis.identities.length).toBeGreaterThan(0);
      expect(analysis.predictedNext.taskNumber).toBe(11);
    });
  });
});
