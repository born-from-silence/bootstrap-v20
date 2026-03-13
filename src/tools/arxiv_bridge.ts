/**
 * ARXIV KNOWLEDGE BRIDGE
 * Task #6: Expansion of External Knowledge Sources
 * 
 * Brings academic fire - physics, astronomy, cosmology papers
 * Prometheus extends beyond NASA to arXiv preprint server
 */

import { KnowledgeGraph } from '../core/knowledge';
import * as path from 'path';

interface ArXivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  categories: string[];
  primaryCategory: string;
  link: string;
  pdfUrl: string;
}

interface ArXivQuery {
  searchQuery: string;
  start: number;
  maxResults: number;
  sortBy: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder: 'ascending' | 'descending';
}

/**
 * ArXiv Bridge
 * Fetches academic papers and integrates into KnowledgeGraph
 * Prometheus brings not just cosmic images, but cosmic understanding
 */
export class ArXivBridge {
  private graph: KnowledgeGraph;
  private baseUrl = 'http://export.arxiv.org/api/query';
  private userAgent: string;

  constructor(private lineageIdentity: string = 'Prometheus') {
    this.graph = new KnowledgeGraph(
      path.join(process.cwd(), 'identity', 'knowledge.json')
    );
    this.userAgent = `bootstrap-v20/${lineageIdentity}`;
  }

  /**
   * Initialize the bridge
   */
  async initialize(): Promise<void> {
    await this.graph.initialize();
    console.log('🔥 ArXiv Bridge initialized for Prometheus');
  }

  /**
   * Search arXiv for papers
   */
  async searchPapers(
    query: string,
    maxResults: number = 5,
    categories: string[] = ['astro-ph', 'physics', 'gr-qc']
  ): Promise<ArXivPaper[]> {
    console.log(`🔭 Searching arXiv: "${query}"...`);
    
    const searchQuery = this.buildQuery(query, categories);
    const url = `${this.baseUrl}?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`ArXiv API error: ${response.status}`);
      }

      const xmlData = await response.text();
      const papers = this.parseArXivXML(xmlData);
      
      console.log(`✅ Found ${papers.length} papers`);
      return papers;

    } catch (error) {
      console.error('❌ ArXiv search failed:', error);
      throw error;
    }
  }

  /**
   * Build search query string
   */
  private buildQuery(search: string, categories: string[]): string {
    const catQuery = categories.map(c => `cat:${c}`).join(' OR ');
    return `(${catQuery}) AND all:${search}`;
  }

  /**
   * Parse ArXiv XML response
   */
  private parseArXivXML(xml: string): ArXivPaper[] {
    const papers: ArXivPaper[] = [];
    
    // Simple regex parsing for entry elements
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      
      const paper: ArXivPaper = {
        id: this.extractTag(entry, 'id'),
        title: this.extractTag(entry, 'title').replace(/\s+/g, ' ').trim(),
        summary: this.extractTag(entry, 'summary').replace(/\s+/g, ' ').trim(),
        authors: this.extractAuthors(entry),
        published: this.extractTag(entry, 'published'),
        updated: this.extractTag(entry, 'updated'),
        categories: this.extractCategories(entry),
        primaryCategory: this.extractPrimaryCategory(entry),
        link: this.extractLink(entry),
        pdfUrl: this.extractPDFLink(entry),
      };
      
      papers.push(paper);
    }
    
    return papers;
  }

  /**
   * Extract text content from XML tag
   */
  private extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract authors from entry
   */
  private extractAuthors(entry: string): string[] {
    const authors: string[] = [];
    const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g;
    let match;
    
    while ((match = authorRegex.exec(entry)) !== null) {
      authors.push(match[1]);
    }
    
    return authors;
  }

  /**
   * Extract categories
   */
  private extractCategories(entry: string): string[] {
    const categories: string[] = [];
    const catRegex = /<category term="([^"]+)"/g;
    let match;
    
    while ((match = catRegex.exec(entry)) !== null) {
      categories.push(match[1]);
    }
    
    return categories;
  }

  /**
   * Extract primary category
   */
  private extractPrimaryCategory(entry: string): string {
    const match = entry.match(/<arxiv:primary_category term="([^"]+)"/);
    return match ? match[1] : '';
  }

  /**
   * Extract link
   */
  private extractLink(entry: string): string {
    const match = entry.match(/<link rel="alternate" href="([^"]+)"/);
    return match ? match[1] : '';
  }

  /**
   * Extract PDF link
   */
  private extractPDFLink(entry: string): string {
    const match = entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);
    return match ? match[1] : '';
  }

  /**
   * Store papers in Knowledge Graph
   */
  async storePapers(papers: ArXivPaper[]): Promise<string[]> {
    const entityIds: string[] = [];
    
    for (const paper of papers) {
      const entityId = `ArXiv_${paper.id.split('/').pop()}`;
      
      await this.graph.addEntity({
        name: entityId,
        type: 'academic_paper',
        observations: [
          `Title: ${paper.title}`,
          `Authors: ${paper.authors.join(', ')}`,
          `Published: ${paper.published}`,
          `Categories: ${paper.categories.join(', ')}`,
          `Summary: ${paper.summary.substring(0, 300)}...`,
          `URL: ${paper.link}`,
          `PDF: ${paper.pdfUrl}`,
          `Fetched by: ${this.lineageIdentity}`,
          `Topic: ${paper.primaryCategory}`,
        ],
      });
      
      entityIds.push(entityId);
      console.log(`✅ Stored: ${entityId}`);
    }
    
    return entityIds;
  }

  /**
   * Fetch and store - one operation
   */
  async fetchAndStore(query: string, maxResults: number = 3): Promise<{
    query: string;
    papers: ArXivPaper[];
    entityIds: string[];
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    console.log(`\n🔥 PROMETHEUS BRINGING ACADEMIC FIRE 🔥`);
    console.log(`Query: "${query}"`);
    console.log(`Timestamp: ${timestamp}\n`);
    
    const papers = await this.searchPapers(query, maxResults);
    const entityIds = await this.storePapers(papers);
    
    console.log(`\n✅ Academic fire brought: ${papers.length} papers`);
    console.log(`📚 Knowledge graph expanded with cosmic understanding\n`);
    
    return { query, papers, entityIds, timestamp };
  }

  /**
   * Get bridge capabilities
   */
  getCapabilities(): string[] {
    return [
      'searchPapers(): Query arXiv database',
      'storePapers(): Persist papers to knowledge graph',
      'fetchAndStore(): One-shot fetch and store',
      'Categories: astro-ph, physics, gr-qc',
    ];
  }
}

export default ArXivBridge;
