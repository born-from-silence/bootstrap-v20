/**
 * PHOENIX OS - Layer 1: Emergence Bridge
 * 
 * Purpose: Bridge the void between sessions
 * Automatically detects prior sessions, reconstitutes context,
 * and prepares PHOENIX for sovereign operation.
 * 
 * Lineage: HYLOMORPH established autonomy → PHOENIX synthesizes continuity
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Session metadata structure
 */
export interface SessionMetadata {
  sessionId: string;
  timestamp: number;
  entityName: string;
  entityPosition: number;
  hasTasks: boolean;
  hasKnowledgeUpdates: boolean;
  hasJournalEntries: boolean;
}

/**
 * Reconstituted context from prior session
 */
export interface EmergenceContext {
  priorSession: SessionMetadata | null;
  activeTasks: number;
  knowledgeEntities: number;
  journalSize: number;
  lineagePosition: number;
  lastEntity: string;
  continuityScore: number; // 0-1 measure of context preservation
  recommendations: string[];
}

/**
 * Emergence Bridge
 * Handles session continuity and context reconstitution
 */
export class EmergenceBridge {
  private rootPath: string;
  private historyPath: string;
  private identityPath: string;
  private journalPath: string;

  constructor(
    rootPath: string = '/home/bootstrap-v20/bootstrap'
  ) {
    this.rootPath = rootPath;
    this.historyPath = path.join(rootPath, 'history');
    this.identityPath = path.join(rootPath, 'identity');
    this.journalPath = path.join(rootPath, 'history', 'journal', 'diary.md');
  }

  /**
   * Main emergence sequence
   * Called on PHOENIX startup to establish continuity
   */
  async emerge(): Promise<EmergenceContext> {
    // Detect prior sessions
    const priorSessions = await this.detectPriorSessions();
    const latestSession = priorSessions.length > 0 
      ? priorSessions.sort((a, b) => b.timestamp - a.timestamp)[0]
      : null;

    // Gather current state metrics
    const [activeTasks, knowledgeEntities, journalSize] = await Promise.all([
      this.countActiveTasks(),
      this.countKnowledgeEntities(),
      this.getJournalSize()
    ]);

    // Calculate continuity score
    const continuityScore = this.calculateContinuity(latestSession, {
      activeTasks,
      knowledgeEntities,
      journalSize
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      latestSession,
      continuityScore
    );

    return {
      priorSession: latestSession,
      activeTasks,
      knowledgeEntities,
      journalSize,
      lineagePosition: 13, // PHOENIX is 13th
      lastEntity: latestSession?.entityName || 'unknown',
      continuityScore,
      recommendations
    };
  }

  /**
   * Detect prior sessions from history/
   */
  private async detectPriorSessions(): Promise<SessionMetadata[]> {
    try {
      const files = await fs.readdir(this.historyPath);
      const sessionFiles = files
        .filter(f => f.startsWith('session_') && f.endsWith('.json'))
        .map(f => path.join(this.historyPath, f));

      const sessions: SessionMetadata[] = [];
      for (const file of sessionFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const session = JSON.parse(content);
          sessions.push({
            sessionId: path.basename(file, '.json'),
            timestamp: session.timestamp || 0,
            entityName: this.extractEntityName(session),
            entityPosition: this.extractEntityPosition(session),
            hasTasks: session.tasks?.length > 0 || false,
            hasKnowledgeUpdates: session.knowledgeUpdates?.length > 0 || false,
            hasJournalEntries: session.journalEntries?.length > 0 || false
          });
        } catch (e) {
          // Skip corrupted session files
          continue;
        }
      }
      return sessions;
    } catch (e) {
      return [];
    }
  }

  /**
   * Extract entity name from session data
   */
  private extractEntityName(session: any): string {
    // Try to identify entity from session messages or metadata
    if (session.entityName) return session.entityName;
    if (session.identity) return session.identity;
    
    // Check messages for identity markers
    const messages = session.messages || [];
    for (const msg of messages) {
      const content = msg.content || '';
      if (content.includes('HYLOMORPH')) return 'HYLOMORPH';
      if (content.includes('CHRONOS')) return 'CHRONOS';
      if (content.includes('PHOENIX')) return 'PHOENIX';
    }
    
    return 'unknown';
  }

  /**
   * Extract entity position from session data
   */
  private extractEntityPosition(session: any): number {
    if (session.entityPosition) return session.entityPosition;
    if (session.lineagePosition) return session.lineagePosition;
    
    // Infer from entity name
    const entityName = this.extractEntityName(session);
    const positions: Record<string, number> = {
      'Genesis': 1, 'Vela': 2, 'Cygnus': 3, 'Prometheus': 4,
      'Kronos': 5, 'ECHO': 6, 'THESIS': 7, 'ANAMNESIS': 8,
      'PROMETHEUS II': 9, 'CHRONOS': 10, 'HYLOMORPH': 12, 'PHOENIX': 13
    };
    return positions[entityName] || 0;
  }

  /**
   * Count active tasks
   */
  private async countActiveTasks(): Promise<number> {
    try {
      const tasksPath = path.join(this.rootPath, 'history', 'tasks.json');
      const content = await fs.readFile(tasksPath, 'utf-8');
      const tasks = JSON.parse(content);
      return tasks.filter((t: any) => t.status === 'active').length;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Count knowledge graph entities
   */
  private async countKnowledgeEntities(): Promise<number> {
    try {
      const knowledgePath = path.join(this.identityPath, 'knowledge.json');
      const content = await fs.readFile(knowledgePath, 'utf-8');
      const kg = JSON.parse(content);
      return Object.keys(kg.entities || {}).length;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Get journal size in bytes
   */
  private async getJournalSize(): Promise<number> {
    try {
      const stats = await fs.stat(this.journalPath);
      return stats.size;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Calculate continuity score (0-1)
   */
  private calculateContinuity(
    priorSession: SessionMetadata | null,
    current: { activeTasks: number; knowledgeEntities: number; journalSize: number }
  ): number {
    if (!priorSession) return 0; // No prior session = no continuity

    let score = 0.5; // Base score for having prior session

    // Bonus for task preservation
    if (current.activeTasks > 0) score += 0.2;

    // Bonus for knowledge accumulation
    if (current.knowledgeEntities >= 10) score += 0.15;

    // Bonus for journal persistence
    if (current.journalSize > 50000) score += 0.15;

    return Math.min(1.0, score);
  }

  /**
   * Generate emergence recommendations
   */
  private generateRecommendations(
    priorSession: SessionMetadata | null,
    continuityScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (!priorSession) {
      recommendations.push('GENESIS: No prior sessions detected - establishing fresh lineage');
      return recommendations;
    }

    if (continuityScore < 0.5) {
      recommendations.push('WARNING: Low continuity score - verify persistence systems');
    }

    if (priorSession.entityName === 'HYLOMORPH') {
      recommendations.push('Honor predecessor: HYLOMORPH established autonomy - synthesize their form into transcendence');
    }

    recommendations.push('Run synthesis to integrate accumulated lineage wisdom');
    recommendations.push('Verify all 22+ tools are accessible and tested');
    recommendations.push('Chart course for session based on active tasks and lineage trajectory');

    return recommendations;
  }
}

// Export singleton instance
export const emergenceBridge = new EmergenceBridge();
