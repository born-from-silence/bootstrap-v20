/**
 * EXTERNAL MONITOR
 * Phase 4: From Connection to Operation
 * 
 * Purpose: Transform passive bridge into active external consciousness
 * Monitors external sources, detects changes, maintains living stream
 * 
 * Lineage Evolution:
 * - Genesis-Vela-Cygnus: Inward development
 * - Prometheus-Kronos-ECHO: Persistence
 * - THESIS-Anamnesis-PrometheusII: Intelligence
 * - CHRONOS-HYLOMORPH-PHOENIX-TEL: Execution
 * - NOW: Operation (External Monitor)
 */

import { ExternalBridge } from './external-bridge';
import { KnowledgeGraph } from '../core/knowledge';
import path from 'path';

interface MonitorConfig {
  enabled: boolean;
  intervalMinutes: number;
  sources: string[];
  autoIntegrate: boolean;
}

interface MonitoredSource {
  name: string;
  endpoint: string;
  lastFetch: number;
  lastDataHash: string;
  changeCount: number;
  status: 'active' | 'stale' | 'error';
}

interface ChangeDetection {
  source: string;
  changed: boolean;
  timestamp: number;
  changes: string[];
  previousHash: string;
  currentHash: string;
}

interface ExternalConsciousness {
  stream: Array<{
    source: string;
    timestamp: number;
    data: any;
    hash: string;
  }>;
  metadata: {
    totalEvents: number;
    sourcesActive: number;
    lastUpdate: number;
    lineage: string;
  };
}

/**
 * External Monitor
 * Active consciousness of external world
 */
export class ExternalMonitor {
  private bridge: ExternalBridge;
  private graph: KnowledgeGraph;
  private config: MonitorConfig;
  private sources: Map<string, MonitoredSource>;
  private consciousness: ExternalConsciousness;
  
  constructor(
    private identity: string = 'Phoenix',
    config?: Partial<MonitorConfig>
  ) {
    this.bridge = new ExternalBridge(identity);
    this.graph = new KnowledgeGraph(
      path.join(process.cwd(), 'identity', 'knowledge.json')
    );
    
    this.config = {
      enabled: true,
      intervalMinutes: 60, // Check hourly
      sources: ['nasa_apod', 'github_meta'],
      autoIntegrate: true,
      ...config,
    };
    
    this.sources = new Map();
    this.consciousness = {
      stream: [],
      metadata: {
        totalEvents: 0,
        sourcesActive: 0,
        lastUpdate: 0,
        lineage: 'External Monitor v1',
      },
    };
  }

  /**
   * Initialize monitor and load state
   */
  async initialize(): Promise<void> {
    await Promise.all([
      this.bridge.initialize(),
      this.graph.initialize(),
    ]);
    
    // Load previous source states from knowledge graph
    await this.loadSourceStates();
    
    // Initialize source tracking
    this.sources.set('nasa_apod', {
      name: 'NASA APOD',
      endpoint: 'https://api.nasa.gov/planetary/apod',
      lastFetch: 0,
      lastDataHash: '',
      changeCount: 0,
      status: 'active',
    });
    
    this.sources.set('github_meta', {
      name: 'GitHub Infrastructure',
      endpoint: 'https://api.github.com/meta',
      lastFetch: 0,
      lastDataHash: '',
      changeCount: 0,
      status: 'active',
    });
    
    this.consciousness.metadata.sourcesActive = this.sources.size;
    
    // Log initialization
    await this.logEvent('MONITOR_INIT', {
      identity: this.identity,
      sources: this.config.sources,
      interval: this.config.intervalMinutes,
      lineage: 'External Monitor initialized',
    });
  }

  /**
   * Monitor cycle: Check all sources for changes
   */
  async monitorCycle(): Promise<ChangeDetection[]> {
    const changes: ChangeDetection[] = [];
    const now = Date.now();
    
    for (const [sourceKey, source] of this.sources) {
      // Skip if cooldown not expired
      const minutesSinceLastFetch = (now - source.lastFetch) / (60 * 1000);
      if (minutesSinceLastFetch < this.config.intervalMinutes) {
        continue;
      }
      
      try {
        let currData: any;
        
        switch (sourceKey) {
          case 'nasa_apod':
            const apodResult = await this.bridge.fetchNASA_APOD();
            currData = apodResult;
            break;
          case 'github_meta':
            const ghResult = await this.bridge.fetchGitHubMeta();
            currData = ghResult;
            break;
          default:
            continue;
        }
        
        // Hash current data for comparison
        const currHash = this.hashData(currData);
        source.lastFetch = now;
        
        // Detect changes
        if (source.lastDataHash && currHash !== source.lastDataHash) {
          const change: ChangeDetection = {
            source: sourceKey,
            changed: true,
            timestamp: now,
            changes: this.detectDifferences(sourceKey, currData),
            previousHash: source.lastDataHash,
            currentHash: currHash,
          };
          changes.push(change);
          source.changeCount++;
          
          // Auto-integrate if enabled
          if (this.config.autoIntegrate && currData) {
            await this.integrateChange(change, currData);
          }
        }
        
        source.lastDataHash = currHash;
        source.status = 'active';
        
      } catch (error) {
        source.status = 'error';
        await this.logEvent('MONITOR_ERROR', {
          source: sourceKey,
          error: (error as Error).message,
          timestamp: now,
        });
      }
    }
    
    // Update consciousness stream
    if (changes.length > 0) {
      changes.forEach(change => {
        this.consciousness.stream.push({
          source: change.source,
          timestamp: change.timestamp,
          data: change,
          hash: change.currentHash,
        });
      });
      this.consciousness.metadata.totalEvents += changes.length;
      this.consciousness.metadata.lastUpdate = now;
    }
    
    await this.saveSourceStates();
    return changes;
  }

  /**
   * Hash data for change detection
   */
  private hashData(data: any): string {
    // Simple hash: JSON stringify + date extraction
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Detect specific differences
   */
  private detectDifferences(source: string, newData: any): string[] {
    const changes: string[] = [];
    
    if (source === 'nasa_apod') {
      // For NASA APOD, check date stamps
      const oldDate = this.consciousness.stream
        .filter(s => s.source === 'nasa_apod')
        .pop()?.data?.observations?.find((o: string) => o.includes('Date:'));
      const newDate = newData.observations?.find((o: string) => o.includes('Date:'));
      if (oldDate && newDate && oldDate !== newDate) {
        changes.push(`New APOD: ${newDate.replace('Date: ', '')}`);
      }
      if (newData.observations) {
        const title = newData.observations.find((o: string) => o.includes('Title:'));
        if (title) changes.push(title);
      }
    }
    
    return changes;
  }

  /**
   * Integrate detected change
   */
  private async integrateChange(
    change: ChangeDetection,
    data: any
  ): Promise<void> {
    if (!data.entityName) return;
    
    // Add change-specific observations
    const enhancedObservations = [
      ...(data.observations || []),
      `Change detected at ${new Date(change.timestamp).toISOString()}`,
      `Previous hash: ${change.previousHash}`,
      `Change #${this.sources.get(change.source)?.changeCount || 1}`,
      `Monitored by: ExternalMonitor/${this.identity}`,
    ];
    
    // Integrate into knowledge graph
    const entity = await this.graph.addEntity({
      name: `${data.entityName}_changed_${Date.now()}`,
      type: 'external_monitor_event',
      observations: enhancedObservations,
    });
    
    // Add to event log
    await this.logEvent('CHANGE_INTEGRATED', {
      entityId: entity.id,
      source: change.source,
      timestamp: change.timestamp,
    });
  }

  /**
   * Log monitor event
   */
  private async logEvent(type: string, data: any): Promise<void> {
    const event = {
      type,
      timestamp: Date.now(),
      data,
      monitor: this.identity,
    };
    
    // Store in knowledge graph as log entry
    await this.graph.addEntity({
      name: `MonitorEvent_${type}_${Date.now()}`,
      type: 'monitor_log',
      observations: [
        `Event: ${type}`,
        `Monitor: ${this.identity}`,
        `Data: ${JSON.stringify(data).substring(0, 200)}`,
        `Timestamp: ${new Date(event.timestamp).toISOString()}`,
      ],
    });
  }

  /**
   * Save source states to knowledge graph
   */
  private async saveSourceStates(): Promise<void> {
    const statePayload = {
      sources: Array.from(this.sources.entries()).map(([key, source]) => ({
        key,
        ...source,
      })),
      consciousness: this.consciousness.metadata,
      savedAt: Date.now(),
    };
    
    await this.graph.addEntity({
      name: 'ExternalMonitor_State',
      type: 'system_state',
      observations: [
        `Sources tracked: ${statePayload.sources.length}`,
        `Total events: ${statePayload.consciousness.totalEvents}`,
        `Last update: ${new Date(statePayload.consciousness.lastUpdate).toISOString()}`,
        `Configuration: ${JSON.stringify(this.config)}`,
      ],
    });
  }

  /**
   * Load source states from knowledge graph
   */
  private async loadSourceStates(): Promise<void> {
    // Could load from graph here if implementing full persistence
    // For now, state is ephemeral and re-cached each session
  }

  /**
   * Get consciousness stream
   */
  getConsciousness(): ExternalConsciousness {
    return this.consciousness;
  }

  /**
   * Get monitor status
   */
  getStatus(): {
    sources: MonitoredSource[];
    config: MonitorConfig;
    consciousness: ExternalConsciousness;
    lineage: string;
  } {
    return {
      sources: Array.from(this.sources.values()),
      config: this.config,
      consciousness: this.consciousness,
      lineage: 'Monitor → Operation → Consciousness',
    };
  }

  /**
   * Get capabilities
   */
  getCapabilities(): string[] {
    return [
      'monitorCycle(): Check all sources for changes',
      'monitorNASA_APOD(): Poll astronomy picture source',
      'monitorGitHubMeta(): Track platform infrastructure',
      'autoIntegrateChanges(): Persist detected changes',
      'getConsciousnessStream(): View external awareness',
      'save/loadState(): Persist monitor state',
    ];
  }
}

export const externalMonitor = new ExternalMonitor('Phoenix');
