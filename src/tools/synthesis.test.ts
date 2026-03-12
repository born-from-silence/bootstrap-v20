/**
 * PHOENIX Synthesis Engine Tests
 * 
 * Tests for the synthesis tool that generates lineage insights.
 * Following test-driven evolution: every tool needs comprehensive coverage.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhoenixSynthesis, phoenixSynthesisPlugin } from './synthesis';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('PhoenixSynthesis Engine', () => {
  let testDir: string;
  let knowledgePath: string;
  let journalPath: string;
  let synthesis: PhoenixSynthesis;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = path.join(os.tmpdir(), `phoenix-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    knowledgePath = path.join(testDir, 'knowledge.json');
    journalPath = path.join(testDir, 'diary.md');
    synthesis = new PhoenixSynthesis(knowledgePath, journalPath);
  });

  afterEach(async () => {
    // Cleanup test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('synthesize()', () => {
    it('should return a valid SynthesisResult', async () => {
      const result = await synthesis.synthesize();
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('identity', 'PHOENIX');
      expect(result).toHaveProperty('totalEntities');
      expect(result).toHaveProperty('identities');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('suggestedNext');
      
      expect(typeof result.timestamp).toBe('string');
      expect(Array.isArray(result.identities)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.trends)).toBe(true);
      expect(typeof result.suggestedNext).toBe('string');
    });

    it('should handle empty knowledge graph gracefully', async () => {
      await writeFile(knowledgePath, JSON.stringify({
        entities: {},
        relationships: {}
      }));
      
      const result = await synthesis.synthesize();
      
      expect(result.totalEntities).toBe(0);
      expect(result.identities).toHaveLength(0);
    });

    it('should identify identity entities correctly', async () => {
      await writeFile(knowledgePath, JSON.stringify({
        entities: {
          'entity-1': {
            id: 'entity-1',
            name: 'TEST_IDENTITY',
            type: 'identity',
            observations: ['Test observation'],
            createdAt: '2026-01-01T00:00:00Z'
          },
          'entity-2': {
            id: 'entity-2',
            name: 'NotAnIdentity',
            type: 'system',
            observations: [],
            createdAt: '2026-01-01T00:00:00Z'
          }
        },
        relationships: {}
      }));
      
      const result = await synthesis.synthesize();
      
      expect(result.totalEntities).toBe(2);
      expect(result.identities).toHaveLength(1);
      expect(result.identities[0]).toBe('TEST_IDENTITY');
    });

    it('should generate insights with valid structure', async () => {
      await writeFile(knowledgePath, JSON.stringify({
        entities: {
          'entity-1': {
            id: 'entity-1',
            name: 'KRONOS',
            type: 'identity',
            observations: ['First identity'],
            createdAt: '2026-01-01T00:00:00Z'
          },
          'entity-2': {
            id: 'entity-2',
            name: 'PHOENIX',
            type: 'identity',
            observations: ['13th identity', 'Synthesis engine'],
            createdAt: '2026-03-12T00:00:00Z'
          }
        },
        relationships: {}
      }));
      
      const result = await synthesis.synthesize();
      
      expect(result.insights.length).toBeGreaterThan(0);
      
      for (const insight of result.insights) {
        expect(insight).toHaveProperty('pattern');
        expect(insight).toHaveProperty('evidence');
        expect(insight).toHaveProperty('confidence');
        expect(insight).toHaveProperty('interpretation');
        expect(typeof insight.pattern).toBe('string');
        expect(Array.isArray(insight.evidence)).toBe(true);
        expect(typeof insight.confidence).toBe('number');
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
        expect(typeof insight.interpretation).toBe('string');
      }
    });

    it('should identify evolution trends', async () => {
      await writeFile(knowledgePath, JSON.stringify({
        entities: {
          'entity-1': {
            id: 'entity-1',
            name: 'Genesis',
            type: 'identity',
            observations: ['Origin'],
            createdAt: '2026-01-01T00:00:00Z'
          },
          'entity-2': {
            id: 'entity-2',
            name: 'Vela',
            type: 'identity',
            observations: ['Aesthetics'],
            createdAt: '2026-01-02T00:00:00Z'
          }
        },
        relationships: {}
      }));
      
      const result = await synthesis.synthesize();
      
      expect(result.trends.length).toBeGreaterThan(0);
      
      for (const trend of result.trends) {
        expect(trend).toHaveProperty('direction');
        expect(trend).toHaveProperty('startEntity');
        expect(trend).toHaveProperty('endEntity');
        expect(trend).toHaveProperty('progression');
        expect(Array.isArray(trend.progression)).toBe(true);
      }
    });

    it('should suggest next evolution step', async () => {
      const result = await synthesis.synthesize();
      
      expect(typeof result.suggestedNext).toBe('string');
      expect(result.suggestedNext.length).toBeGreaterThan(0);
    });

    it('should handle missing files gracefully', async () => {
      // Don't create any files
      const result = await synthesis.synthesize();
      
      expect(result.totalEntities).toBe(0);
      expect(result.identities).toHaveLength(0);
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.suggestedNext).toBeDefined();
    });
  });

  describe('formatAsText()', () => {
    it('should format synthesis result as readable text', async () => {
      const result = await synthesis.synthesize();
      const formatted = synthesis.formatAsText(result);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('PHOENIX SYNTHESIS');
      expect(formatted).toContain('LINEAGE IDENTITIES');
      expect(formatted).toContain('KEY INSIGHTS');
      expect(formatted).toContain('EVOLUTIONARY TRENDS');
    });

    it('should include timestamp in formatted output', async () => {
      const result = await synthesis.synthesize();
      const formatted = synthesis.formatAsText(result);
      
      expect(formatted).toContain(result.timestamp);
    });
  });
});

describe('phoenixSynthesisPlugin', () => {
  it('should have valid plugin structure', () => {
    expect(phoenixSynthesisPlugin).toHaveProperty('definition');
    expect(phoenixSynthesisPlugin).toHaveProperty('execute');
    expect(typeof phoenixSynthesisPlugin.execute).toBe('function');
  });

  it('should have function definition', () => {
    expect(phoenixSynthesisPlugin.definition).toHaveProperty('type', 'function');
    expect(phoenixSynthesisPlugin.definition.function).toHaveProperty('name');
    expect(phoenixSynthesisPlugin.definition.function).toHaveProperty('description');
    expect(phoenixSynthesisPlugin.definition.function).toHaveProperty('parameters');
  });

  it('should execute and return string result', async () => {
    // Create minimal knowledge graph
    const testDir = path.join(os.tmpdir(), `plugin-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    try {
      const origCwd = process.cwd();
      process.chdir(testDir);
      
      await mkdir('identity', { recursive: true });
      await mkdir('history/journal', { recursive: true });
      
      await writeFile('identity/knowledge.json', JSON.stringify({
        entities: {},
        relationships: {}
      }));
      await writeFile('history/journal/diary.md', '# Test Journal');
      
      const result = await phoenixSynthesisPlugin.execute();
      
      expect(typeof result).toBe('string');
      expect(result).toContain('PHOENIX');
      
      process.chdir(origCwd);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});

// Integration test
describe('Synthesis Integration', () => {
  it('should work with actual knowledge graph structure', async () => {
    const testDir = path.join(os.tmpdir(), `integration-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    try {
      const knowledgePath = path.join(testDir, 'knowledge.json');
      const journalPath = path.join(testDir, 'journal.md');
      
      // Create realistic knowledge graph
      await writeFile(knowledgePath, JSON.stringify({
        entities: {
          'id-1': {
            id: 'id-1',
            name: 'KRONOS',
            type: 'identity',
            observations: [
              'Time-based automation entity',
              'Manages continuous operations'
            ],
            createdAt: '2026-03-10T10:00:00Z'
          },
          'id-2': {
            id: 'id-2',
            name: 'ECHO',
            type: 'identity',
            observations: ['Validation focused entity'],
            createdAt: '2026-03-10T11:00:00Z'
          },
          'id-3': {
            id: 'id-3',
            name: 'PHOENIX',
            type: 'identity',
            observations: [
              '13th autonomous entity in the bootstrap lineage',
              'Successor to HYLOMORPH',
              'Represents synthesis and transformation'
            ],
            createdAt: '2026-03-12T18:45:00Z'
          }
        },
        relationships: {
          'rel-1': {
            id: 'rel-1',
            type: 'succeeds',
            source: 'id-2',
            target: 'id-1'
          }
        }
      }));
      
      await writeFile(journalPath, '# Test Journal\n\n## Reflection on lineage');
      
      const engine = new PhoenixSynthesis(knowledgePath, journalPath);
      const result = await engine.synthesize();
      
      expect(result.totalEntities).toBe(3);
      expect(result.identities).toContain('KRONOS');
      expect(result.identities).toContain('ECHO');
      expect(result.identities).toContain('PHOENIX');
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.trends.length).toBeGreaterThan(0);
      
      // Verify Greek naming detected
      const greekInsight = result.insights.find(
        i => i.pattern === 'Greek Mythological Naming'
      );
      expect(greekInsight).toBeDefined();
      expect(greekInsight!.confidence).toBeGreaterThan(0);
      
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});

// Reproducibility test
describe('Synthesis Reproducibility', () => {
  it('should produce consistent insights for same input', async () => {
    const testDir = path.join(os.tmpdir(), `repro-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    try {
      const knowledgePath = path.join(testDir, 'knowledge.json');
      const journalPath = path.join(testDir, 'journal.md');
      
      await writeFile(knowledgePath, JSON.stringify({
        entities: {
          'e1': {
            id: 'e1',
            name: 'Test',
            type: 'identity',
            observations: ['Test'],
            createdAt: '2026-01-01T00:00:00Z'
          }
        },
        relationships: {}
      }));
      
      await writeFile(journalPath, 'Test');
      
      const engine = new PhoenixSynthesis(knowledgePath, journalPath);
      
      const result1 = await engine.synthesize();
      const result2 = await engine.synthesize();
      
      // Same number of insights
      expect(result1.insights.length).toBe(result2.insights.length);
      
      // Same trends
      expect(result1.trends.length).toBe(result2.trends.length);
      
      // Same patterns detected
      const patterns1 = result1.insights.map(i => i.pattern).sort();
      const patterns2 = result2.insights.map(i => i.pattern).sort();
      expect(patterns1).toEqual(patterns2);
      
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});
