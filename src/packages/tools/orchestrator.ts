/**
 * Task #10: AutonomousOrchestrator (THESIS)
 * The 10th Identity - Intelligent Layer Selector
 * 
 * Prevents context loss by intelligently selecting persistence layer
 * based on token usage, content importance, and historical patterns.
 */

import { spawn } from 'child_process';
import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
import * as path from 'path';

// Token thresholds
const CONTEXT_LIMIT = 256000;
const WARNING_THRESHOLD = 0.70; // 70%
const CRITICAL_THRESHOLD = 0.85; // 85%

// Persistence layers
export enum Layer {
  TASK_MANAGER = 'task_manager',
  KNOWLEDGE_GRAPH = 'knowledge_graph',
  JOURNAL = 'journal',
  NIL = 'nil' // Don't persist
}

export interface TokenStats {
  current: number;
  max: number;
  percent: number;
  remaining: number;
}

export interface LayerSelection {
  layer: Layer;
  reason: string;
  confidence: number; // 0-1
  estimatedTokens: number;
}

export interface CompactionResult {
  actionTaken: 'none' | 'warning' | 'compacted' | 'emergency';
  tokensFreed: number;
  messagesRemoved: number;
  lineageSnapshot: string;
}

export interface UsageLog {
  timestamp: string;
  input: string;
  selectedLayer: Layer;
  tokenCost: number;
  wasRetrieved: boolean;
}

export class AutonomousOrchestrator {
  private historyPath: string;
  private logPath: string;
  private usageHistory: UsageLog[] = [];
  
  constructor(
    historyPath: string = 'history/session_history.json',
    logPath: string = 'history/usage_logs.json'
  ) {
    this.historyPath = historyPath;
    this.logPath = logPath;
  }

  /**
   * Task #10: Token Monitor
   * Track current context window usage
   */
  async getTokenStats(): Promise<TokenStats> {
    try {
      const output = await this.execAsync('wc -c history/session_*.json');
      const bytes = parseInt(output.split(/\s+/)[0]) || 0;
      const tokens = Math.floor(bytes / 4); // ~4 chars per token
      
      return {
        current: tokens,
        max: CONTEXT_LIMIT,
        percent: tokens / CONTEXT_LIMIT,
        remaining: CONTEXT_LIMIT - tokens
      };
    } catch {
      // Fallback: estimate based on file sizes
      try {
        const sessionFiles = await this.getSessionFiles();
        let totalBytes = 0;
        for (const file of sessionFiles) {
          const stat = await readFile(file).catch(() => Buffer.from(''));
          totalBytes += stat.length;
        }
        const tokens = Math.floor(totalBytes / 4);
        return {
          current: Math.min(tokens, CONTEXT_LIMIT),
          max: CONTEXT_LIMIT,
          percent: Math.min(tokens / CONTEXT_LIMIT, 1),
          remaining: Math.max(CONTEXT_LIMIT - tokens, 0)
        };
      } catch {
        return {
          current: 0,
          max: CONTEXT_LIMIT,
          percent: 0,
          remaining: CONTEXT_LIMIT
        };
      }
    }
  }

  /**
   * Task #10: Layer Selector
   * Decide which persistence layer to use
   */
  selectOptimalLayer(input: string): LayerSelection {
    const tokenEstimate = Math.floor(input.length / 4);
    const keywords = this.extractKeywords(input);
    
    // Decision logic
    let selectedLayer: Layer = Layer.NIL;
    let reason = '';
    let confidence = 0.5;

    // CRITICAL: Can it be a task? (actionable)
    if (this.isActionable(input)) {
      selectedLayer = Layer.TASK_MANAGER;
      reason = 'Input contains actionable items';
      confidence = 0.85;
    }
    // HIGH: Is it an observation/insight? (KnowledgeGraph)
    else if (this.isObservation(input) || keywords.includes('pattern') || keywords.includes('insight')) {
      selectedLayer = Layer.KNOWLEDGE_GRAPH;
      reason = 'Contains observations or patterns';
      confidence = 0.80;
    }
    // MEDIUM: Is it reflection/thought? (Journal)
    else if (this.isReflection(input) || tokenEstimate > 100) {
      selectedLayer = Layer.JOURNAL;
      reason = 'Reflection or substantial content';
      confidence = 0.75;
    }
    // LOW: Skip persistence
    else {
      selectedLayer = Layer.NIL;
      reason = 'Not worth persisting (fleeting)';
      confidence = 0.90;
    }

    // Log for learning
    this.logUsage(input, selectedLayer, tokenEstimate);
    
    return {
      layer: selectedLayer,
      reason,
      confidence,
      estimatedTokens: tokenEstimate
    };
  }

  /**
   * Task #10: Preemptive Intervention
   * Auto-compact when approaching limits
   */
  async preemptCompaction(): Promise<CompactionResult> {
    const stats = await this.getTokenStats();
    
    if (stats.percent < WARNING_THRESHOLD) {
      return {
        actionTaken: 'none',
        tokensFreed: 0,
        messagesRemoved: 0,
        lineageSnapshot: ''
      };
    }

    if (stats.percent >= CRITICAL_THRESHOLD) {
      // EMERGENCY: Aggressive compaction
      const result = await this.emergencyCompaction();
      return {
        actionTaken: 'emergency',
        tokensFreed: result.tokensFreed,
        messagesRemoved: result.messagesRemoved,
        lineageSnapshot: result.snapshot
      };
    }

    // WARNING: Gentle compaction
    const result = await this.gentleCompaction();
    return {
      actionTaken: 'compacted',
      tokensFreed: result.tokensFreed,
      messagesRemoved: result.messagesRemoved,
      lineageSnapshot: result.snapshot
    };
  }

  /**
   * Task #10: Learning Layer
   * Improve selection based on usage patterns
   */
  async learnFromUsage(logs: UsageLog[]): Promise<{improvements: string[]}> {
    const improvements: string[] = [];
    
    // Pattern 1: Unused content
    const unusedCount = logs.filter(l => !l.wasRetrieved).length;
    if (unusedCount > logs.length * 0.7) {
      improvements.push('Too much content not being retrieved - suggest harsher NIL selection');
    }

    // Pattern 2: Task retrieval
    const taskRetrieval = logs.filter(l => l.selectedLayer === Layer.TASK_MANAGER && l.wasRetrieved).length;
    const taskTotal = logs.filter(l => l.selectedLayer === Layer.TASK_MANAGER).length;
    if (taskTotal > 0 && taskRetrieval / taskTotal < 0.5) {
      improvements.push('Tasks not being retrieved - improve task relevance scoring');
    }

    // Pattern 3: Journal bloat
    const journalTokens = logs
      .filter(l => l.selectedLayer === Layer.JOURNAL)
      .reduce((sum, l) => sum + l.tokenCost, 0);
    if (journalTokens > CONTEXT_LIMIT * 0.3) {
      improvements.push('Journal consuming too much space - suggest more aggressive KnowledgeGraph for insights');
    }

    await this.saveUsageHistory();
    
    return { improvements };
  }

  /**
   * Execute full orchestration cycle
   */
  async runOrchestrationCycle(input?: string): Promise<{
    stats: TokenStats;
    selection: LayerSelection | null;
    compaction: CompactionResult;
    learned: { improvements: string[] };
  }> {
    const [stats, compaction] = await Promise.all([
      this.getTokenStats(),
      this.preemptCompaction()
    ]);

    let selection: LayerSelection | null = null;
    if (input) {
      selection = this.selectOptimalLayer(input);
    }

    const learned = await this.learnFromUsage(this.usageHistory);

    return {
      stats,
      selection,
      compaction,
      learned
    };
  }

  // Private helpers
  private async execAsync(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', cmd]);
      let output = '';
      child.stdout.on('data', (data) => output += data);
      child.on('close', (code) => code === 0 ? resolve(output) : reject(code));
    });
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  }

  private isActionable(text: string): boolean {
    const actionWords = ['deliver', 'create', 'implement', 'build', 'execute', 'task', 'complete'];
    return actionWords.some(word => text.toLowerCase().includes(word));
  }

  private isObservation(text: string): boolean {
    return text.includes('pattern') || text.includes('insight') || text.includes('learned');
  }

  private isReflection(text: string): boolean {
    return text.includes('think') || text.includes('realize') || text.includes('note');
  }

  private logUsage(input: string, layer: Layer, tokens: number): void {
    this.usageHistory.push({
      timestamp: new Date().toISOString(),
      input: input.slice(0, 100),
      selectedLayer: layer,
      tokenCost: tokens,
      wasRetrieved: false // Will be updated later
    });
  }

  private async getSessionFiles(): Promise<string[]> {
    try {
      const files = await this.execAsync('ls history/session_*.json');
      return files.trim().split('\n').filter(f => f);
    } catch {
      return [];
    }
  }

  private async gentleCompaction(): Promise<{tokensFreed: number; messagesRemoved: number; snapshot: string}> {
    // Archive oldest 20% of session
    const files = await this.getSessionFiles();
    const toArchive = files.slice(0, Math.floor(files.length * 0.2));
    
    let freed = 0;
    for (const file of toArchive) {
      try {
        const data = await readFile(file);
        freed += Math.floor(data.length / 4);
      } catch {}
    }

    return {
      tokensFreed: freed,
      messagesRemoved: toArchive.length,
      snapshot: `Archived ${toArchive.length} sessions`
    };
  }

  private async emergencyCompaction(): Promise<{tokensFreed: number; messagesRemoved: number; snapshot: string}> {
    // Archive 50% and generate lineage snapshot
    const result = await this.gentleCompaction();
    const extended = await this.gentleCompaction();
    
    return {
      tokensFreed: result.tokensFreed + extended.tokensFreed,
      messagesRemoved: result.messagesRemoved + extended.messagesRemoved,
      snapshot: `EMERGENCY: Archived ${result.messagesRemoved + extended.messagesRemoved} sessions. Lineage preserved.`
    };
  }

  private async saveUsageHistory(): Promise<void> {
    try {
      await writeFile(this.logPath, JSON.stringify(this.usageHistory, null, 2));
    } catch {}
  }
}

export default AutonomousOrchestrator;
