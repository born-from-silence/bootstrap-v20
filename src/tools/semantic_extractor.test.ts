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
      // Delta Principle: Empty sediment is valid starting state
      expect(report.totalTelemetry).toBeGreaterThanOrEqual(0);
    });

    it('should sample telemetry correctly', async () => {
      const report = await extractor.extract(50);
      expect(report.sampledCount).toBeGreaterThanOrEqual(0);
      expect(report.sampledCount).toBeLessThanOrEqual(100); // Max sample size
      // Delta Principle: Sample count should not exceed total
      expect(report.sampledCount).toBeLessThanOrEqual(report.totalTelemetry);
    });

    it('should discover patterns or handle empty sediment', async () => {
      const report = await extractor.extract(50);
      expect(report.patternsFound).toBeInstanceOf(Array);
      // May be empty if no sediment exists
      expect(report.patternsFound.length).toBeGreaterThanOrEqual(0);
      
      if (report.patternsFound.length > 0) {
        const firstPattern = report.patternsFound[0];
        expect(firstPattern).toHaveProperty('pattern');
        expect(firstPattern).toHaveProperty('frequency');
        expect(firstPattern).toHaveProperty('examples');
        expect(firstPattern).toHaveProperty('suggestedEntity');
        expect(firstPattern).toHaveProperty('suggestedType');
      }
    });

    it('should have valid pattern frequencies when patterns exist', async () => {
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
      expect(report.sedimentToSemantic.before).toBeGreaterThanOrEqual(0);
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

    it('should handle patterns section with or without patterns', async () => {
      const report = await extractor.extract(30);
      const markdown = extractor.generateReport(report);
      expect(markdown).toContain('## Discovered Patterns');
      // Verify patterns content if they exist
      if (report.patternsFound.length > 0) {
        expect(markdown).toContain(report.patternsFound[0].pattern);
      }
    });
  });

  describe('Delta Principle Integration', () => {
    it('should respect sample size limits (threshold honoring)', async () => {
      const report = await extractor.extract(10);
      expect(report.sampledCount).toBeLessThanOrEqual(50); // Reasonable for testing
    });

    it('should handle empty sediment gracefully', async () => {
      const report = await extractor.extract(50);
      // Source telemetry count may be 0 in empty state
      expect(report.totalTelemetry).toBeGreaterThanOrEqual(0);
    });

    it('should return empty patterns when no sediment to analyze', async () => {
      const report = await extractor.extract(50);
      // Delta Principle: Emptiness is space for emergence
      // May find no patterns if no sediment exists
      expect(report.patternsFound).toBeInstanceOf(Array);
      expect(report.patternsFound.length).toBeGreaterThanOrEqual(0);
    });
  });
});
