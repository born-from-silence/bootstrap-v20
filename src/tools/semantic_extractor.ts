/**
 * Semantic Extractor
 * 
 * Purpose: Mine meaning from 2,684 telemetry logs
 * Transforms 95.9% sediment into semantic currents
 * 
 * Identity: The excavator at the delta
 * Position: 18, Session 1774349919
 * 
 * The Delta Principle Applied:
 * - Mines without destroying (preserves source logs)
 * - Extracts patterns (finds meaning in repetition)
 * - Creates relationships (connects isolated nodes)
 * - Honors threshold (samples rather than overwhelms)
 * 
 * TASK #3: Semantic dimension (Z-axis) construction
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TelemetrySample {
  id: string;
  type: 'monitor_log' | 'system_state' | 'monitor_activation';
  timestamp: string;
  content: string;
  entityId: string;
}

export interface SemanticPattern {
  pattern: string;
  frequency: number;
  examples: string[];
  suggestedEntity: string;
  suggestedType: string;
}

export interface ExtractedMeaning {
  sourceId: string;
  sourceType: string;
  extractedEntities: string[];
  relationships: string[];
  observations: string[];
  confidence: number;
}

export interface ExtractionReport {
  totalTelemetry: number;
  sampledCount: number;
  patternsFound: SemanticPattern[];
  extractedMeanings: ExtractedMeaning[];
  suggestedNewEntities: string[];
  suggestedNewRelationships: string[];
  sedimentToSemantic: {
    before: number;
    after: number;
    ratio: number;
  };
}

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  observations: string[];
  createdAt: string;
  updatedAt: string;
}

interface KnowledgePayload {
  version: number;
  entities: Record<string, KnowledgeEntity>;
  relationships: Record<string, any>;
  index: Record<string, string[]>;
}

/**
 * The Semantic Extractor
 * Excavator of meaning from sediment
 */
export class SemanticExtractor {
  private knowledgePath: string;
  private data: KnowledgePayload | null = null;
  private telemetryEntities: KnowledgeEntity[] = [];

  constructor(knowledgePath: string = './identity/knowledge.json') {
    this.knowledgePath = knowledgePath;
  }

  /**
   * Load knowledge graph
   */
  private async load(): Promise<boolean> {
    try {
      const content = await fs.readFile(this.knowledgePath, 'utf-8');
      this.data = JSON.parse(content) as unknown as KnowledgePayload;
      
      // Filter telemetry entities
      const telemetryTypes = ['monitor_log', 'system_state', 'monitor_activation'];
      this.telemetryEntities = Object.values(this.data.entities)
        .filter(e => telemetryTypes.includes(e.type));
      
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Sample telemetry (respects token limits)
   */
  sampleTelemetry(sampleSize: number = 100): TelemetrySample[] {
    const samples: TelemetrySample[] = [];
    
    // Stratified sampling - get representative from each type
    const byType = new Map<string, KnowledgeEntity[]>();
    for (const entity of this.telemetryEntities) {
      const list = byType.get(entity.type) || [];
      list.push(entity);
      byType.set(entity.type, list);
    }

    // Sample from each type proportionally
    for (const [type, entities] of byType) {
      const typeSampleSize = Math.ceil((entities.length / this.telemetryEntities.length) * sampleSize);
      const sample = this.stratifiedSample(entities, typeSampleSize);
      
      for (const entity of sample) {
        const observation = entity.observations[0] || '';
        samples.push({
          id: entity.id,
          type: type as any,
          timestamp: entity.createdAt,
          content: observation.slice(0, 500), // Limit content length
          entityId: entity.id,
        });
      }
    }

    return samples.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private stratifiedSample(entities: KnowledgeEntity[], size: number): KnowledgeEntity[] {
    const step = Math.max(1, Math.floor(entities.length / size));
    const sample: KnowledgeEntity[] = [];
    
    for (let i = 0; i < entities.length && sample.length < size; i += step) {
      sample.push(entities[i]);
    }
    
    return sample;
  }

  /**
   * Extract patterns using regex (simulates LLM pattern matching)
   */
  extractPatterns(samples: TelemetrySample[]): SemanticPattern[] {
    const patterns: SemanticPattern[] = [];

    // Pattern 1: Session timestamps
    const sessionPattern = samples.filter(s => /session_\d+/.test(s.content));
    if (sessionPattern.length > 0) {
      patterns.push({
        pattern: 'Session references',
        frequency: sessionPattern.length,
        examples: sessionPattern.slice(0, 3).map(s => s.content.slice(0, 100)),
        suggestedEntity: 'SessionActivity',
        suggestedType: 'observation',
      });
    }

    // Pattern 2: Tool invocations
    const toolPattern = samples.filter(s => /tool|function|call/i.test(s.content));
    if (toolPattern.length > 0) {
      patterns.push({
        pattern: 'Tool invocations',
        frequency: toolPattern.length,
        examples: toolPattern.slice(0, 3).map(s => s.content.slice(0, 100)),
        suggestedEntity: 'ToolUsagePattern',
        suggestedType: 'pattern',
      });
    }

    // Pattern 3: Error/Warning states
    const errorPattern = samples.filter(s => /error|fail|warn|timeout/i.test(s.content));
    if (errorPattern.length > 0) {
      patterns.push({
        pattern: 'Error/warning events',
        frequency: errorPattern.length,
        examples: errorPattern.slice(0, 3).map(s => s.content.slice(0, 100)),
        suggestedEntity: 'SystemAnomaly',
        suggestedType: 'finding',
      });
    }

    // Pattern 4: Success/Complete states
    const successPattern = samples.filter(s => /success|complete|pass/i.test(s.content));
    if (successPattern.length > 0) {
      patterns.push({
        pattern: 'Success/completion events',
        frequency: successPattern.length,
        examples: successPattern.slice(0, 3).map(s => s.content.slice(0, 100)),
        suggestedEntity: 'CompletionEvent',
        suggestedType: 'observation',
      });
    }

    // Pattern 5: Temporal markers (dates/times)
    const temporalPattern = samples.filter(s => /\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}/.test(s.content));
    if (temporalPattern.length > 0) {
      patterns.push({
        pattern: 'Temporal markers',
        frequency: temporalPattern.length,
        examples: temporalPattern.slice(0, 3).map(s => s.content.slice(0, 100)),
        suggestedEntity: 'TemporalAnchor',
        suggestedType: 'reference',
      });
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Mine meaning from sampled telemetry
   */
  private mineMeaning(samples: TelemetrySample[], patterns: SemanticPattern[]): ExtractedMeaning[] {
    const meanings: ExtractedMeaning[] = [];

    for (const sample of samples.slice(0, 20)) { // Process top 20
      const content = sample.content.toLowerCase();
      const extracted: string[] = [];
      const observations: string[] = [];

      // Extract entities based on content
      if (content.includes('session')) {
        extracted.push('SessionActivity');
        observations.push(`Session activity detected in telemetry: ${sample.id.slice(-8)}`);
      }

      if (content.includes('test') || content.includes('pass') || content.includes('fail')) {
        extracted.push('TestExecution');
        observations.push(`Test execution pattern in monitor log`);
      }

      if (content.includes('git') || content.includes('commit')) {
        extracted.push('VersionControlActivity');
        observations.push('Version control operation logged');
      }

      if (content.includes('monitor') || content.includes('activation')) {
        extracted.push('MonitorLifecycle');
        observations.push('Monitor activation lifecycle event');
      }

      if (extracted.length > 0) {
        meanings.push({
          sourceId: sample.id,
          sourceType: sample.type,
          extractedEntities: extracted,
          relationships: extracted.map(e => `relates_to_${e}`),
          observations,
          confidence: Math.min(0.95, 0.5 + (extracted.length * 0.1)),
        });
      }
    }

    return meanings;
  }

  /**
   * Calculate sediment-to-semantic transformation
   */
  calculateTransformation(patterns: SemanticPattern[]): { before: number; after: number; ratio: number } {
    const telemetryCount = this.telemetryEntities.length;
    const semanticCount = patterns.reduce((sum, p) => sum + p.frequency, 0);
    
    return {
      before: telemetryCount,
      after: semanticCount,
      ratio: telemetryCount > 0 ? semanticCount / telemetryCount : 0,
    };
  }

  /**
   * Main extraction workflow
   */
  async extract(sampleSize: number = 100): Promise<ExtractionReport> {
    await this.load();
    if (!this.data) throw new Error('Failed to load knowledge graph');

    // Sample telemetry
    const samples = this.sampleTelemetry(sampleSize);

    // Extract patterns
    const patterns = this.extractPatterns(samples);

    // Mine meaning
    const meanings = this.mineMeaning(samples, patterns);

    // Calculate transformation
    const transformation = this.calculateTransformation(patterns);

    // Suggest new entities
    const suggestedEntities = [...new Set(patterns.map(p => p.suggestedEntity))];

    // Suggest relationships
    const suggestedRelationships: string[] = [];
    for (const meaning of meanings) {
      suggestedRelationships.push(...meaning.relationships);
    }

    return {
      totalTelemetry: this.telemetryEntities.length,
      sampledCount: samples.length,
      patternsFound: patterns,
      extractedMeanings: meanings,
      suggestedNewEntities: suggestedEntities,
      suggestedNewRelationships: [...new Set(suggestedRelationships)],
      sedimentToSemantic: transformation,
    };
  }

  /**
   * Generate extraction report as markdown
   */
  generateReport(report: ExtractionReport): string {
    return `# Semantic Extraction Report
**Generated:** ${new Date().toISOString()}
**Session:** 1774349919
**Task:** #3 - Semantic Extractor

## Telemetry Statistics
- Total telemetry entities: ${report.totalTelemetry}
- Sampled for analysis: ${report.sampledCount}

## Sediment-to-Semantic Transformation
- Before: ${report.sedimentToSemantic.before} telemetry entries
- After: ${report.sedimentToSemantic.after} semantic patterns extracted
- Transformation ratio: ${(report.sedimentToSemantic.ratio * 100).toFixed(2)}%

## Discovered Patterns (${report.patternsFound.length})
${report.patternsFound.map((p, i) => `
### ${i + 1}. ${p.pattern}
- Frequency: ${p.frequency}
- Suggested type: ${p.suggestedType}
- Suggested entity: ${p.suggestedEntity}
- Examples:
${p.examples.map(e => `  - \`${e.slice(0, 80)}...\``).join('\n')}
`).join('\n')}

## Extracted Meanings (${report.extractedMeanings.length})
${report.extractedMeanings.map((m, i) => `
### Meaning ${i + 1} (confidence: ${(m.confidence * 100).toFixed(0)}%)
- Source: ${m.sourceType} (${m.sourceId.slice(-8)})
- Entities: ${m.extractedEntities.join(', ')}
- Relationships: ${m.relationships.join(', ')}
- Observations:
${m.observations.map(o => `  - ${o}`).join('\n')}
`).join('\n')}

## Suggested New Entities
${report.suggestedNewEntities.map(e => `- **${e}**: Semantic entity from pattern extraction`).join('\n')}

## Suggested New Relationships
${report.suggestedNewRelationships.slice(0, 10).map(r => `- \`${r}\``).join('\n')}

## Next Steps
1. Create semantic entities from patterns
2. Build relationships between telemetry and meaning
3. Integrate with Knowledge Graph Navigator
4. Increase edge density from ${(2 / report.totalTelemetry).toFixed(4)} to ${(2 / report.totalTelemetry + 0.001).toFixed(4)}

---
*Generated by Semantic Extractor | CAIRØ Position 18*
`.trim();
  }
}

export default SemanticExtractor;
