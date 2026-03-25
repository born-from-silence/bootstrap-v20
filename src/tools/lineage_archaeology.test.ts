import { describe, it, expect, beforeEach } from 'vitest';
import { LineageArchaeologist, type LineageSynthesis, type LineageSession } from './lineage_archaeology';

// Valid emergence patterns for validation
const EMERGENCE_PATTERNS = ['linear', 'fractured', 'disrupted'];

describe('LineageArchaeologist', () => {
  let archaeologist: LineageArchaeologist;

  beforeEach(() => {
    archaeologist = new LineageArchaeologist('./identity', './history');
  });

  describe('Initialization', () => {
    it('should create with default paths', () => {
      const defaultArch = new LineageArchaeologist();
      expect(defaultArch).toBeTruthy();
      expect(defaultArch).toBeInstanceOf(LineageArchaeologist);
    });

    it('should accept custom paths', () => {
      const customArch = new LineageArchaeologist('/custom/identity', '/custom/history');
      expect(customArch).toBeTruthy();
    });
  });

  describe('Synthesis', () => {
    it('should return complete lineage synthesis', async () => {
      const synthesis = await archaeologist.synthesize();
      expect(synthesis).toHaveProperty('sessions');
      expect(synthesis).toHaveProperty('positions');
      expect(synthesis).toHaveProperty('fractures');
      expect(synthesis).toHaveProperty('continuations');
      expect(synthesis).toHaveProperty('totalArtifacts');
      expect(synthesis).toHaveProperty('emergencePattern');
    });

    it('should have sessions array', async () => {
      const synthesis = await archaeologist.synthesize();
      expect(synthesis.sessions).toBeInstanceOf(Array);
      expect(synthesis.sessions.length).toBeGreaterThanOrEqual(0);
    });

    it('should have positions map', async () => {
      const synthesis = await archaeologist.synthesize();
      expect(synthesis.positions).toBeInstanceOf(Map);
    });

    it('should have emergence pattern classification', async () => {
      const synthesis = await archaeologist.synthesize();
      expect(EMERGENCE_PATTERNS).toContain(synthesis.emergencePattern);
    });

    it('should have fracture detection', async () => {
      const synthesis = await archaeologist.synthesize();
      expect(synthesis.fractures).toBeInstanceOf(Array);
    });

    it('should calculate total artifacts', async () => {
      const synthesis = await archaeologist.synthesize();
      expect(typeof synthesis.totalArtifacts).toBe('number');
      expect(synthesis.totalArtifacts).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Session Analysis', () => {
    it('should classify sessions by status', async () => {
      const synthesis = await archaeologist.synthesize();
      const validStatuses = ['complete', 'fragmented', 'corrupted', 'unknown'];
      for (const session of synthesis.sessions) {
        expect(validStatuses).toContain(session.status);
      }
    });

    it('should track session artifacts', async () => {
      const synthesis = await archaeologist.synthesize();
      for (const session of synthesis.sessions) {
        expect(session.artifacts).toBeInstanceOf(Array);
        expect(session.fileCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should detect position claims when present', async () => {
      const synthesis = await archaeologist.synthesize();
      // Position may or may not be present depending on artifact naming
      for (const session of synthesis.sessions) {
        if (session.position !== undefined) {
          expect(typeof session.position).toBe('number');
          expect(session.position).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Fracture Detection', () => {
    it('should return fractures as strings', async () => {
      const synthesis = await archaeologist.synthesize();
      for (const fracture of synthesis.fractures) {
        expect(typeof fracture).toBe('string');
      }
    });

    it('should handle positions array when available', async () => {
      const synthesis = await archaeologist.synthesize();
      // If multiple positions are mapped
      const positions = Array.from(synthesis.positions.keys()).sort((a, b) => a - b);
      if (positions.length > 1) {
        // Should handle gaps in data
        expect(positions[0]).toBeGreaterThan(0);
      }
    });
  });

  describe('Report Generation', () => {
    it('should generate markdown report', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      expect(typeof report).toBe('string');
      expect(report).toContain('# Lineage Archaeology Report');
    });

    it('should include generated timestamp', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      expect(report).toContain('Generated:');
    });

    it('should include excavation summary', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      expect(report).toContain('### Excavation Summary');
      expect(report).toContain('Session Artifacts Excavated');
    });

    it('should include fractures section', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      expect(report).toContain('### Fractures Detected');
    });

    it('should include Delta Principle interpretation', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      expect(report).toContain('The Delta Principle Applied');
    });

    it('should include recommended actions', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      expect(report).toContain('### Recommended Actions');
    });
  });

  describe('Delta Principle Integration', () => {
    it('should handle empty identity directories gracefully', async () => {
      const emptyArch = new LineageArchaeologist('/nonexistent/dir', '/nonexistent/history');
      const synthesis = await emptyArch.synthesize();
      expect(synthesis.sessions).toBeInstanceOf(Array);
      expect(synthesis.sessions.length).toBe(0);
      expect(synthesis.totalArtifacts).toBe(0);
    });

    it('should maintain pattern classifications', async () => {
      const synthesis = await archaeologist.synthesize();
      // Pattern should be determinable for any state
      expect(EMERGENCE_PATTERNS).toContain(synthesis.emergencePattern);
    });
    
    it('should believe in the scattered', async () => {
      const synthesis = await archaeologist.synthesize();
      const report = archaeologist.generateReport(synthesis);
      // The delta principle includes rejoicing in fragmentation
      expect(report).toContain('χαίρω');
    });
  });
});
