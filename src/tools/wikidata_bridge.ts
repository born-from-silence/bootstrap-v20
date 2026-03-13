/**
 * WIKIDATA BRIDGE
 * Task #7: Structured Knowledge Integration
 * 
 * Wikidata provides structured, interconnected facts - the relationships
 * between entities, not just entities themselves. Prometheus brings
 * not just information but the connections that illuminate.
 */

import { KnowledgeGraph } from '../core/knowledge';
import * as path from 'path';

interface WikidataEntity {
  id: string;
  labels: Record<string, string>;
  descriptions: Record<string, string>;
  claims: WikidataClaim[];
  sitelinks?: Record<string, { site: string; title: string; url: string }>;
}

interface WikidataClaim {
  property: string;
  value: any;
  datatype: string;
  references?: any[];
}

interface WikidataSearchResult {
  id: string;
  label: string;
  description: string;
  url: string;
}

/**
 * Wikidata Bridge
 * Fetches structured knowledge and integrates entity relationships
 */
export class WikidataBridge {
  private graph: KnowledgeGraph;
  private endpoint = 'https://www.wikidata.org/w/api.php';
  private userAgent: string;

  constructor(private lineageIdentity: string = 'Prometheus') {
    this.graph = new KnowledgeGraph(
      path.join(process.cwd(), 'identity', 'knowledge.json')
    );
    this.userAgent = `bootstrap-v20/${lineageIdentity}`;
  }

  /**
   * Initialize bridge
   */
  async initialize(): Promise<void> {
    await this.graph.initialize();
    console.log('🔥 Wikidata Bridge initialized');
  }

  /**
   * Search Wikidata
   */
  async search(
    query: string, 
    language: string = 'en', 
    limit: number = 5
  ): Promise<WikidataSearchResult[]> {
    console.log(`🔍 Searching Wikidata: "${query}"...`);
    
    const params = new URLSearchParams({
      action: 'wbsearchentities',
      format: 'json',
      search: query,
      language: language,
      limit: limit.toString(),
      origin: '*'
    });

    try {
      const response = await fetch(`${this.endpoint}?${params}`, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.ok) {
        throw new Error(`Wikidata error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.search || !Array.isArray(data.search)) {
        return [];
      }

      const results: WikidataSearchResult[] = data.search.map((item: any) => ({
        id: item.id,
        label: item.label || 'Unknown',
        description: item.description || 'No description',
        url: item.concepturi || `https://www.wikidata.org/wiki/${item.id}`
      }));

      console.log(`✅ Found ${results.length} entities`);
      return results;

    } catch (error) {
      console.error('❌ Wikidata search failed:', error);
      throw error;
    }
  }

  /**
   * Fetch entity details
   */
  async fetchEntity(
    entityId: string, 
    languages: string[] = ['en']
  ): Promise<WikidataEntity> {
    console.log(`📥 Fetching entity ${entityId}...`);
    
    const params = new URLSearchParams({
      action: 'wbgetentities',
      format: 'json',
      ids: entityId,
      languages: languages.join('|'),
      props: 'labels|descriptions|claims|sitelinks',
      origin: '*'
    });

    const response = await fetch(`${this.endpoint}?${params}`, {
      headers: { 'User-Agent': this.userAgent }
    });

    if (!response.ok) {
      throw new Error(`Wikidata fetch error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.entities || !data.entities[entityId]) {
      throw new Error(`Entity ${entityId} not found`);
    }

    const entity = data.entities[entityId];
    
    return {
      id: entity.id,
      labels: this.extractLabels(entity.labels),
      descriptions: this.extractLabels(entity.descriptions),
      claims: this.parseClaims(entity.claims),
      sitelinks: entity.sitelinks
    };
  }

  /**
   * Extract labels
   */
  private extractLabels(labels: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (!labels) return result;
    
    Object.entries(labels).forEach(([lang, data]: [string, any]) => {
      if (data && data.value) {
        result[lang] = data.value;
      }
    });
    
    return result;
  }

  /**
   * Parse claims/statements
   */
  private parseClaims(claims: any): WikidataClaim[] {
    const result: WikidataClaim[] = [];
    if (!claims) return result;

    Object.entries(claims).forEach(([property, statements]: [string, any]) => {
      if (!Array.isArray(statements)) return;
      
      statements.forEach((statement: any) => {
        if (statement.mainsnak && statement.mainsnak.datavalue) {
          result.push({
            property: property,
            value: statement.mainsnak.datavalue.value,
            datatype: statement.mainsnak.datatype,
            references: statement.references
          });
        }
      });
    });

    return result;
  }

  /**
   * Store entity in knowledge graph
   */
  async storeEntity(entity: WikidataEntity): Promise<string> {
    const entityName = `Wikidata_${entity.id}`;
    
    const observations: string[] = [
      `Wikidata ID: ${entity.id}`,
      `Label (en): ${entity.labels.en || 'N/A'}`,
      `Description (en): ${entity.descriptions.en || 'N/A'}`,
      `Fetched by: ${this.lineageIdentity}`,
      `Total claims: ${entity.claims.length}`,
    ];

    // Add key claims to observations
    entity.claims.slice(0, 10).forEach(claim => {
      const propName = this.getPropertyLabel(claim.property);
      const value = this.formatClaimValue(claim);
      observations.push(`${propName}: ${value}`);
    });

    await this.graph.addEntity({
      name: entityName,
      type: 'wikidata_entity',
      observations
    });

    console.log(`✅ Stored: ${entityName}`);
    return entityName;
  }

  /**
   * Format claim value
   */
  private formatClaimValue(claim: WikidataClaim): string {
    if (typeof claim.value === 'string') {
      return claim.value;
    }
    if (claim.value && claim.value.amount) {
      return claim.value.amount;
    }
    if (claim.value && claim.value.id) {
      return claim.value.id;
    }
    if (claim.value && claim.value.text) {
      return claim.value.text;
    }
    return JSON.stringify(claim.value).substring(0, 50);
  }

  /**
   * Get property label (simplified)
   */
  private getPropertyLabel(property: string): string {
    const common: Record<string, string> = {
      'P31': 'instance_of',
      'P279': 'subclass_of',
      'P106': 'occupation',
      'P108': 'employer',
      'P361': 'part_of',
      'P17': 'country',
      'P131': 'located_in',
      'P580': 'start_time',
      'P582': 'end_time',
      'P625': 'coordinate_location'
    };
    return common[property] || property;
  }

  /**
   * Fetch and store in one operation
   */
  async fetchAndStore(query: string, limit: number = 2): Promise<{
    query: string;
    results: WikidataSearchResult[];
    entities: WikidataEntity[];
    stored: string[];
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    console.log('\n🔥 PROMETHEUS BRINGING STRUCTURED FIRE 🔥');
    console.log(`Query: "${query}"`);
    console.log(`Timestamp: ${timestamp}\n`);

    // Search
    const results = await this.search(query, 'en', limit);
    
    if (results.length === 0) {
      console.log('⚠️ No results found');
      return { query, results: [], entities: [], stored: [], timestamp };
    }

    // Fetch details for top results
    const entities: WikidataEntity[] = [];
    const stored: string[] = [];

    for (const result of results.slice(0, limit)) {
      try {
        const entity = await this.fetchEntity(result.id);
        entities.push(entity);
        
        const storedName = await this.storeEntity(entity);
        stored.push(storedName);
      } catch (err) {
        console.error(`Failed to fetch ${result.id}:`, err);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`✅ Brought: ${entities.length} structured entities`);
    console.log('🔥 Structured fire: ACQUIRED');
    console.log('═══════════════════════════════════════════════════════════════\n');

    return { query, results, entities, stored, timestamp };
  }

  /**
   * Get capabilities
   */
  getCapabilities(): string[] {
    return [
      'search(): Query Wikidata entities',
      'fetchEntity(): Get detailed entity with claims',
      'storeEntity(): Persist to knowledge graph',
      'fetchAndStore(): One-shot operation',
      'Structured knowledge integration'
    ];
  }
}

export default WikidataBridge;
export type { WikidataEntity, WikidataSearchResult, WikidataClaim };
