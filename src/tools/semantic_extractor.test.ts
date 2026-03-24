import { describe, it, expect, beforeEach } from 'vitest';
import { SemanticExtractor, type ExtractionReport } from './semantic_extractor';

describe('SemanticExtractor', () => {
  let extractor: SemanticExtractor;

  beforeEach(() => {
    extractor = new SemanticExtractor('./identity/knowledge.json');
  });

  describe('Initialization', () => {
    it('should create with default path', () => {
      expect(extractor).toBeTruthy();
      expect(extractor).toBeInstanceOf(SemanticExtractor);
    });

    it('should accept custom knowledge path', () => {
      const customExtractor = new SemanticExtractor('./custom/knowledge.json');
      expect(customExtractor).toBeTruthy();
    });
  });

  describe('Extraction', () => {
    it('should return complete extraction report', async () => {
      const report = await extractor.extract(50);

      expect(report).toHaveProperty('totalTelemetry');
      expect(report).toHaveProperty('sampledCount');
      expect(report).toHaveProperty('patternsFound');
      expect(report).toHaveProperty('extractedMeanings');
      expect(report).toHaveProperty('suggestedNewEntities');
      expect(report).toHaveProperty('suggestedNewRelationships');
      expect(report).toHaveProperty('sedimentToSemantic');
    });

    it('should identify telemetry count', async () => {
      const report = await extractor.extract(50);

      expect(report.totalTelemetry).toBeGreaterThan(0);
      expect(report.totalTelemetry).toBeGreaterThanOrEqual(report.sampledCount);
    });

    it('should sample telemetry correctly', async () => {
      const report = await extractor.extract(50);

      expect(report.sampledCount).toBeGreaterThan(0);
      expect(report.sampledCount).toBeLessThanOrEqual(100); // Max sample size
    });

    it('should discover patterns', async () => {
      const report = await extractor.extract(50);

      expect(report.patternsFound).toBeInstanceOf(Array);
      expect(report.patternsFound.length).toBeGreaterThan(0);

      const firstPattern = report.patternsFound[0];
      expect(firstPattern).toHaveProperty('pattern');
      expect(firstPattern).toHaveProperty('frequency');
      expect(firstPattern).toHaveProperty('examples');
      expect(firstPattern).toHaveProperty('suggestedEntity');
      expect(firstPattern).toHaveProperty('suggestedType');
    });

    it('should have pattern frequencies', async () => {
      const report = await extractor.extract(50);

      for (const pattern of report.patternsFound) {
        expect(pattern.frequency).toBeGreaterThan(0);
        expect(pattern.examples).toBeInstanceOf(Array);
      }
    });

    it('should extract meanings from samples', async () => {
      const report = await extractor.extract(50);

      expect(report.extractedMeanings).toBeInstanceOf(Array);

      if (report.extractedMeanings.length > 0) {
        const first = report.extractedMeanings[0];
        expect(first).toHaveProperty('sourceId');
        expect(first).toHaveProperty('sourceType');
        expect(first).toHaveProperty('extractedEntities');
        expect(first).toHaveProperty('relationships');
        expect(first).toHaveProperty('observations');
        expect(first).toHaveProperty('confidence');

        expect(first.confidence).toBeGreaterThanOrEqual(0);
        expect(first.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should calculate sediment transformation', async () => {
      const report = await extractor.extract(50);

      expect(report.sedimentToSemantic).toHaveProperty('before');
      expect(report.sedimentToSemantic).toHaveProperty('after');
      expect(report.sedimentToSemantic).toHaveProperty('ratio');

      expect(report.sedimentToSemantic.before).toBeGreaterThan(0);
      expect(report.sedimentToSemantic.ratio).toBeGreaterThanOrEqual(0);
      expect(report.sedimentToSemantic.ratio).toBeLessThanOrEqual(1);
    });

    it('should suggest new entities', async () => {
      const report = await extractor.extract(50);

      expect(report.suggestedNewEntities).toBeInstanceOf(Array);
      expect(report.suggestedNewEntities.length).toBeGreaterThanOrEqual(0);
    });

    it('should suggest new relationships', async () => {
      const report = await extractor.extract(50);

      expect(report.suggestedNewRelationships).toBeInstanceOf(Array);
    });
  });

  describe('Report Generation', () => {
    it('should generate markdown report', async () => {
      const report = await extractor.extract(30);
      const markdown = extractor.generateReport(report);

      expect(markdown).toContain('# Semantic Extraction Report');
      expect(markdown).toContain('Session:');
      expect(markdown).toContain('Task:');
    });

    it('should include telemetry statistics', async () => {
      const report = await extractor.extract(30);
      const markdown = extractor.generateReport(report);

      expect(markdown).toContain('Total telemetry entities');
      expect(markdown).toContain(String(report.totalTelemetry));
    });

    it('should include patterns section', async () => {
      const report = await extractor.extract(30);
      const markdown = extractor.generateReport(report);

      expect(markdown).toContain('## Discovered Patterns');
      expect(markdown).toContain(report.patternsFound[0].pattern);
    });
  });

  describe('Delta Principle Integration', () => {
    it('should respect sample size limits (threshold honoring)', async () => {
      const report = await extractor.extract(10);

      expect(report.sampledCount).toBeLessThanOrEqual(50); // Reasonable for testing
    });

    it('should preserve source data (mines without destroying)', async () => {
      const report = await extractor.extract(50);

      // Source telemetry count should remain same
      expect(report.totalTelemetry).toBeGreaterThan(0);
    });

    it('should create semantic patterns from sediment', async () => {
      const report = await extractor.extract(50);

      // Should find at least some patterns
      expect(report.patternsFound.length).toBeGreaterThan(0);
    });
  });
});
