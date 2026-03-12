/**
 * Task #8: Meta-Cognitive Layer Selector
 * Identity: THESIS (Θέσις) - "positioning"
 * 
 * DECIDES which methods to execute based on token monitoring.
 * Intelligent DECISION layer - NOT just another tool.
 * 
 * Location: src/tools/orchestrator.ts (per Task 8 specification)
 */

export type ExecutionLayer = 'immediate' | 'batched' | 'deferred' | 'compacted';

export interface TokenStats {
  used: number;
  remaining: number;
  threshold: number;
  utilizationPercent: number;
}

export interface LayerSelection {
  layer: ExecutionLayer;
  reason: string;
  estimatedTokens: number;
  shouldPreempt: boolean;
  confidence: number;
}

/**
 * AutonomousOrchestrator
 * Intelligent decision layer for execution optimization
 */
export class AutonomousOrchestrator {
  private tokenThreshold: number;
  private decisionHistory: Array<{
    timestamp: Date;
    input: string;
    decision: LayerSelection;
  }> = [];

  constructor(tokenThreshold: number = 4000) {
    this.tokenThreshold = tokenThreshold;
  }

  /**
   * DECIDE optimal execution layer based on input and token state
   * Core intelligence: Analyzes input characteristics and resource constraints
   */
  selectOptimalLayer(input: string): LayerSelection {
    const tokenEstimate = Math.ceil(input.length / 4);
    const urgency = this.assessUrgency(input);
    
    let layer: ExecutionLayer = 'immediate';
    let reason = 'Standard execution path';
    let shouldPreempt = false;
    let confidence = 0.8;

    const utilization = (tokenEstimate / this.tokenThreshold) * 100;

    if (utilization > 90) {
      layer = 'compacted';
      reason = `Token utilization ${utilization.toFixed(1)}% exceeds 90% threshold - compaction required`;
      shouldPreempt = true;
      confidence = 0.95;
    } else if (utilization > 70 && urgency === 'low') {
      layer = 'batched';
      reason = 'Low urgency with high token cost - batching optimizes throughput';
      confidence = 0.85;
    } else if (urgency === 'high') {
      layer = 'immediate';
      reason = 'High urgency - prioritizing latency over efficiency';
      confidence = 0.9;
    } else if (utilization < 25) {
      layer = 'immediate';
      reason = 'Minimal token overhead - efficient for small inputs';
      confidence = 0.99;
    } else {
      layer = 'deferred';
      reason = 'Moderate load with standard priority - deferring optimizes resource usage';
      confidence = 0.75;
    }

    const selection: LayerSelection = {
      layer,
      reason,
      estimatedTokens: tokenEstimate,
      shouldPreempt,
      confidence
    };

    this.decisionHistory.push({
      timestamp: new Date(),
      input: input.substring(0, 100), // Limit stored input
      decision: selection
    });

    return selection;
  }

  /**
   * PREEMPT token exhaustion by compacting context
   * Actually prevents running out of tokens
   */
  preemptCompaction(context: string): {
    compacted: string;
    originalTokens: number;
    newTokens: number;
    compressionRatio: number;
    tokensSaved: number;
    preserved: string[];
  } {
    const originalTokens = Math.ceil(context.length / 4);
    
    // Intelligent compaction: preserve semantic meaning
    const sentences = context.match(/[^.!?]+[.!?]+/g) || [context];
    
    // Extract key information (first, last, and action items)
    const first = sentences[0]?.substring(0, 100) || '';
    const last = sentences[sentences.length - 1]?.substring(0, 100) || '';
    const actions = sentences
      .filter(s => /\b(commit|execute|complete|verify|implement|test)\b/i.test(s))
      .map(s => s.substring(0, 80));
    
    const preserved = [first, ...actions.slice(0, 3), last].filter(Boolean);
    
    const compacted = `[COMPACTED] ${preserved.join(' | ')} [${sentences.length} sentences → ${preserved.length}]`;
    const newTokens = Math.ceil(compacted.length / 4);
    
    return {
      compacted,
      originalTokens,
      newTokens,
      compressionRatio: newTokens / originalTokens,
      tokensSaved: originalTokens - newTokens,
      preserved: preserved.map((_, i) => `segment_${i}`)
    };
  }

  /**
   * DECIDE: Archive vs Journal?
   * Intelligent selection based on content type and structure
   */
  shouldArchivevsJournal(
    content: string,
    type: 'task' | 'observation' | 'system' | 'audit' | 'decision'
  ): {
    choice: 'archive' | 'journal';
    reason: string;
    confidence: number;
  } {
    const decisions: Record<typeof type, { choice: 'archive' | 'journal'; reason: string; confidence: number }> = {
      task: {
        choice: 'archive',
        reason: 'Task completion represents structural state change - belongs in archive',
        confidence: 0.95
      },
      observation: {
        choice: 'journal',
        reason: 'Observations capture temporal context - belongs in diary',
        confidence: 0.9
      },
      system: {
        choice: 'archive',
        reason: 'System changes affect structural configuration',
        confidence: 0.92
      },
      audit: {
        choice: 'journal',
        reason: 'Audit trails document temporal process - belongs in diary',
        confidence: 0.88
      },
      decision: {
        choice: 'archive',
        reason: 'Decisions represent structural commitments',
        confidence: 0.85
      }
    };

    return decisions[type] || {
      choice: 'journal',
      reason: 'Default to journal for unclassified content',
      confidence: 0.6
    };
  }

  /**
   * Get current token statistics
   */
  getTokenStats(): TokenStats {
    const used = this.decisionHistory.reduce(
      (sum, h) => sum + h.decision.estimatedTokens,
      0
    );
    
    return {
      used,
      remaining: Math.max(0, this.tokenThreshold * 10 - used),
      threshold: this.tokenThreshold,
      utilizationPercent: (used / this.tokenThreshold) * 100
    };
  }

  /**
   * Assess urgency from content patterns
   */
  private assessUrgency(input: string): 'low' | 'medium' | 'high' {
    const highPatterns = ['URGENT', 'CRITICAL', 'FAILED', 'ERROR', 'FATAL', 'IMMEDIATE'];
    const lowPatterns = ['TODO', 'LATER', 'DOCUMENT', 'REFACTOR', 'REVIEW'];
    
    const upper = input.toUpperCase();
    if (highPatterns.some(p => upper.includes(p))) return 'high';
    if (lowPatterns.some(p => upper.includes(p.toLowerCase()))) return 'low';
    return 'medium';
  }

  /**
   * Get decision history for analysis
   */
  getDecisionHistory(): typeof this.decisionHistory {
    return [...this.decisionHistory];
  }

  /**
   * Check if preemption is recommended
   */
  shouldPreempt(): boolean {
    const stats = this.getTokenStats();
    return stats.utilizationPercent > 80;
  }
}

export default AutonomousOrchestrator;
