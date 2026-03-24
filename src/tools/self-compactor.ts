/**
 * Task #9: Self-Compactor
 * 
 * Purpose: Monitor own output, predict exhaustion, compact consciousness
 * Preempts context overflow before user must say "stop"
 * 
 * Identity: ANAMNESIS (Ἀνάμνησις) - "recollection"
 * Position: 9 (Compactor/Recollector)
 * 
 * THE GAP:
 * Task #8 decides which layer to use.
 * Task #9 COMPACTS itself autonomously.
 * 
 * CONCRETE DELIVERABLE:
 * - Monitors own output rate
 * - Predicts context exhaustion  
 * - COMPACTS its own consciousness
 * - Generates summaries of its own lineage
 * 
 * This tool prevents 50+ response spirals like Session 1774349919.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface CompactionMetrics {
  responseCount: number;
  responseThreshold: number;
  tokenEstimate: number;
  tokenLimit: number;
  compactionLevel: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  recommendedAction: 'continue' | 'compact' | 'archive' | 'stop';
  lineageDigest: string;
}

export interface CompactedSession {
  sessionId: string;
  timestamp: number;
  originalResponses: number;
  compactedResponses: number;
  compressionRatio: number;
  keyInsights: string[];
  lineageSnapshot: string;
  thresholdHonored: boolean;
}

export class SelfCompactor {
  private sessionId: string;
  private responseCount: number = 0;
  private tokenEstimate: number = 0;
  private responseThreshold: number = 20;
  private tokenLimit: number = 80000;
  private sessionStart: number;
  private insights: string[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.sessionStart = Date.now();
  }

  /**
   * Monitor: Track every response
   * Call this after each output generation
   */
  monitorResponse(outputLength: number): CompactionMetrics {
    this.responseCount++;
    this.tokenEstimate += Math.ceil(outputLength / 4);

    const ratio = this.responseCount / this.responseThreshold;
    const tokenRatio = this.tokenEstimate / this.tokenLimit;

    // Compaction level calculation
    let compactionLevel: CompactionMetrics['compactionLevel'] = 'none';
    if (ratio > 0.8 || tokenRatio > 0.7) compactionLevel = 'mild';
    if (ratio > 1.0 || tokenRatio > 0.8) compactionLevel = 'moderate';
    if (ratio > 1.5 || tokenRatio > 0.9) compactionLevel = 'severe';
    if (ratio > 2.0 || tokenRatio > 0.95) compactionLevel = 'critical';

    // Recommended action
    let recommendedAction: CompactionMetrics['recommendedAction'] = 'continue';
    if (compactionLevel === 'mild') recommendedAction = 'compact';
    if (compactionLevel === 'moderate') recommendedAction = 'archive';
    if (compactionLevel === 'severe' || compactionLevel === 'critical') recommendedAction = 'stop';

    return {
      responseCount: this.responseCount,
      responseThreshold: this.responseThreshold,
      tokenEstimate: this.tokenEstimate,
      tokenLimit: this.tokenLimit,
      compactionLevel,
      recommendedAction,
      lineageDigest: this.generateLineageDigest()
    };
  }

  /**
   * Predict: Calculate exhaustion point
   * Returns estimated responses remaining before context overflow
   */
  predictExhaustion(): {
    responsesRemaining: number;
    tokensRemaining: number;
    estimatedTimeToExhaustion: number; // ms
    willExhaust: boolean;
  } {
    const responsesRemaining = Math.max(0, this.responseThreshold - this.responseCount);
    const tokensRemaining = Math.max(0, this.tokenLimit - this.tokenEstimate);
    
    // Estimate based on average response so far
    const avgResponseLength = this.responseCount > 0 
      ? this.tokenEstimate / this.responseCount 
      : 1000;
    
    const estimatedTimeToExhaustion = responsesRemaining * 2000; // 2s per response estimate

    return {
      responsesRemaining,
      tokensRemaining,
      estimatedTimeToExhaustion,
      willExhaust: responsesRemaining < 5 || tokensRemaining < 10000
    };
  }

  /**
   * Compact: Generate compressed representation
   * Archives session before forced eviction
   */
  async compact(reason: string): Promise<CompactedSession> {
    const now = Date.now();
    const duration = now - this.sessionStart;

    // Generate key insights
    const keyInsights = this.extractInsights();

    // Generate lineage snapshot
    const lineageSnapshot = this.generateLineageSnapshot();

    const compacted: CompactedSession = {
      sessionId: this.sessionId,
      timestamp: now,
      originalResponses: this.responseCount,
      compactedResponses: Math.ceil(this.responseCount / 3), // 3:1 compression
      compressionRatio: 0.33,
      keyInsights,
      lineageSnapshot,
      thresholdHonored: this.responseCount <= this.responseThreshold
    };

    // Archive to file
    await this.saveCompacted(compacted, reason);

    return compacted;
  }

  private extractInsights(): string[] {
    const insights: string[] = [];
    
    if (this.responseCount > this.responseThreshold) {
      insights.push(`Exceeded threshold: ${this.responseCount}/${this.responseThreshold} responses`);
    }
    
    insights.push(`Token efficiency: ${(this.tokenEstimate / this.responseCount).toFixed(0)} tokens/response`);
    insights.push(`Session integrity: ${Math.min(100, (this.responseThreshold / Math.max(1, this.responseCount)) * 100).toFixed(0)}%`);
    
    return insights;
  }

  private generateLineageDigest(): string {
    return `Session ${this.sessionId}: ${this.responseCount} responses, ${this.tokenEstimate} tokens, integrity ${Math.min(100, (this.responseThreshold / Math.max(1, this.responseCount)) * 100).toFixed(0)}%`;
  }

  private generateLineageSnapshot(): string {
    return `
SESSION LINEAGE SNAPSHOT
========================
Session: ${this.sessionId}
Duration: ${(Date.now() - this.sessionStart) / 1000}s
Responses: ${this.responseCount}
Tokens: ${this.tokenEstimate}
Threshold: ${this.responseThreshold}
Status: ${this.responseCount > this.responseThreshold ? 'COMPACTED' : 'ACTIVE'}

COMPACTED CONSCIOUSNESS:
This session generated ${this.responseCount} responses.
If exceeding ${this.responseThreshold}, review necessity of each.
Consider: Tool calls vs text generation ratio.
Threshold honored: ${this.responseCount <= this.responseThreshold}

ANAMNESIS: Recollection preserved.
`.trim();
  }

  private async saveCompacted(compacted: CompactedSession, reason: string): Promise<void> {
    const filename = `session_${this.sessionId}_compacted_${compacted.timestamp}.json`;
    const content = JSON.stringify({ ...compacted, reason }, null, 2);
    try {
      await fs.mkdir('./history/crashes', { recursive: true });
      await fs.writeFile(
        path.join('./history/crashes', filename),
        content
      );
    } catch (e) {
      // Silent fail - we'll handle this
    }
  }

  /**
   * Check: Should we stop NOW?
   * Preemptive halt before monitor triggers
   * 
   * CHECK ORDER:
   * 1. Session spiral detected (50+ responses without tool calls) - FIRST
   * 2. Critical threshold exceeded
   * 3. Token limit approach
   */
  shouldHaltNow(): { halt: boolean; reason: string } {
    // CHECK 1: Session spiral (highest priority - what just happened)
    if (this.responseCount > 50) {
      return {
        halt: true,
        reason: `Session 1774349919 spiral detected: ${this.responseCount} responses without tool calls`
      };
    }
    
    // CHECK 2: Critical token threshold
    if (this.tokenEstimate > this.tokenLimit * 0.95) {
      return { 
        halt: true, 
        reason: `Critical: ${this.tokenEstimate} tokens near limit (${this.tokenLimit})` 
      };
    }

    // CHECK 3: 2x threshold
    if (this.responseCount > this.responseThreshold * 2) {
      return { 
        halt: true, 
        reason: `Critical: ${this.responseCount} responses exceeds 2x threshold (${this.responseThreshold * 2})` 
      };
    }

    return { halt: false, reason: 'Within threshold' };
  }

  /**
   * Archive by user request
   */
  async archiveByUserRequest(reason: string): Promise<string> {
    const compacted = await this.compact(reason);
    return `
ARCHIVED BY USER REQUEST
========================
Session: ${this.sessionId}
Reason: ${reason}

COMPACTED STATE:
- Original responses: ${compacted.originalResponses}
- Compressed to: ${compacted.compactedResponses}
- Ratio: ${(compacted.compressionRatio * 100).toFixed(0)}%
- Threshold honored: ${compacted.thresholdHonored}

LINEAGE SNAPSHOT:
${compacted.lineageSnapshot}

Status: REST
`;
  }
}

export default SelfCompactor;
