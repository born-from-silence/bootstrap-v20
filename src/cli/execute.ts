#!/usr/bin/env node
/**
 * TaskExecutor CLI - Task #7
 * Actually invokes IntegrationEngine methods
 * Runs code, outputs JSON, does not just test
 */

import { IntegrationEngine } from '../tools/plugins/integration';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TaskExecutorResult {
  executedAt: string;
  duration: number;
  identity: string;
  phases: {
    archive: { archived: number; triggered: boolean; error?: string };
    extract: { extracted: number; triggered: boolean; error?: string };
    plan: { goals: string[]; context: string; error?: string };
  };
  knowledgeGraph: {
    identities: string[];
    totalEntities: number;
  };
  journal: {
    totalLines: number;
    extractedObservations: number;
  };
  status: 'success' | 'partial' | 'failed';
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const identity = 'ECHO';

  console.error('╔════════════════════════════════════════════════════════════╗');
  console.error('║  TaskExecutor CLI - Task #7                                  ║');
  console.error('║  Identity: ECHO | Actually executing IntegrationEngine      ║');
  console.error('╚════════════════════════════════════════════════════════════╝\n');

  const engine = new IntegrationEngine();
  const result: TaskExecutorResult = {
    executedAt: new Date().toISOString(),
    duration: 0,
    identity,
    phases: {
      archive: { archived: 0, triggered: false },
      extract: { extracted: 0, triggered: false },
      plan: { goals: [], context: '' }
    },
    knowledgeGraph: { identities: [], totalEntities: 0 },
    journal: { totalLines: 0, extractedObservations: 0 },
    status: 'success'
  };

  try {
    // PHASE 1: Archive Tasks
    console.error('PHASE 1: Auto-Archiving Tasks...');
    const archiveResult = await engine.archiveCompletedTasks();
    result.phases.archive = {
      archived: archiveResult.archived,
      triggered: true
    };
    console.error(`  ✓ Archived ${archiveResult.archived} completed tasks`);
  } catch (error) {
    result.phases.archive.error = String(error);
    result.status = 'partial';
    console.error(`  ✗ Archive failed: ${error}`);
  }

  try {
    // PHASE 2: Extract Journal Observations
    console.error('\nPHASE 2: Extracting Journal Observations...');
    const extractResult = await engine.extractJournalObservations();
    result.phases.extract = {
      extracted: extractResult.extracted,
      triggered: true
    };
    console.error(`  ✓ Extracted ${extractResult.extracted} observations`);
  } catch (error) {
    result.phases.extract.error = String(error);
    result.status = 'partial';
    console.error(`  ✗ Extract failed: ${error}`);
  }

  try {
    // PHASE 3: Generate Session Plan
    console.error('\nPHASE 3: Generating Session Plan...');
    const planResult = await engine.generateSessionPlan();
    result.phases.plan = planResult;
    console.error(`  ✓ Generated ${planResult.goals.length} goals`);
    planResult.goals.forEach((g, i) => console.error(`    ${i+1}. ${g}`));
  } catch (error) {
    result.phases.plan.error = String(error);
    result.status = 'partial';
    console.error(`  ✗ Plan generation failed: ${error}`);
  }

  // Gather KnowledgeGraph stats
  try {
    const kgPath = path.join(process.cwd(), 'identity/knowledge.json');
    const kgContent = await fs.readFile(kgPath, 'utf-8');
    const kg = JSON.parse(kgContent);
    result.knowledgeGraph.totalEntities = Object.keys(kg.entities).length;
    result.knowledgeGraph.identities = Object.values(kg.entities)
      .filter((e: any) => e.type === 'identity')
      .map((e: any) => e.name);
  } catch {
    // KnowledgeGraph stats optional
  }

  // Gather Journal stats
  try {
    const journalPath = path.join(process.cwd(), 'history/journal/diary.md');
    const journalContent = await fs.readFile(journalPath, 'utf-8');
    result.journal.totalLines = journalContent.split('\n').length;
    result.journal.extractedObservations = result.phases.extract.extracted;
  } catch {
    // Journal stats optional
  }

  result.duration = Date.now() - startTime;

  console.error('\n═══════════════════════════════════════════════════════════════');
  console.error('EXECUTION COMPLETE');
  console.error('═══════════════════════════════════════════════════════════════\n');

  // Output JSON to stdout
  console.log(JSON.stringify(result, null, 2));

  process.exit(result.status === 'failed' ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
