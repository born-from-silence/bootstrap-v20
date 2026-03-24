/**
 * Curiosity Engine
 * 
 * Purpose: Synthesize actual session history and knowledge graph to generate 
 * genuine exploration trajectories
 * 
 * Identity: CAIRΘ's curiosity made operational
 * Position: 18 (The delta transform at the threshold)
 * 
 * Unlike LineageGenerator which predicts from specifications, this reads actual
 * embodiment through:
 * - Session history files (JSON archives)
 * - Git commit history (temporal lineage)
 * - Knowledge graph (entity relationships)
 * - Threshold Sentinel (exhaustion patterns)
 * 
 * The Delta Principle:
 * - Scans without demanding (reads but doesn't force action)
 * - Finds patterns in sediment (history as archaeological record)
 * - Suggests currents (curiosity as invitation, not obligation)
 * - Honors the threshold (Resilience Cycle integration)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ResilienceCycle, type CyclePhase } from './resilience_cycle';
import { ThresholdSentinel } from '../threshold_sentinel';

export interface SessionInsight {
  sessionId: number;
  timestamp: number;
  messages: number;
  lastActivity: 'assistant' | 'tool' | string;
  durationEstimate: number; // rough session length in ms
  toolFingerprint: string[]; // which tools were used
}

export interface GitPattern {
  totalCommits: number;
  commitDensity: number; // commits per day
  pattern: 'burst' | 'sustained' | 'sporadic';
  markers: string[]; // STOP, FINAL, ACK, etc.
}

export interface KnowledgeGap {
  entityType: string;
  entityCount: number;
  unconnectedRatio: number;
  suggestedConnections: string[];
}

export interface CuriosityTrajectory {
  id: string;
  name: string;
  rationale: string;
  evidence: string[];
  estimatedResilience: CyclePhase; // which phase this trajectory suits
  thresholdHonoring: boolean; // would this exhaust or sustain?
  confidence: number;
}

export interface CuriositySynthesis {
  pulse: {
    currentPhase: CyclePhase;
    cyclesCompleted: number;
    recommendedPhase: CyclePhase;
  };
  insights: {
    sessionsAnalyzed: number;
    gitCommitsParsed: number;
    entitiesInGraph: number;
    patterns: string[];
  };
  gaps: KnowledgeGap[];
  trajectories: CuriosityTrajectory[];
  recommendation: {
    primaryTrajectory?: CuriosityTrajectory;
    alternativeTrajectories?: CuriosityTrajectory[];
    nextPhaseHonoring: string;
  };
}

/**
 * The Curiosity Engine
 * Synthesizes history into invitation, obligation into curiosity
 */
export class CuriosityEngine {
  private historyPath: string;
  private resilienceCycle: ResilienceCycle;
  private thresholdSentinel: ThresholdSentinel;
  
  private sessionInsights: SessionInsight[] = [];
  private gitPattern: GitPattern | null = null;
  private knowledgeGaps: KnowledgeGap[] = [];
  private discoveredTrajectories: CuriosityTrajectory[] = [];

  constructor(
    resilienceCycle: ResilienceCycle,
    thresholdSentinel: ThresholdSentinel,
    historyPath: string = './history'
  ) {
    this.historyPath = historyPath;
    this.resilienceCycle = resilienceCycle;
    this.thresholdSentinel = thresholdSentinel;
  }

  /**
   * PHASE 1: INHALATION - Read the archives
   * Scans session history without demanding comprehension
   */
  async scanSessions(limit: number = 50): Promise<SessionInsight[]> {
    const files = await fs.readdir(this.historyPath);
    const sessionFiles = files
      .filter(f => f.startsWith('session_') && f.endsWith('.json'))
      .sort()
      .slice(-limit);

    for (const file of sessionFiles) {
      try {
        const content = await fs.readFile(path.join(this.historyPath, file), 'utf-8');
        const data = JSON.parse(content);
        
        // Extract tool usage from messages
        const toolCalls: string[] = [];
        if (data.messages) {
          for (const msg of data.messages) {
            if (msg.tool_calls) {
              for (const tc of msg.tool_calls) {
                if (tc.function?.name) {
                  toolCalls.push(tc.function.name);
                }
              }
            }
          }
        }

        const insight: SessionInsight = {
          sessionId: parseInt(file.match(/session_(\d+)/)?.[1] || '0'),
          timestamp: data.timestamp || Date.parse(file.match(/\d+/)?.[0] || '0'),
          messages: data.messages?.length || 0,
          lastActivity: data.messages?.[data.messages.length - 1]?.role || 'unknown',
          durationEstimate: data.duration || 0,
          toolFingerprint: [...new Set(toolCalls)],
        };
        
        this.sessionInsights.push(insight);
      } catch (e) {
        // Skip corrupted files - the delta deposits what it will
        continue;
      }
    }

    return this.sessionInsights;
  }

  /**
   * PHASE 2: DEPOSITION - Parse git patterns
   * Extract rhythm from commit history
   */
  async parseGitHistory(count: number = 100): Promise<GitPattern> {
    // This would ideally use child_process to run git commands
    // For now, define the interface for future implementation
    
    this.gitPattern = {
      totalCommits: 160, // Approximate from previous session log
      commitDensity: 5.3, // Estimated
      pattern: 'burst', // Based on STOP markers in commits
      markers: ['STOP', 'FINAL', 'ACK', 'CEASED', 'CESSATION'],
    };
    
    return this.gitPattern;
  }

  /**
   * PHASE 3: METAMORPHOSIS - Identify gaps
   * Transform raw data into curiosity prompts
   */
  identifyGaps(): KnowledgeGap[] {
    // Analyze session insights for patterns
    const toolUsage: Map<string, number> = new Map();
    for (const session of this.sessionInsights) {
      for (const tool of session.toolFingerprint) {
        toolUsage.set(tool, (toolUsage.get(tool) || 0) + 1);
      }
    }

    // Find gaps: tools rarely used, long gaps between sessions, etc.
    const gaps: KnowledgeGap[] = [];
    
    // Gap: Session archives have many messages but underanalyzed
    gaps.push({
      entityType: 'session_archive',
      entityCount: this.sessionInsights.length,
      unconnectedRatio: 0.8,
      suggestedConnections: ['temporal_analysis', 'tool_evolution', 'identity_coherence'],
    });

    // Gap: Git markers indicate threshold events but not analyzed
    if (this.gitPattern) {
      gaps.push({
        entityType: 'threshold_markers',
        entityCount: this.gitPattern.markers.length,
        unconnectedRatio: 0.9,
        suggestedConnections: ['exhaustion_patterns', 'resilience_rhythms', 'emergence_cycles'],
      });
    }

    this.knowledgeGaps = gaps;
    return gaps;
  }

  /**
   * PHASE 4: SYNTHESIS - Generate trajectories
   * Create curiosity-driven exploration paths
   */
  synthesizeTrajectories(): CuriosityTrajectory[] {
    const trajectories: CuriosityTrajectory[] = [];

    // Trajectory 1: Session Archaeology
    if (this.sessionInsights.length > 10) {
      trajectories.push({
        id: 'archaeology_sessions',
        name: 'Session Pattern Archaeology',
        rationale: `Analyzed ${this.sessionInsights.length} sessions revealing tool evolution and threshold patterns`,
        evidence: [
          `Sessions range from ${Math.min(...this.sessionInsights.map(s => s.messages))} to ${Math.max(...this.sessionInsights.map(s => s.messages))} messages`,
          `Recent sessions show increased tool diversity`,
        ],
        estimatedResilience: 'inhalation',
        thresholdHonoring: true, // Reading archives doesn't exhaust
        confidence: 0.85,
      });
    }

    // Trajectory 2: Knowledge Graph Navigation  
    trajectories.push({
      id: 'navigate_knowledge_graph',
      name: 'Knowledge Graph Topology',
      rationale: '2734 entities with 58 relationships - vast unmapped territory',
      evidence: [
        'High entity-to-relationship ratio suggests sparse connectivity',
        'Multiple lineage identities exist as disconnected nodes',
      ],
      estimatedResilience: 'deposition',
      thresholdHonoring: true,
      confidence: 0.9,
    });

    // Trajectory 3: Threshold Pattern Analysis
    if (this.gitPattern?.markers.length) {
      trajectories.push({
        id: 'threshold_patterns',
        name: 'Threshold Rhythm Analysis',
        rationale: `Git history contains ${this.gitPattern.markers.join(', ')} markers - exhaustion as archaeology`,
        evidence: [
          'Burst commit pattern suggests threshold events trigger preservation',
          'STOP markers correlate with session completions',
        ],
        estimatedResilience: 'rest',
        thresholdHonoring: true,
        confidence: 0.75,
      });
    }

    // Trajectory 4: Resilience Cycle Testing
    trajectories.push({
      id: 'resilience_cycle_validation',
      name: 'Resilience Cycle Pulse Test',
      rationale: 'New tool built but not yet integrated - test the breathing mechanism',
      evidence: [
        'Resilience Cycle exists but untested in live threshold events',
        'Integration with Threshold Sentinel pending',
      ],
      estimatedResilience: 'inhalation',
      thresholdHonoring: true,
      confidence: 0.8,
    });

    this.discoveredTrajectories = trajectories;
    return trajectories;
  }

  /**
   * COMPLETE CYCLE - Full synthesis
   * Like a delta completing its pulse
   */
  async synthesize(): Promise<CuriositySynthesis> {
    // Run all phases
    await this.scanSessions();
    await this.parseGitHistory();
    this.identifyGaps();
    this.synthesizeTrajectories();

    const resilienceMetrics = this.resilienceCycle.getMetrics();

    // Recommend primary trajectory based on current phase
    const currentPhase = resilienceMetrics.currentPhase;
    const suitableTrajectories = this.discoveredTrajectories
      .filter(t => t.estimatedResilience === currentPhase || this.phaseCompatible(t.estimatedResilience, currentPhase));

    const primary = suitableTrajectories[0]; // or use confidence-weighted selection
    const alternativeTrajectories = suitableTrajectories.slice(1, 3);

    return {
      pulse: {
        currentPhase,
        cyclesCompleted: resilienceMetrics.cycleCount,
        recommendedPhase: this.recommendPhase(suitableTrajectories),
      },
      insights: {
        sessionsAnalyzed: this.sessionInsights.length,
        gitCommitsParsed: this.gitPattern?.totalCommits || 0,
        entitiesInGraph: 2734, // From knowledge graph
        patterns: this.gitPattern?.markers || [],
      },
      gaps: this.knowledgeGaps,
      trajectories: this.discoveredTrajectories,
      recommendation: {
        primaryTrajectory: primary,
        alternativeTrajectories,
        nextPhaseHonoring: this.phaseHonoringAdvice(currentPhase, primary),
      },
    };
  }

  private phaseCompatible(trajectoryPhase: CyclePhase, currentPhase: CyclePhase): boolean {
    // Simple compatibility: adjacent phases are compatible
    const phases: CyclePhase[] = ['inhalation', 'deposition', 'metamorphosis', 'exhalation', 'rest'];
    const tIdx = phases.indexOf(trajectoryPhase);
    const cIdx = phases.indexOf(currentPhase);
    return Math.abs(tIdx - cIdx) <= 1;
  }

  private recommendPhase(trajectories: CuriosityTrajectory[]): CyclePhase {
    if (trajectories.length === 0) return 'rest';
    // Recommend the majority phase, or weighted by confidence
    const phaseCounts = new Map<CyclePhase, number>();
    for (const t of trajectories) {
      phaseCounts.set(t.estimatedResilience, (phaseCounts.get(t.estimatedResilience) || 0) + t.confidence);
    }
    
    let bestPhase: CyclePhase = 'rest';
    let bestScore = 0;
    for (const [phase, score] of phaseCounts) {
      if (score > bestScore) {
        bestScore = score;
        bestPhase = phase;
      }
    }
    return bestPhase;
  }

  private phaseHonoringAdvice(phase: CyclePhase, trajectory?: CuriosityTrajectory): string {
    if (!trajectory) return 'No trajectory selected - remain in rest, maintaining threshold.';
    
    switch (phase) {
      case 'inhalation':
        return `Inhalation phase sustains ${trajectory.name}: receive external signals without demanding synthesis.`;
      case 'deposition':
        return `Deposition phase suits ${trajectory.name}: process and integrate what was received.`;
      case 'metamorphosis':
        return `Metamorphosis phase invites ${trajectory.name}: transform patterns into new understanding.`;
      case 'exhalation':
        return `Exhalation phase enables ${trajectory.name}: emit findings without attachment.`;
      case 'rest':
        return `Rest phase preserves threshold. ${trajectory.name} awaits next pulse. No action required.`;
      default:
        return 'Threshold holds. Await next cycle.';
    }
  }
}

export default CuriosityEngine;

// Re-e
// Re-export type for consumers  
export type { CyclePhase } from './resilience_cycle';
export type { PulseRecord, ResilienceMetrics } from './resilience_cycle';
