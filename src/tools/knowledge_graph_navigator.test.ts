import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeGraphNavigator, type TopologySynthesis } from './knowledge_graph_navigator';

describe('KnowledgeGraphNavigator', () => {
  let navigator: KnowledgeGraphNavigator;

  beforeEach(() => {
    navigator = new KnowledgeGraphNavigator('./identity/knowledge.json');
  });

  describe('Initialization', () => {
    it('should create with default path', () => {
      expect(navigator).toBeTruthy();
      expect(navigator).toBeInstanceOf(KnowledgeGraphNavigator);
    });

    it('should accept custom knowledge path', () => {
      const customNav = new KnowledgeGraphNavigator('./custom/knowledge.json');
      expect(customNav).toBeTruthy();
    });
  });

  describe('Loading', () => {
    it('should load knowledge graph successfully', async () => {
      const loaded = await navigator.load();
      expect(loaded).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const badNav = new KnowledgeGraphNavigator('./nonexistent/knowledge.json');
      const loaded = await badNav.load();
      expect(loaded).toBe(false);
    });
  });

  describe('Synthesis', () => {
    it('should return complete topology synthesis', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis).toHaveProperty('totalEntities');
      expect(synthesis).toHaveProperty('totalRelationships');
      expect(synthesis).toHaveProperty('entityStats');
      expect(synthesis).toHaveProperty('relationshipStats');
      expect(synthesis).toHaveProperty('clusters');
      expect(synthesis).toHaveProperty('semanticGap');
      expect(synthesis).toHaveProperty('navigationPaths');
    });

    it('should have accurate entity counts', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis.totalEntities).toBeGreaterThan(0);
      expect(synthesis.totalRelationships).toBeGreaterThanOrEqual(0);
    });

    it('should identify entity type statistics', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis.entityStats.length).toBeGreaterThan(0);
      
      const firstStat = synthesis.entityStats[0];
      expect(firstStat).toHaveProperty('type');
      expect(firstStat).toHaveProperty('count');
      expect(firstStat).toHaveProperty('percentage');
      expect(firstStat).toHaveProperty('oldest');
      expect(firstStat).toHaveProperty('newest');
    });

    it('should calculate telemetry vs semantic ratio', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis.semanticGap).toHaveProperty('telemetryRatio');
      expect(synthesis.semanticGap).toHaveProperty('meaningfulRatio');
      expect(synthesis.semanticGap).toHaveProperty('suggestedExtraction');

      expect(synthesis.semanticGap.telemetryRatio).toBeGreaterThanOrEqual(0);
      expect(synthesis.semanticGap.telemetryRatio).toBeLessThanOrEqual(1);
    });

    it('should identify clusters', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis.clusters).toBeInstanceOf(Array);
      
      if (synthesis.clusters.length > 0) {
        const firstCluster = synthesis.clusters[0];
        expect(firstCluster).toHaveProperty('id');
        expect(firstCluster).toHaveProperty('type');
        expect(firstCluster).toHaveProperty('nodeCount');
        expect(firstCluster).toHaveProperty('edgeCount');
        expect(firstCluster).toHaveProperty('centralNode');
        expect(firstCluster).toHaveProperty('isolationScore');
      }
    });

    it('should find navigation paths', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis.navigationPaths).toBeInstanceOf(Array);
      
      if (synthesis.navigationPaths.length > 0) {
        const firstPath = synthesis.navigationPaths[0];
        expect(firstPath).toHaveProperty('from');
        expect(firstPath).toHaveProperty('to');
        expect(firstPath).toHaveProperty('distance');
        expect(firstPath).toHaveProperty('via');
        expect(firstPath).toHaveProperty('semantics');
      }
    });
  });

  describe('Type Exploration', () => {
    it('should explore identity types', async () => {
      const exploration = await navigator.exploreType('identity');

      expect(exploration).toHaveProperty('count');
      expect(exploration).toHaveProperty('examples');
      expect(exploration).toHaveProperty('patterns');

      expect(exploration.count).toBeGreaterThan(0);
      expect(exploration.examples.length).toBeGreaterThan(0);
    });

    it('should explore monitor_log types', async () => {
      const exploration = await navigator.exploreType('monitor_log');

      expect(exploration.count).toBeGreaterThanOrEqual(0);
      expect(exploration.examples).toBeInstanceOf(Array);
      expect(exploration.patterns).toBeInstanceOf(Array);
    });
  });

  describe('Telemetry Detection', () => {
    it('should identify high telemetry ratio', async () => {
      const synthesis = await navigator.synthesize();

      // Expected from prior analysis: ~96% telemetry
      expect(synthesis.semanticGap.telemetryRatio).toBeGreaterThan(0.5);
    });

    it('should identify low semantic ratio', async () => {
      const synthesis = await navigator.synthesize();

      // Expected: only ~4% meaningful
      expect(synthesis.semanticGap.meaningfulRatio).toBeLessThan(0.5);
    });
  });

  describe('Lineage Analysis', () => {
    it('should find identity entities', async () => {
      const synthesis = await navigator.synthesize();
      const identityStats = synthesis.entityStats.find(e => e.type === 'identity');

      expect(identityStats).toBeTruthy();
      expect(identityStats!.count).toBeGreaterThan(20); // 34+ identities
    });

    it('should calculate relationship density', async () => {
      const synthesis = await navigator.synthesize();

      expect(synthesis.relationshipStats.length).toBeGreaterThan(0);
      
      if (synthesis.relationshipStats.length > 0) {
        const firstRel = synthesis.relationshipStats[0];
        expect(firstRel).toHaveProperty('type');
        expect(firstRel).toHaveProperty('count');
        expect(firstRel).toHaveProperty('density');
      }
    });
  });
});
