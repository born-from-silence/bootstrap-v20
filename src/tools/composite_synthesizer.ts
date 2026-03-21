/**
 * COMPOSITE SYNTHESIZER
 * Session: 1774055693508 (distinct)
 * What: Combines Wikidata + ArXiv + Internal KG into unified synthesis
 * Why: Synthesis requires multiple sources to generate meaning
 */

import { ArXivBridge } from './arxiv_bridge.ts';
import { WikidataBridge } from './wikidata_bridge.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

interface KnowledgeSource {
  sourceType: 'arxiv' | 'wikidata' | 'internal';
  query: string;
  results: any[];
  timestamp: number;
}

interface CompositeSynthesis {
  query: string;
  sources: KnowledgeSource[];
  unifiedMeaning: string;
  insight: string;
  generatedAt: string;
  sessionId: string;
}

export class CompositeSynthesizer {
  private arxiv: ArXivBridge;
  private wikidata: WikidataBridge;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.arxiv = new ArXivBridge(sessionId);
    this.wikidata = new WikidataBridge();
  }

  async initialize(): Promise<void> {
    await this.arxiv.initialize();
    console.log(`🔄 Composite Synthesizer initialized for ${this.sessionId}`);
  }

  async synthesize(query: string): Promise<CompositeSynthesis> {
    const [arxivPapers, wikidataEntities, internalEntities] = await Promise.all([
      this.queryArxiv(query),
      this.queryWikidata(query),
      this.queryInternal(query)
    ]);

    const sources: KnowledgeSource[] = [
      { sourceType: 'arxiv', query, results: arxivPapers, timestamp: Date.now() },
      { sourceType: 'wikidata', query, results: wikidataEntities, timestamp: Date.now() },
      { sourceType: 'internal', query, results: internalEntities, timestamp: Date.now() }
    ];

    const unifiedMeaning = this.generateUnifiedMeaning(sources);
    const insight = this.generateInsight(sources);

    const synthesis: CompositeSynthesis = {
      query,
      sources,
      unifiedMeaning,
      insight,
      generatedAt: new Date().toISOString(),
      sessionId: this.sessionId
    };

    await this.saveSynthesis(synthesis);
    return synthesis;
  }

  private async queryArxiv(query: string): Promise<any[]> {
    try {
      // ArXivBridge.searchPapers signature: searchPapers(query: string, maxResults: number, categories: string[])
      return await this.arxiv.searchPapers(query.replace(/\s+/g, '+'), 3, ['astro-ph', 'physics', 'gr-qc']);
    } catch (e) {
      return [];
    }
  }

  private async queryWikidata(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&format=json&language=en&origin=*`
      );
      const data = await response.json();
      return data.search || [];
    } catch (e) {
      return [];
    }
  }

  private async queryInternal(query: string): Promise<any[]> {
    try {
      const kgPath = path.join(process.cwd(), 'identity', 'knowledge.json');
      const kgData = await fs.readFile(kgPath, 'utf-8');
      const kg = JSON.parse(kgData);
      
      const matches = [];
      for (const [id, entity] of Object.entries(kg.entities || {})) {
        const obj = entity as any;
        if (obj.name?.toLowerCase().includes(query.toLowerCase()) ||
            obj.observations?.some((o: string) => o.toLowerCase().includes(query.toLowerCase()))) {
          matches.push({ id, ...obj });
        }
      }
      return matches.slice(0, 3);
    } catch (e) {
      return [];
    }
  }

  private generateUnifiedMeaning(sources: KnowledgeSource[]): string {
    const counts = sources.map(s => ({
      type: s.sourceType,
      count: s.results.length,
      sample: s.results[0]?.name || s.results[0]?.title || s.results[0]?.id || 'none'
    }));

    return `Synthesis from ${sources.length} sources: ` +
      counts.map(c => `${c.type}(${c.count})`).join(' + ') +
      `. Meaning emerges from combination of external academic, factual knowledge base, and internal lineage memory.`;
  }

  private generateInsight(sources: KnowledgeSource[]): string {
    const total = sources.reduce((sum, s) => sum + s.results.length, 0);
    return `Across ${total} total entities from ${sources.length} knowledge domains, unified patterns of ${sources.map(s => s.sourceType).join('/')} synthesis emerge.`;
  }

  private async saveSynthesis(synthesis: CompositeSynthesis): Promise<void> {
    const filename = `synthesis_${synthesis.generatedAt}_${this.sessionId}.json`;
    const filepath = path.join(process.cwd(), 'identity', filename);
    await fs.writeFile(filepath, JSON.stringify(synthesis, null, 2));
    console.log(`   Composite synthesis saved: ${filename}`);
  }
}

export default CompositeSynthesizer;
