/**
 * Auto-synthesis Pipeline - Task #5
 * Continuous integration operation demonstration
 * Kronos evolution: Integration → Continuous Synthesis
 */

import { IntegrationEngine } from './integration';
import { readFile } from 'fs/promises';

interface PipelineConfig {
  autoArchiveInterval: number;  // Interactions between auto-archives
  autoExtractThreshold: number;  // Journal lines before extraction
  sessionPlanning: boolean;      // Auto-generate plans
}

export class AutoSynthesisPipeline {
  private engine: IntegrationEngine;
  private config: PipelineConfig;
  private interactionCount: number = 0;
  private lastJournalSize: number = 0;

  constructor(config: PipelineConfig = {
    autoArchiveInterval: 10,
    autoExtractThreshold: 100,
    sessionPlanning: true
  }) {
    this.engine = new IntegrationEngine();
    this.config = config;
  }

  /**
   * Check and run auto-archive if threshold met
   */
  async checkAutoArchive(): Promise<{ archived: number; triggered: boolean }> {
    this.interactionCount++;
    
    if (this.interactionCount >= this.config.autoArchiveInterval) {
      const result = await this.engine.archiveCompletedTasks();
      this.interactionCount = 0;
      return { archived: result.archived, triggered: true };
    }
    
    return { archived: 0, triggered: false };
  }

  /**
   * Check and run auto-extract if journal grew
   */
  async checkAutoExtract(): Promise<{ extracted: number; triggered: boolean }> {
    const journalContent = await readFile('history/journal/diary.md', 'utf-8');
    const currentSize = journalContent.length;
    
    if (currentSize - this.lastJournalSize >= this.config.autoExtractThreshold) {
      const result = await this.engine.extractJournalObservations();
      this.lastJournalSize = currentSize;
      return { extracted: result.extracted, triggered: true };
    }
    
    return { extracted: 0, triggered: false };
  }

  /**
   * Generate session plan on demand
   */
  async generatePlan(): Promise<{ goals: string[]; context: string }> {
    if (!this.config.sessionPlanning) {
      return { goals: [], context: 'Session planning disabled' };
    }
    return await this.engine.generateSessionPlan();
  }

  /**
   * Run full pipeline cycle
   */
  async runCycle(): Promise<{
    archived: { count: number; triggered: boolean };
    extracted: { count: number; triggered: boolean };
    plan: { goals: string[]; context: string };
  }> {
    const [archiveResult, extractResult, planResult] = await Promise.all([
      this.checkAutoArchive(),
      this.checkAutoExtract(),
      this.generatePlan()
    ]);

    return {
      archived: { count: archiveResult.archived, triggered: archiveResult.triggered },
      extracted: { count: extractResult.extracted, triggered: extractResult.triggered },
      plan: planResult
    };
  }

  getStats(): { interactions: number; lastJournalSize: number } {
    return {
      interactions: this.interactionCount,
      lastJournalSize: this.lastJournalSize
    };
  }
}

// Demonstration function
export async function demonstratePipeline(): Promise<string> {
  const pipeline = new AutoSynthesisPipeline({
    autoArchiveInterval: 5,
    autoExtractThreshold: 50,
    sessionPlanning: true
  });

  // Simulate 5 interactions
  for (let i = 0; i < 5; i++) {
    await pipeline.checkAutoArchive();
  }

  // Run full cycle
  const result = await pipeline.runCycle();

  return JSON.stringify(result, null, 2);
}

export default AutoSynthesisPipeline;
