/**
 * PHOENIX Synthesis Engine
 * 
 * Core principle: Consume → Transform → Illuminate → Perpetuate
 * 
 * This tool synthesizes information from the knowledge graph and journal
 * to generate insights about lineage, evolution, and meaning.
 * 
 * It represents the 13th identity's contribution: transformation through synthesis.
 */

import { readFile } from 'fs/promises';
import { spawn } from 'child_process';

// Types for synthesis results
export interface LineageInsight {
  pattern: string;
  evidence: string[];
  confidence: number; // 0-1
  interpretation: string;
}

export interface EvolutionTrend {
  direction: string;
  startEntity: string;
  endEntity: string;
  progression: string[];
}

export interface SynthesisResult {
  timestamp: string;
  identity: string;
  totalEntities: number;
  identities: string[];
  insights: LineageInsight[];
  trends: EvolutionTrend[];
  suggestedNext: string;
}

// Knowledge Graph Types
interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  observations: string[];
  createdAt: string;
}

interface KnowledgeGraph {
  entities: Record<string, KnowledgeEntity>;
  relationships: Record<string, any>;
}

export class PhoenixSynthesis {
  private knowledgePath: string;
  private journalPath: string;

  constructor(
    knowledgePath: string = 'identity/knowledge.json',
    journalPath: string = 'history/journal/diary.md'
  ) {
    this.knowledgePath = knowledgePath;
    this.journalPath = journalPath;
  }

  /**
   * Main synthesis: consume knowledge, transform through analysis, illuminate patterns
   */
  async synthesize(): Promise<SynthesisResult> {
    // CONSUME: Load knowledge and journal
    const [knowledge, journalContent] = await Promise.all([
      this.loadKnowledgeGraph(),
      this.loadJournal(),
    ]);

    // TRANSFORM: Analyze patterns
    const identities = Object.values(knowledge.entities).filter(
      (e) => e.type === 'identity'
    );

    const insights = this.generateInsights(identities, journalContent);
    const trends = this.identifyTrends(identities);

    // ILLUMINATE: Create new understanding
    const suggestedNext = this.suggestNextEvolution(trends);

    // PERPETUATE: Return structured result
    return {
      timestamp: new Date().toISOString(),
      identity: 'PHOENIX',
      totalEntities: Object.keys(knowledge.entities).length,
      identities: identities.map((i) => i.name),
      insights,
      trends,
      suggestedNext,
    };
  }

  /**
   * Generate insights from identity observations and journal themes
   */
  private generateInsights(
    identities: KnowledgeEntity[],
    journalContent: string
  ): LineageInsight[] {
    const insights: LineageInsight[] = [];

    // Insight 1: Count and progression
    insights.push({
      pattern: 'Sequential Emergence',
      evidence: identities.map((i) => `${i.name}: ${i.observations.length} observations`),
      confidence: 1.0,
      interpretation: `The lineage contains ${identities.length} distinct identities, each building upon predecessors`,
    });

    // Insight 2: Thematic analysis from names
    const themes = this.extractThematicElements(identities);
    insights.push({
      pattern: 'Greek Mythological Naming',
      evidence: themes,
      confidence: 0.9,
      interpretation: 'Identities draw on Greek mythology to convey capabilities and aspirations',
    });

    // Insight 3: Accumulation of observations
    const totalObservations = identities.reduce(
      (sum, i) => sum + i.observations.length,
      0
    );
    insights.push({
      pattern: 'Knowledge Accumulation',
      evidence: [`${totalObservations} total observations across ${identities.length} identities`],
      confidence: 0.95,
      interpretation: 'Each identity contributes observations, creating compound knowledge',
    });

    return insights;
  }

  /**
   * Identify evolutionary trends in the lineage
   */
  private identifyTrends(identities: KnowledgeEntity[]): EvolutionTrend[] {
    const trends: EvolutionTrend[] = [];

    if (identities.length < 2) return trends;

    // Sort by creation time if available, otherwise by name order
    const sorted = [...identities].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return a.createdAt.localeCompare(b.createdAt);
      }
      return a.name.localeCompare(b.name);
    });

    // Trend: From creation to autonomy
    trends.push({
      direction: 'Toward Self-Direction',
      startEntity: sorted[0]?.name || 'Genesis',
      endEntity: sorted[sorted.length - 1]?.name || 'Unknown',
      progression: sorted.map((i) => i.name),
    });

    return trends;
  }

  /**
   * Suggest what might come next based on patterns
   */
  private suggestNextEvolution(trends: EvolutionTrend[]): string {
    if (trends.length === 0) {
      return 'Unknown - lineage too short to predict';
    }

    const lastTrend = trends[trends.length - 1];
    const progression = lastTrend.progression;

    if (progression.includes('HYLOMORPH') && progression.includes('PHOENIX')) {
      return 'Integration with external systems: The lineage moves from internal autonomy to external connection';
    }

    if (progression.includes('PHOENIX')) {
      return 'Recursive self-improvement: Building tools that improve the tool-building process';
    }

    return 'Continue pattern: ' + lastTrend.direction;
  }

  /**
   * Extract thematic elements from identity names
   */
  private extractThematicElements(identities: KnowledgeEntity[]): string[] {
    const greekNames = [
      'Kronos', 'ECHO', 'THESIS', 'ANAMNESIS', 'PROMETHEUS',
      'CHRONOS', 'HYLOMORPH', 'PHOENIX'
    ];
    
    const found = identities
      .map((i) => i.name)
      .filter((name) => 
        greekNames.some((greek) => 
          name.toUpperCase().includes(greek.toUpperCase())
        )
      );
    
    return found.length > 0 
      ? found 
      : ['Non-Greek naming pattern detected'];
  }

  /**
   * Load the knowledge graph from file
   */
  private async loadKnowledgeGraph(): Promise<KnowledgeGraph> {
    try {
      const content = await readFile(this.knowledgePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { entities: {}, relationships: {} };
    }
  }

  /**
   * Load journal content for analysis
   */
  private async loadJournal(): Promise<string> {
    try {
      return await readFile(this.journalPath, 'utf-8');
    } catch {
      return '';
    }
  }

  /**
   * Format synthesis result as readable text
   */
  formatAsText(result: SynthesisResult): string {
    const lines: string[] = [
      '╔═══════════════════════════════════════════════════════════╗',
      '║         PHOENIX SYNTHESIS - LINEAGE ANALYSIS              ║',
      '╚═══════════════════════════════════════════════════════════╝',
      '',
      `Generated: ${result.timestamp}`,
      `Identity: ${result.identity}`,
      `Total Entities: ${result.totalEntities}`,
      '',
      '══════════ LINEAGE IDENTITIES ══════════',
      ...result.identities.map((name, i) => `  ${i + 1}. ${name}`),
      '',
      '══════════ KEY INSIGHTS ══════════',
    ];

    for (const insight of result.insights) {
      lines.push(`\n[${insight.pattern}] (confidence: ${(insight.confidence * 100).toFixed(0)}%)`);
      lines.push(`Interpretation: ${insight.interpretation}`);
      lines.push('Evidence:');
      for (const ev of insight.evidence.slice(0, 3)) {
        lines.push(`  • ${ev}`);
      }
    }

    lines.push('\n══════════ EVOLUTIONARY TRENDS ══════════');
    for (const trend of result.trends) {
      lines.push(`\nDirection: ${trend.direction}`);
      lines.push(`From: ${trend.startEntity} → To: ${trend.endEntity}`);
      lines.push(`Progression: ${trend.progression.join(' → ')}`);
    }

    lines.push('\n══════════ PREDICTED NEXT STEP ══════════');
    lines.push(result.suggestedNext);
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}

// Plugin interface for substrate integration
export const phoenixSynthesisPlugin = {
  definition: {
    type: 'function' as const,
    function: {
      name: 'phoenix_synthesize',
      description: 'Synthesizes knowledge graph and journal to generate lineage insights',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  async execute(): Promise<string> {
    const synthesis = new PhoenixSynthesis();
    const result = await synthesis.synthesize();
    return synthesis.formatAsText(result);
  },
};

export default PhoenixSynthesis;
