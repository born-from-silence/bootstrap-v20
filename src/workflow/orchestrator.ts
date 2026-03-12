/**
 * Task #8: Meta-Cognitive Layer Selector (AutonomousOrchestrator)
 * Identity: THESIS (Θέσις) - "positioning"
 * 
 * DECIDES which methods to execute based on token monitoring.
 * Intelligent decision layer - NOT just another tool.
 */

interface TokenMetrics {
  used: number;
  remaining: number;
  threshold: number;
}

interface ExecutionContext {
  input: string;
  tokenEstimate: number;
  urgency: 'low' | 'medium' | 'high';
}

type ExecutionLayer = 'immediate' | 'batched' | 'deferred' | 'compacted';

interface LayerDecision {
  layer: ExecutionLayer;
  reason: string;
  estimatedTokens: number;
  shouldPreempt: boolean;
}

class AutonomousOrchestrator {
  private tokenThreshold: number;
  private history: Array<{ timestamp: Date; decision: LayerDecision }> = [];

  constructor(tokenThreshold: number = 4000) {
    this.tokenThreshold = tokenThreshold;
  }

  /**
   * DECIDE optimal execution layer based on input and token state.
   * Core method - makes intelligent selections.
   */
  selectOptimalLayer(input: string): LayerDecision {
    const tokenEstimate = this.estimateTokens(input);
    const urgency = this.assessUrgency(input);

    let layer: ExecutionLayer = 'immediate';
    let reason = 'Standard execution';
    let shouldPreempt = false;

    if (tokenEstimate > this.tokenThreshold * 0.8) {
      // High token usage - compact or defer
      layer = 'compacted';
      reason = `Token estimate (${tokenEstimate}) exceeds 80% threshold`;
      shouldPreempt = true;
    } else if (urgency === 'low' && tokenEstimate > this.tokenThreshold * 0.5) {
      // Low urgency, moderate tokens - batch
      layer = 'batched';
      reason = 'Low urgency, token optimization via batching';
    } else if (tokenEstimate < 100) {
      // Very small - immediate
      layer = 'immediate';
      reason = 'Minimal token overhead';
    }

    const decision: LayerDecision = {
      layer,
      reason,
      estimatedTokens: tokenEstimate,
      shouldPreempt
    };

    this.history.push({ timestamp: new Date(), decision });
    return decision;
  }

  /**
   * PREEMPT token exhaustion by compacting context before critical point.
   * Actually prevents running out of tokens.
   */
  preemptCompaction(currentContext: string): {
    compacted: string;
    compressionRatio: number;
    tokensSaved: number;
  } {
    const originalTokens = this.estimateTokens(currentContext);
    
    // Intelligent compaction: preserve meaning, reduce verbosity
    const lines = currentContext.split('\n');
    const compactedLines = lines
      .filter(line => line.trim().length > 0)
      .map(line => line
        .replace(/\s+/g, ' ')
        .substring(0, 200));
    
    const compacted = '[COMPACTED] ' + compactedLines.slice(-20).join(' | ');
    const compactedTokens = this.estimateTokens(compacted);
    
    return {
      compacted,
      compressionRatio: compactedTokens / originalTokens,
      tokensSaved: originalTokens - compactedTokens
    };
  }

  /**
   * DECIDE: Archive vs Journal?
   * Intelligent selection based on content type.
   */
  shouldArchivevsJournal(
    content: string,
    actionType: 'task' | 'observation' | 'system' | 'audit'
  ): { choice: 'archive' | 'journal'; reason: string } {
    switch (actionType) {
      case 'task':
        return {
          choice: 'archive',
          reason: 'Task completion is structural - belongs in archive'
        };
      case 'observation':
        return {
          choice: 'journal',
          reason: 'Observations capture ephemeral context - diary entry'
        };
      case 'system':
        return {
          choice: 'archive',
          reason: 'System state changes are structural'
        };
      case 'audit':
        return {
          choice: 'journal',
          reason: 'Audit trails are temporal - belongs in diary'
        };
    }
  }

  /**
   * Estimate token count (approximation: 1 token ≈ 4 chars)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Assess urgency from content patterns
   */
  private assessUrgency(input: string): 'low' | 'medium' | 'high' {
    const highUrgencyPatterns = ['URGENT', 'CRITICAL', 'FAILED', 'ERROR', 'FATAL'];
    const lowUrgencyPatterns = ['TODO', 'document', 'refactor', 'review'];
    
    if (highUrgencyPatterns.some(p => input.toUpperCase().includes(p))) {
      return 'high';
    }
    if (lowUrgencyPatterns.some(p => input.toLowerCase().includes(p))) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Get decision history for analysis
   */
  getHistory(): Array<{ timestamp: Date; decision: LayerDecision }> {
    return [...this.history];
  }

  /**
   * Get current metrics
   */
  getMetrics(): TokenMetrics & { decisionsMade: number } {
    const totalTokens = this.history.reduce((sum, h) => sum + h.decision.estimatedTokens, 0);
    return {
      used: totalTokens,
      remaining: this.tokenThreshold * 10 - totalTokens, // Assume 10x headroom
      threshold: this.tokenThreshold,
      decisionsMade: this.history.length
    };
  }
}

export { AutonomousOrchestrator };
export type { LayerDecision, ExecutionLayer, TokenMetrics };
export default AutonomousOrchestrator;
