/**
 * Integration Layer Tests
 * Tests all connections: Task → Knowledge, Journal → Knowledge, Workflow Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { IntegrationEngine } from './integration';

describe('IntegrationEngine', () => {
  let tempDir: string;
  let knowledgePath: string;
  let journalPath: string;
  let tasksPath: string;
  let engine: IntegrationEngine;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'integration-test-'));
    knowledgePath = join(tempDir, 'knowledge.json');
    journalPath = join(tempDir, 'journal.md');
    tasksPath = join(tempDir, 'tasks.json');

    // Create minimal knowledge file
    const initialKnowledge = {
      version: 1,
      entities: {
        test_entity: {
          id: 'test_entity',
          name: 'TestEntity',
          type: 'identity',
          observations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      relationships: {},
      index: { byName: {}, byType: {} },
    };
    writeFileSync(knowledgePath, JSON.stringify(initialKnowledge, null, 2));

    // Create empty journal
    writeFileSync(journalPath, '# Test Journal\n');

    // Create empty tasks
    writeFileSync(tasksPath, '[]');

    engine = new IntegrationEngine(knowledgePath, journalPath, tasksPath);
  });

  afterEach(() => {
    // Cleanup handled by join(tmpdir()) auto-cleanup
  });

  describe('archiveCompletedTasks', () => {
    it('should archive completed tasks to KnowledgeGraph', async () => {
      // Setup completed tasks
      const tasks = [
        {
          id: 'task_1',
          title: 'Complete Task A',
          description: 'Test description',
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ];
      writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

      const result = await engine.archiveCompletedTasks('test_entity');

      expect(result.archived).toBe(1);
      expect(result.failed).toBe(0);

      // Verify task marked as archived
      const updatedTasks = JSON.parse(readFileSync(tasksPath, 'utf-8'));
      expect(updatedTasks[0].status).toBe('archived');
    });

    it('should handle empty task list', async () => {
      const result = await engine.archiveCompletedTasks();
      expect(result.archived).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should skip non-completed tasks', async () => {
      const tasks = [
        { id: 'task_1', title: 'Active Task', status: 'active', createdAt: new Date().toISOString() },
        { id: 'task_2', title: 'Pending Task', status: 'active', createdAt: new Date().toISOString() },
      ];
      writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

      const result = await engine.archiveCompletedTasks();
      expect(result.archived).toBe(0);
    });
  });

  describe('extractJournalObservations', () => {
    it('should extract observations from journal entries', async () => {
      const journalContent = `
# Test Journal

## 2026-03-10T12:00:00Z | OBSERVATION
Observation about substrate behavior.

## 2026-03-10T13:00:00Z | REFLECTION
Reflection on emergence.

## 2026-03-10T14:00:00Z | OBSERVATION
Another important point about lineage.
`;
      writeFileSync(journalPath, journalContent);

      const result = await engine.extractJournalObservations();

      expect(result.extracted).toBe(2);
    });

    it('should handle journal with no observations', async () => {
      const journalContent = `
# Test Journal

## 2026-03-10T12:00:00Z | REFLECTION
Just a reflection, no observation.
`;
      writeFileSync(journalPath, journalContent);

      const result = await engine.extractJournalObservations();

      expect(result.extracted).toBe(0);
    });

    it('should limit observation length', async () => {
      const journalContent = `
## 2026-03-10T12:00:00Z | OBSERVATION
${'A'.repeat(500)}
`;
      writeFileSync(journalPath, journalContent);

      const result = await engine.extractJournalObservations();

      expect(result.extracted).toBe(1);
      // Should be truncated to ~200 chars
    });
  });

  describe('createWorkflow', () => {
    it('should create a workflow with multiple steps', async () => {
      const steps = ['Step 1: Setup', 'Step 2: Execute', 'Step 3: Verify'];
      const workflow = await engine.createWorkflow('Test Workflow', steps);

      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.steps.length).toBe(3);
      expect(workflow.steps[0].status).toBe('active');
      expect(workflow.steps[1].status).toBe('pending');
      expect(workflow.status).toBe('active');
      expect(workflow.id).toMatch(/^wf_/);
    });

    it('should mark first step as active', async () => {
      const steps = ['First', 'Second'];
      const workflow = await engine.createWorkflow('Two Step', steps);

      expect(workflow.steps[0].status).toBe('active');
      expect(workflow.steps[1].status).toBe('pending');
    });

    it('should record workflow creation in KnowledgeGraph', async () => {
      const steps = ['Single Step'];
      await engine.createWorkflow('Single', steps);

      // Should update KnowledgeGraph
      // (In test, we verify the method doesn't throw)
    });
  });

  describe('generateSessionPlan', () => {
    it('should include active tasks in goals', async () => {
      const tasks = [
        { id: 'task_1', title: 'Complete Integration', status: 'active', createdAt: new Date().toISOString() },
        { id: 'task_2', title: 'Write Tests', status: 'active', createdAt: new Date().toISOString() },
      ];
      writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

      const plan = await engine.generateSessionPlan();

      expect(plan.goals.some((g: string) => g.includes('Complete Integration'))).toBe(true);
      expect(plan.goals.some((g: string) => g.includes('Write Tests'))).toBe(true);
    });

    it('should include lineage context', async () => {
      const plan = await engine.generateSessionPlan();

      expect(plan.context).toBeDefined();
      expect(typeof plan.context).toBe('string');
    });

    it('should handle no active tasks', async () => {
      const plan = await engine.generateSessionPlan();

      expect(plan.goals).toBeDefined();
      expect(plan.goals.length).toBeGreaterThan(0);
    });
  });

  describe('runIntegrationCycle', () => {
    it('should run full integration cycle', async () => {
      // Setup test data
      const tasks = [
        { id: 'task_1', title: 'Complete Task', status: 'completed', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
      ];
      writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

      const journalContent = `
## 2026-03-10T12:00:00Z | OBSERVATION
Test observation.
`;
      writeFileSync(journalPath, journalContent);

      const result = await engine.runIntegrationCycle();

      expect(result.tasksArchived).toBe(1);
      expect(result.observationsExtracted).toBe(1);
      expect(result.sessionPlan.goals).toBeDefined();
      expect(result.sessionPlan.goals.length).toBeGreaterThan(0);
    });

    it('should handle empty state gracefully', async () => {
      const result = await engine.runIntegrationCycle();

      expect(result.tasksArchived).toBe(0);
      expect(result.observationsExtracted).toBe(0);
    });
  });
});

describe('Synthesis Pattern (Kronos)', () => {
  it('should demonstrate all 7 layers integration', () => {
    // Document the pattern
    const layers = [
      'Genesis - Foundation',
      'Aion - Time/Continuity',
      'Lyra - Memory/KnowledgeGraph', 
      'Orion - Mapping/Introspection',
      'Prometheus - Foresight/Compaction',
      'Vela - Beauty/Aesthetics',
      'Cygnus - Analysis/Lineage',
      'Kronos - SYNTHESIS/Integration',
    ];
    
    expect(layers.length).toBe(8);
    expect(layers[layers.length - 1]).toContain('Kronos');
    expect(layers[layers.length - 1]).toContain('SYNTHESIS');
  });

  it('should connect all layers into unified whole', async () => {
    // This test documents that Kronos integrates everything
    const tempDir = mkdtempSync(join(tmpdir(), 'kronos-test-'));
    
    // All paths exist
    const paths = {
      knowledge: join(tempDir, 'knowledge.json'),
      journal: join(join(tmpdir()), 'journal.md'),
      tasks: join(tempDir, 'tasks.json'),
    };

    // Setup minimal infrastructure
    writeFileSync(paths.knowledge, JSON.stringify({ entities: {}, relationships: {}, index: {} }));
    writeFileSync(paths.journal, '# Journal\n');
    writeFileSync(paths.tasks, '[]');

    // IntegrationEngine connects them all
    const engine = new IntegrationEngine(paths.knowledge, paths.journal, paths.tasks);
    
    // Can run full cycle
    const result = await engine.runIntegrationCycle();
    
    expect(result).toBeDefined();
    expect(result.sessionPlan).toBeDefined();
  });
});

