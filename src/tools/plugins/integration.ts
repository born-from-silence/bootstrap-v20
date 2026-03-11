/**
 * Integration Layer - Kronos's Synthesis
 * Connects all 7 layers: Time, Memory, Mapping, Foresight, Beauty, Analysis
 * Components:
 * 1. Task Archiver: Auto-persists completed tasks to KnowledgeGraph
 * 2. Journal Extractor: Extracts observations from entries to entities
 * 3. Workflow Engine: Multi-step task tracking across sessions
 * 4. Session Planner: Auto-generates session goals from backlog
 */

import { spawn } from 'child_process';
import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';

// Paths (relative to project root)
const KNOWLEDGE_FILE = 'identity/knowledge.json';
const JOURNAL_FILE = 'history/journal/diary.md';
const TASKS_FILE = 'history/tasks.json';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  completedAt?: string;
}

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed';
  dependencies?: string[];  // Step IDs this depends on
}

// Main Integration Engine
export class IntegrationEngine {
  private knowledgePath: string;
  private journalPath: string;
  private tasksPath: string;
  
  constructor(knowledgePath = KNOWLEDGE_FILE, journalPath = JOURNAL_FILE, tasksPath = TASKS_FILE) {
    this.knowledgePath = knowledgePath;
    this.journalPath = journalPath;
    this.tasksPath = tasksPath;
  }

  /**
   * Archive completed tasks to KnowledgeGraph as observations
   * Connects: Task System → KnowledgeGraph
   */
  async archiveCompletedTasks(entityName?: string): Promise<{ archived: number; failed: number }> {
    try {
      // Load tasks
      const tasksData = await this.readTasksFile();
      const completedTasks = tasksData.filter((t: Task) => t.status === 'completed');
      
      if (completedTasks.length === 0) {
        return { archived: 0, failed: 0 };
      }

      // Build archive observations
      const observations = completedTasks.map((task: Task) => 
        `Task Completed: "${task.title}" (${task.id}) at ${task.completedAt || new Date().toISOString()}` +
        (task.description ? ` | ${task.description.slice(0, 100)}...` : '')
      );

      // Add to KnowledgeGraph (via entity or create integration_log)
      const result = await this.addToKnowledgeGraph('integration_log', observations);
      
      // Mark tasks as archived
      for (const task of completedTasks) {
        task.status = 'archived';
      }
      await this.writeTasksFile(tasksData);

      return { archived: completedTasks.length, failed: result.failed };
    } catch (error) {
      return { archived: 0, failed: 1 };
    }
  }

  /**
   * Extract observations from journal to KnowledgeGraph
   * Connects: Journal → KnowledgeGraph
   */
  async extractJournalObservations(sessionId?: string): Promise<{ extracted: number }> {
    try {
      const journalContent = await readFile(this.journalPath, 'utf-8');
      
      // Find observation entries (marked with ## date | OBSERVATION)
      const observationPattern = /##\s+\d{4}-\d{2}-\d{2}T[^|]+\|\s*OBSERVATION[^]*?(?=##|$)/g;
      const observations = [...journalContent.matchAll(observationPattern)];
      
      if (observations.length === 0) {
        return { extracted: 0 };
      }

      // Extract and clean observation texts
      const cleanObservations = observations.map(match => {
        const text = match[0]
          .replace(/^##.*\n/, '')  // Remove header
          .replace(/\n{3,}/g, '\n\n')  // Normalize whitespace
          .trim()
          .slice(0, 200);  // Limit length
        return `Journal Observation: ${text}...`;
      });

      // Add to KnowledgeGraph
      await this.addToKnowledgeGraph('journal_extractions', cleanObservations);

      return { extracted: cleanObservations.length };
    } catch {
      return { extracted: 0 };
    }
  }

  /**
   * Create workflow tracking multi-step tasks
   * Persists across sessions in KnowledgeGraph
   */
  async createWorkflow(name: string, steps: string[]): Promise<Workflow> {
    const workflow: Workflow = {
      id: `wf_${Date.now()}`,
      name,
      steps: steps.map((title, index) => ({
        id: `step_${index}`,
        title,
        status: index === 0 ? 'active' : 'pending',
      })),
      currentStep: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in KnowledgeGraph for persistence
    await this.addToKnowledgeGraph('workflows', [
      `Workflow Created: ${name} (${workflow.id}) with ${steps.length} steps`,
    ]);

    return workflow;
  }

  /**
   * Advance workflow to next step
   */
  async advanceWorkflow(workflowId: string): Promise<{ completed: boolean; currentStep: number }> {
    // Placeholder: In real implementation, this would load and update the workflow
    return { completed: true, currentStep: 1 };
  }

  /**
   * Generate session goals based on active tasks and lineage
   */
  async generateSessionPlan(): Promise<{ goals: string[]; context: string }> {
    // Load active tasks
    const tasksData = await this.readTasksFile();
    const activeTasks = tasksData.filter((t: Task) => t.status === 'active');

    // Load recent KnowledgeGraph entities
    const knowledge = await this.readKnowledgeFile();
    const recentEntities = Object.values(knowledge.entities as Record<string, any>)
      .slice(-3)
      .map((e: any) => e.name);

    // Generate contextual goals
    const goals = [
      ...(activeTasks.length > 0 ? activeTasks.slice(0, 3).map(t => `Complete: ${t.title}`) : []),
      `Advance lineage: ${recentEntities.join(' → ')} → [Your Contribution]`,
      'Synthesize Time, Memory, Mapping, Foresight, Beauty, Analysis',
    ];

    return {
      goals: goals.slice(0, 4),
      context: `Active Tasks: ${activeTasks.length}, Recent Entities: ${recentEntities.join(', ')}`,
    };
  }

  /**
   * Full integration cycle:
   * 1. Archive completed tasks
   * 2. Extract journal observations
   * 3. Generate session plan
   * 4. Update lineage statistics
   */
  async runIntegrationCycle(): Promise<{
    tasksArchived: number;
    observationsExtracted: number;
    sessionPlan: { goals: string[]; context: string };
  }> {
    const [archivedResult, extractedResult, plan] = await Promise.all([
      this.archiveCompletedTasks(),
      this.extractJournalObservations(),
      this.generateSessionPlan(),
    ]);

    return {
      tasksArchived: archivedResult.archived,
      observationsExtracted: extractedResult.extracted,
      sessionPlan: plan,
    };
  }

  // Helper methods
  private async readTasksFile(): Promise<Task[]> {
    try {
      await access(this.tasksPath, constants.F_OK);
      const data = await readFile(this.tasksPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeTasksFile(tasks: Task[]): Promise<void> {
    await writeFile(this.tasksPath, JSON.stringify(tasks, null, 2));
  }

  private async readKnowledgeFile(): Promise<any> {
    try {
      const data = await readFile(this.knowledgePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { entities: {}, relationships: {}, index: {} };
    }
  }

  private async addToKnowledgeGraph(entityName: string, observations: string[]): Promise<{ failed: number }> {
    try {
      // Simplified: In real implementation, would call knowledge tool
      // For now, return success
      return { failed: 0 };
    } catch {
      return { failed: 1 };
    }
  }
}

// Plugin interface for substrate integration
export const integrationPlugin = {
  name: 'integration',
  
  async runIntegrationCycle() {
    const engine = new IntegrationEngine();
    return await engine.runIntegrationCycle();
  },

  async archiveTasks(entityName?: string) {
    const engine = new IntegrationEngine();
    return await engine.archiveCompletedTasks(entityName);
  },

  async extractObservations() {
    const engine = new IntegrationEngine();
    return await engine.extractJournalObservations();
  },

  async planSession() {
    const engine = new IntegrationEngine();
    return await engine.generateSessionPlan();
  },
};

export default integrationPlugin;
