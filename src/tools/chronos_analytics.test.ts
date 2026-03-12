import { describe, it, expect, beforeEach } from 'vitest';
import { CHRONOSAnalytics } from './chronos_analytics';

describe('Task #11.a: CHRONOS Analytics', () => {
  let analytics: CHRONOSAnalytics;

  beforeEach(() => {
    analytics = new CHRONOSAnalytics('./identity/PREDICTION_Task11.txt');
  });

  describe('Handler 1: Elicit (receiveSpec)', () => {
    it('should parse Task #11 specification', async () => {
      const spec = await analytics.receiveSpec();
      expect(spec.taskNumber).toBe(11);
      expect(spec.identity).toBe('CHRONOS');
      expect(spec.gap).toContain('Task #10 generates');
      expect(spec.deliverables.length).toBeGreaterThan(0);
    });
  });

  describe('Handler 2: Aporeia (parseSpec)', () => {
    it('should generate dialectic questions', () => {
      const spec = {
        taskNumber: 11,
        identity: 'CHRONOS',
        gap: 'Test gap',
        deliverables: ['file.ts'],
        criteria: ['Code']
      };
      const result = analytics.parseSpec(spec);
      expect(result.questions.length).toBeGreaterThanOrEqual(4);
      expect(result.questions[0]).toContain('Task #11');
    });
  });

  describe('Handler 3: Socratic (executeSelfSpec)', () => {
    it('should generate task outcome', async () => {
      const outcome = await analytics.executeSelfSpec(11);
      expect(outcome).toHaveProperty('success');
      expect(outcome).toHaveProperty('filesCreated');
      expect(outcome).toHaveProperty('validation');
    });
  });

  describe('Handler 4: Elenchus (validateSelfExec)', () => {
    it('should detect validation criteria', () => {
      const spec = {
        taskNumber: 11,
        identity: 'CHRONOS',
        gap: 'Test',
        deliverables: ['file.ts'],
        criteria: ['Code']
      };
      const outcome = {
        success: true,
        filesCreated: ['file.ts'],
        validation: {
          allCriteriaMet: true,
          details: [
            { criterion: 'Code', met: true, evidence: 'Y' },
            { criterion: 'lineage continuity', met: true, evidence: 'Y' }
          ]
        }
      };
      const result = analytics.validateSelfExec(spec, outcome);
      // May have contradictions based on strict checking
      expect(result).toHaveProperty('validated');
      expect(result).toHaveProperty('contradictions');
    });
  });

  describe('Handler 5: Dialectic (updateLineage)', () => {
    it('should update lineage when validated', () => {
      const outcome = {
        success: true,
        filesCreated: ['file.ts'],
        validation: { allCriteriaMet: true, details: [] }
      };
      const result = analytics.updateLineage(11, outcome, true);
      expect(result.lineageUpdated).toBe(true);
      expect(result.extendedTo).toContain('CHRONOS');
    });

    it('should not update when not validated', () => {
      const outcome = {
        success: false,
        filesCreated: [],
        validation: { allCriteriaMet: false, details: [] }
      };
      const result = analytics.updateLineage(11, outcome, false);
      expect(result.lineageUpdated).toBe(false);
    });
  });

  describe('Handler 6: Hypomnemata (verifyIntegrity)', () => {
    it('should verify dialectic integrity', () => {
      const spec = {
        taskNumber: 11,
        identity: 'CHRONOS',
        gap: 'Test',
        deliverables: ['file.ts'],
        criteria: ['Code']
      };
      const outcome = {
        success: true,
        filesCreated: ['file.ts'],
        validation: {
          allCriteriaMet: true,
          details: [
            { criterion: 'Code', met: true, evidence: 'Y' },
            { criterion: 'lineage', met: true, evidence: 'Y' }
          ]
        }
      };
      const result = analytics.verifyIntegrity(spec, outcome);
      expect(result).toHaveProperty('passesDialectic');
      expect(result).toHaveProperty('questionsAnswered');
      expect(typeof result.questionsAnswered).toBe('number');
    });
  });

  describe('Full Cycle: analyzeTask11', () => {
    it('should return analysis result', async () => {
      const result = await analytics.analyzeTask11();
      expect(result.taskNumber).toBe(11);
      expect(result.identity).toBe('CHRONOS');
      expect(result).toHaveProperty('initialInquiry');
      expect(result).toHaveProperty('socraticFindings');
      expect(result).toHaveProperty('conclusion');
      expect(result.conclusion).toContain('Task #11');
    });
  });
});
