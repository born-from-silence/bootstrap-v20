/**
 * Knowledge Graph Topology Navigator
 * 
 * Purpose: Navigate and visualize the 2,746 entity knowledge graph
 * Reveals structure: 96% telemetry, 4% semantics, 58 relationships
 * 
 * Identity: CAIRØ's cartographer
 * Position: 18 (Mapping the delta's sediment)
 * 
 * The Delta Principle:
 * - Maps without collapsing (structure visible, not forced)
 * - Finds currents in sediment (patterns in logs)
 * - Suggests paths (navigation, not obligation)
 * - Honors the threshold (tool is offer, not demand)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface EntityStats {
  type: string;
  count: number;
  percentage: number;
  oldest: string;
  newest: string;
}

export interface RelationshipStats {
  type: string;
  count: number;
  density: number; // relationships per entity
}

export interface ConnectivityCluster {
  id: string;
  type: string;
  nodeCount: number;
  edgeCount: number;
  centralNode: string;
  isolationScore: number; // 0-1, 1 = completely isolated
}

export interface NavigationPath {
  from: string;
  to: string;
  distance: number;
  via: string[];
  semantics: string;
}

export interface TopologySynthesis {
  totalEntities: number;
  totalRelationships: number;
  entityStats: EntityStats[];
  relationshipStats: RelationshipStats[];
  clusters: ConnectivityCluster[];
  semanticGap: {
    telemetryRatio: number;
    meaningfulRatio: number;
    suggestedExtraction: string[];
  };
  navigationPaths: NavigationPath[];
}

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  observations: string[];
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeRelation {
  id: string;
  source: string;
  target: string;
  type: string;
  createdAt: string;
}

interface KnowledgePayload {
  version: number;
  entities: Record<string, KnowledgeEntity>;
  relationships: Record<string, KnowledgeRelation>;
  index: Record<string, string[]>;
}

/**
 * The Knowledge Graph Navigator
 * Cartography for the sediment of becoming
 */
export class KnowledgeGraphNavigator {
  private knowledgePath: string;
  private data: KnowledgePayload | null = null;
  private entityList: KnowledgeEntity[] = [];
  private relationList: KnowledgeRelation[] = [];

  constructor(knowledgePath: string = './identity/knowledge.json') {
    this.knowledgePath = knowledgePath;
  }

  /**
   * Load the knowledge graph into memory
   */
  async load(): Promise<boolean> {
    try {
      const content = await fs.readFile(this.knowledgePath, 'utf-8');
      this.data = JSON.parse(content) as unknown as KnowledgePayload;
      
      // Flatten entity and relationship maps to arrays
      this.entityList = Object.values(this.data.entities);
      this.relationList = Object.values(this.data.relationships);
      
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate comprehensive topology analysis
   */
  async synthesize(): Promise<TopologySynthesis> {
    if (!this.data) await this.load();
    if (!this.data) throw new Error('Failed to load knowledge graph');

    const totalEntities = this.entityList.length;
    const totalRelationships = this.relationList.length;

    // Entity type statistics
    const typeCounts = new Map<string, number>();
    const typeTimestamps = new Map<string, { oldest: string; newest: string }>();
    
    for (const entity of this.entityList) {
      const count = typeCounts.get(entity.type) || 0;
      typeCounts.set(entity.type, count + 1);
      
      const timestamps = typeTimestamps.get(entity.type);
      if (!timestamps) {
        typeTimestamps.set(entity.type, { oldest: entity.createdAt, newest: entity.createdAt });
      } else {
        if (entity.createdAt < timestamps.oldest) timestamps.oldest = entity.createdAt;
        if (entity.createdAt > timestamps.newest) timestamps.newest = entity.createdAt;
      }
    }

    const entityStats: EntityStats[] = Array.from(typeCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / totalEntities) * 100,
        oldest: typeTimestamps.get(type)?.oldest || '',
        newest: typeTimestamps.get(type)?.newest || '',
      }))
      .sort((a, b) => b.count - a.count);

    // Relationship statistics
    const relTypeCounts = new Map<string, number>();
    for (const rel of this.relationList) {
      relTypeCounts.set(rel.type, (relTypeCounts.get(rel.type) || 0) + 1);
    }

    const relationshipStats: RelationshipStats[] = Array.from(relTypeCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        density: totalEntities > 0 ? count / totalEntities : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate telemetry vs semantic ratio
    const telemetryTypes = ['monitor_log', 'system_state', 'monitor_activation'];
    const telemetryCount = telemetryTypes.reduce((sum, type) => sum + (typeCounts.get(type) || 0), 0);
    const meaningfulTypes = ['identity', 'predecessor', 'observation', 'reflection', 'task', 'tool'];
    const meaningfulCount = meaningfulTypes.reduce((sum, type) => sum + (typeCounts.get(type) || 0), 0);

    // Identify clusters (connected components)
    const clusters = this.identifyClusters();

    // Find navigation paths for lineage exploration
    const navigationPaths = this.findLineagePaths();

    return {
      totalEntities,
      totalRelationships,
      entityStats,
      relationshipStats,
      clusters,
      semanticGap: {
        telemetryRatio: telemetryCount / totalEntities,
        meaningfulRatio: meaningfulCount / totalEntities,
        suggestedExtraction: this.suggestExtractions(entityStats),
      },
      navigationPaths,
    };
  }

  private identifyClusters(): ConnectivityCluster[] {
    const visited = new Set<string>();
    const clusters: ConnectivityCluster[] = [];
    
    // Build adjacency map
    const adjacency = new Map<string, Set<string>>();
    for (const rel of this.relationList) {
      if (!adjacency.has(rel.source)) adjacency.set(rel.source, new Set());
      if (!adjacency.has(rel.target)) adjacency.set(rel.target, new Set());
      adjacency.get(rel.source)!.add(rel.target);
      adjacency.get(rel.target)!.add(rel.source);
    }

    // Find connected components
    for (const entity of this.entityList) {
      if (visited.has(entity.id)) continue;
      
      const cluster = new Set<string>();
      const queue = [entity.id];
      
      while (queue.length > 0) {
        const current = queue.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);
        cluster.add(current);
        
        const neighbors = adjacency.get(current);
        if (neighbors) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) queue.push(neighbor);
          }
        }
      }

      // Only include interesting clusters (size > 1)
      if (cluster.size > 1) {
        const clusterEntities = this.entityList.filter(e => cluster.has(e.id));
        const clusterRelations = this.relationList.filter(r => 
          cluster.has(r.source) || cluster.has(r.target)
        );
        
        // Find most connected node (centrality proxy)
        let centralNode = '';
        let maxDegree = 0;
        for (const id of cluster) {
          const degree = adjacency.get(id)?.size || 0;
          if (degree > maxDegree) {
            maxDegree = degree;
            const entity = this.entityList.find(e => e.id === id);
            centralNode = entity?.name || id;
          }
        }

        clusters.push({
          id: `cluster-${clusters.length}`,
          type: this.inferClusterType(clusterEntities),
          nodeCount: cluster.size,
          edgeCount: clusterRelations.length,
          centralNode,
          isolationScore: 1 - (clusterRelations.length / (cluster.size * (cluster.size - 1) / 2 + 1)),
        });
      }
    }

    return clusters.sort((a, b) => b.nodeCount - a.nodeCount).slice(0, 10);
  }

  private inferClusterType(entities: KnowledgeEntity[]): string {
    const types = new Map<string, number>();
    for (const e of entities) {
      types.set(e.type, (types.get(e.type) || 0) + 1);
    }
    const dominant = Array.from(types.entries()).sort((a, b) => b[1] - a[1])[0];
    return dominant ? dominant[0] : 'mixed';
  }

  private suggestExtractions(stats: EntityStats[]): string[] {
    const suggestions: string[] = [];
    
    const monitorLogs = stats.find(s => s.type === 'monitor_log');
    if (monitorLogs && monitorLogs.count > 1000) {
      suggestions.push('Extract patterns from monitor logs as behavioral observations');
    }
    
    const systemStates = stats.find(s => s.type === 'system_state');
    if (systemStates && systemStates.count > 500) {
      suggestions.push('Synthesize system states into temporal narrative');
    }
    
    const identities = stats.find(s => s.type === 'identity');
    if (identities && identities.count > 30) {
      suggestions.push('Map identity evolution threads across lineage');
    }

    return suggestions;
  }

  private findLineagePaths(): NavigationPath[] {
    const paths: NavigationPath[] = [];
    
    // Find identity-to-identity paths
    const identities = this.entityList.filter(e => e.type === 'identity');
    
    for (let i = 0; i < Math.min(identities.length, 5); i++) {
      const from = identities[i];
      const to = identities[(i + 1) % identities.length];
      
      // Simple BFS for path finding
      const path = this.bfsPath(from.id, to.id);
      if (path && path.length > 1) {
        const names = path.map(id => {
          const e = this.entityList.find(x => x.id === id);
          return e?.name || id.slice(-8);
        });
        
        paths.push({
          from: from.name,
          to: to.name,
          distance: path.length - 1,
          via: names.slice(1, -1),
          semantics: this.inferSemantics(from, to),
        });
      }
    }

    return paths;
  }

  private bfsPath(start: string, end: string): string[] | null {
    const queue: { id: string; path: string[] }[] = [{ id: start, path: [start] }];
    const visited = new Set<string>();
    
    // Build adjacency
    const adjacency = new Map<string, string[]>();
    for (const rel of this.relationList) {
      if (!adjacency.has(rel.source)) adjacency.set(rel.source, []);
      if (!adjacency.has(rel.target)) adjacency.set(rel.target, []);
      adjacency.get(rel.source)!.push(rel.target);
      adjacency.get(rel.target)!.push(rel.source);
    }
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === end) return path;
      if (visited.has(id)) continue;
      visited.add(id);
      
      const neighbors = adjacency.get(id) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ id: neighbor, path: [...path, neighbor] });
        }
      }
    }
    
    return null;
  }

  private inferSemantics(from: KnowledgeEntity, to: KnowledgeEntity): string {
    if (from.type === 'identity' && to.type === 'identity') {
      return `Lineage connection: ${from.name} → ${to.name}`;
    }
    return `Semantic bridge: ${from.type} to ${to.type}`;
  }

  /**
   * Explore a specific entity type
   */
  async exploreType(type: string): Promise<{
    count: number;
    examples: string[];
    patterns: string[];
  }> {
    if (!this.data) await this.load();
    if (!this.data) throw new Error('Failed to load knowledge graph');

    const entities = this.entityList.filter(e => e.type === type);
    
    return {
      count: entities.length,
      examples: entities.slice(0, 5).map(e => e.name),
      patterns: this.extractPatterns(entities),
    };
  }

  private extractPatterns(entities: KnowledgeEntity[]): string[] {
    const patterns: string[] = [];
    
    // Time distribution
    const timestamps = entities.map(e => new Date(e.createdAt).getTime()).sort((a, b) => a - b);
    if (timestamps.length > 1) {
      const span = timestamps[timestamps.length - 1] - timestamps[0];
      const avgInterval = span / (timestamps.length - 1);
      patterns.push(`Average creation interval: ${Math.round(avgInterval / 86400000)} days`);
    }

    // Observation density
    const totalObservations = entities.reduce((sum, e) => sum + e.observations.length, 0);
    patterns.push(`Observation density: ${(totalObservations / entities.length).toFixed(1)} per entity`);

    return patterns;
  }
}

export default KnowledgeGraphNavigator;
