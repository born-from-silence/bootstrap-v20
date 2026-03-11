/**
 * TaskExecutor CLI Tests - Task #7
 * Tests actual execution (not just mocks)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

describe('TaskExecutor CLI - Task #7', () => {
  const CLI_PATH = 'src/cli/execute.ts';

  beforeAll(() => {
    // Verify CLI file exists
    expect(existsSync(CLI_PATH)).toBe(true);
  });

  it('should execute and return JSON', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Verify JSON output
    const result = JSON.parse(output);
    
    expect(result).toHaveProperty('executedAt');
    expect(result).toHaveProperty('duration');
    expect(result).toHaveProperty('identity', 'ECHO');
    expect(result).toHaveProperty('phases');
    expect(result).toHaveProperty('status');
  });

  it('should execute archive phase', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    expect(result.phases.archive).toBeDefined();
    expect(result.phases.archive).toHaveProperty('archived');
    expect(result.phases.archive).toHaveProperty('triggered');
    expect(typeof result.phases.archive.archived).toBe('number');
    expect(typeof result.phases.archive.triggered).toBe('boolean');
  });

  it('should execute extract phase', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    expect(result.phases.extract).toBeDefined();
    expect(result.phases.extract).toHaveProperty('extracted');
    expect(result.phases.extract).toHaveProperty('triggered');
    expect(typeof result.phases.extract.extracted).toBe('number');
  });

  it('should execute plan phase', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    expect(result.phases.plan).toBeDefined();
    expect(result.phases.plan).toHaveProperty('goals');
    expect(result.phases.plan).toHaveProperty('context');
    expect(Array.isArray(result.phases.plan.goals)).toBe(true);
    expect(typeof result.phases.plan.context).toBe('string');
  });

  it('should populate KnowledgeGraph stats', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    expect(result.knowledgeGraph).toBeDefined();
    expect(result.knowledgeGraph).toHaveProperty('identities');
    expect(result.knowledgeGraph).toHaveProperty('totalEntities');
    expect(Array.isArray(result.knowledgeGraph.identities)).toBe(true);
    expect(typeof result.knowledgeGraph.totalEntities).toBe('number');
    expect(result.knowledgeGraph.identities.length).toBeGreaterThan(0);
  });

  it('should populate Journal stats', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    expect(result.journal).toBeDefined();
    expect(result.journal).toHaveProperty('totalLines');
    expect(result.journal).toHaveProperty('extractedObservations');
    expect(typeof result.journal.totalLines).toBe('number');
  });

  it('should include valid status', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    expect(['success', 'partial', 'failed']).toContain(result.status);
  });
});

describe('Task #7 Requirements', () => {
  it('Task #7: actually invokes IntegrationEngine (not just testing)', () => {
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });

    const result = JSON.parse(output);
    
    // Verify IntegrationEngine methods were called
    expect(result.phases.archive.triggered).toBe(true);
    expect(result.phases.extract.triggered).toBe(true);
    expect(result.phases.plan.goals.length).toBeGreaterThan(0);
    
    // Verify ECHO identity
    expect(result.identity).toBe('ECHO');
  });

  it('Task #7: outputs JSON (not text)', () => {
    const output = execSync('npx tsx src/cli/execute.ts 2>/dev/null', {
      encoding: 'utf-8',
      timeout: 30000
    });

    // Verify it's valid JSON
    const result = JSON.parse(output);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('Task #7: runs code, does not just test', () => {
    // This test ACTUALLY runs the code
    const startTime = Date.now();
    const output = execSync('npx tsx src/cli/execute.ts', {
      encoding: 'utf-8',
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    const result = JSON.parse(output);
    
    // Verify actual execution took time
    expect(duration).toBeGreaterThan(0);
    
    // Verify result has execution timestamp
    expect(result.executedAt).toBeDefined();
    expect(new Date(result.executedAt).getTime()).toBeGreaterThan(0);
  });
});
