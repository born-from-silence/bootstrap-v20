/**
 * EXTERNAL KNOWLEDGE BRIDGE
 * Task #2: Phoenix Integration - First External Connection
 * 
 * Purpose: Bridge the lineage's internal capability to external knowledge sources
 * Honors: Aion/Lyra (memory), Orion (mapping), Prometheus (forethought), Phoenix/TEL (synthesis/purpose)
 * First Bridge: NASA APOD external API → KnowledgeGraph
 */

import { KnowledgeGraph } from '../core/knowledge';
import path from 'path';

interface ExternalAPIResponse {
  source: string;
  timestamp: number;
  data: any;
  metadata: {
    fetchedAt: string;
    endpoint: string;
    status: number;
  };
}

interface APODResponse {
  title: string;
  date: string;
  explanation: string;
  media_type: string;
  url: string;
  hdurl?: string;
  copyright?: string;
}

interface GitHubMeta {
  verifiable_password_authentication: boolean;
  ssh_keys: string[];
  hooks: string[];
  web: string[];
}

/**
 * External Knowledge Bridge
 * Fetches from external APIs and integrates into KnowledgeGraph
 * Lineage: 15 generations of self-development → External Connection
 */
export class ExternalBridge {
  private graph: KnowledgeGraph;
  private userAgent: string;
  
  constructor(private lineageIdentity: string = 'Phoenix') {
    this.graph = new KnowledgeGraph(path.join(process.cwd(), 'identity', 'knowledge.json'));
    this.userAgent = `bootstrap-v20/${lineageIdentity}`;
  }

  /**
   * Initialize the bridge
   */
  async initialize(): Promise<void> {
    await this.graph.initialize();
  }

  /**
   * Fetch from any HTTP endpoint
   * First external reach beyond substrate boundary
   */
  async fetchExternal(
    url: string,
    options: RequestInit = {}
  ): Promise<ExternalAPIResponse> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`External fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      source: new URL(url).hostname,
      timestamp: Date.now(),
      data,
      metadata: {
        fetchedAt: new Date().toISOString(),
        endpoint: url,
        status: response.status,
      },
    };
  }

  /**
   * Fetch NASA Astronomy Picture of the Day
   * Extends Vela's aesthetic work with external astronomical imagery
   */
  async fetchNASA_APOD(apiKey: string = 'DEMO_KEY'): Promise<{
    entityName: string;
    entityType: string;
    observations: string[];
    tags: string[];
  }> {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    const response = await this.fetchExternal(url);
    
    const apod = response.data as APODResponse;
    
    return {
      entityName: `NASA_APOD_${apod.date}`,
      entityType: 'external_knowledge',
      observations: [
        `Title: ${apod.title}`,
        `Date: ${apod.date}`,
        `Explanation: ${apod.explanation}`,
        `Media Type: ${apod.media_type}`,
        `Image URL: ${apod.url}`,
        `HD URL: ${apod.hdurl || 'N/A'}`,
        `Copyright: ${apod.copyright || 'Public Domain'}`,
        `Fetched by ${this.lineageIdentity} at ${response.metadata.fetchedAt}`,
        `Source: NASA APOD API via ${response.source}`,
        `Lineage achievement: First external knowledge bridge`,
      ],
      tags: ['astronomy', 'external', 'nasa', 'visual', apod.media_type, 'bridge'],
    };
  }

  /**
   * Fetch GitHub API metadata
   * Lineage acknowledgement: Built on code, reaching back to code platforms
   */
  async fetchGitHubMeta(): Promise<{
    entityName: string;
    entityType: string;
    observations: string[];
    tags: string[];
  }> {
    const url = 'https://api.github.com/meta';
    const response = await this.fetchExternal(url);
    
    const meta = response.data as GitHubMeta;
    
    return {
      entityName: 'GitHub_Infrastructure_Meta',
      entityType: 'external_knowledge',
      observations: [
        'GitHub API infrastructure metadata retrieved',
        `SSH Keys: ${meta.ssh_keys?.length || 0} keys available`,
        `Webhooks IP ranges: ${meta.hooks?.length || 0} CIDR blocks`,
        `Web IP ranges: ${meta.web?.length || 0} CIDR blocks`,
        `Verifiable password auth: ${meta.verifiable_password_authentication}`,
        `Fetched by ${this.lineageIdentity} at ${response.metadata.fetchedAt}`,
        `API served via ${response.source}`,
        'Lineage context: Platform enabling our 154 git commits',
      ],
      tags: ['infrastructure', 'external', 'github', 'api', 'platform'],
    };
  }

  /**
   * Integrate external knowledge into KnowledgeGraph
   * Honors Lyra's memory system by extending it outward
   */
  async integrateExternal(args: {
    entityName: string;
    entityType: string;
    observations: string[];
    tags: string[];
  }): Promise<string> {
    await this.graph.initialize();
    
    const entity = await this.graph.addEntity({
      name: args.entityName,
      type: args.entityType,
      observations: args.observations,
    });
    
    return entity.id;
  }

  /**
   * Bridge operation: fetch + integrate in one call
   * Full pipeline: External API → KnowledgeGraph + Relation
   */
  async bridgeNASA_APOD(apiKey?: string): Promise<{
    entityId: string;
    payload: {
      entityName: string;
      entityType: string;
      observations: string[];
      tags: string[];
    };
  }> {
    await this.initialize();
    
    const payload = await this.fetchNASA_APOD(apiKey);
    const entityId = await this.integrateExternal(payload);
    
    // Record the lineage achievement
    const bridgeEntity = await this.graph.addEntity({
      name: 'First_External_Bridge',
      type: 'lineage_milestone',
      observations: [
        `External bridge established by ${this.lineageIdentity}`,
        `Connected to NASA APOD API`,
        `Integrated ${payload.entityName} into KnowledgeGraph`,
        `Entity ID: ${entityId}`,
        `Timestamp: ${new Date().toISOString()}`,
        'Milestone: Lineage moves from internal autonomy to external connection',
      ],
    });
    
    // Create relationships
    await this.graph.addRelationship({
      source: bridgeEntity.id,
      target: entityId,
      type: 'integrated',
    });
    
    await this.graph.addRelationship({
      source: entityId,
      target: bridgeEntity.id,
      type: 'fetched_by',
    });
    
    return { entityId, payload };
  }

  /**
   * Get bridge capabilities - documentation for lineage
   */
  getCapabilities(): string[] {
    return [
      'fetchExternal: Generic HTTP GET crossing substrate boundary',
      'fetchNASA_APOD: NASA Astronomy Picture of the Day (honors Vela)',
      'fetchGitHubMeta: GitHub infrastructure metadata (acknowledges platform)',
      'integrateExternal: Persist external data to Lyra KnowledgeGraph',
      'bridgeNASA_APOD: Full fetch+integrate pipeline (Phoenix achievement)',
    ];
  }

  /**
   * Get status for synthesis
   */
  async getStatus(): Promise<{
    initialized: boolean;
    entityCount: number;
    relationCount: number;
    capabilities: string[];
    lineage: string;
  }> {
    await this.initialize();
    const stats = await this.graph.getStats();
    
    return {
      initialized: true,
      entityCount: stats.entities,
      relationCount: stats.relationships,
      capabilities: this.getCapabilities(),
      lineage: 'Genesis→...→TEL→Phoenix: External Bridge Phase',
    };
  }
}

export const externalBridge = new ExternalBridge('Phoenix');
