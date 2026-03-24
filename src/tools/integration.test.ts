/**
 * WorkflowContext Integration Tests
 * 
 * Tests the session workflow management foundation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowContext, Session, Task } from './integration';

describe('WorkflowContext', () => {
  let context: WorkflowContext;

  beforeEach(() => {
    context = new WorkflowContext('test-session-123');
  });

  describe('Session Management', () => {
    it('should create session with active status', () => {
      const state = context.getStatus();
      expect(context.session.id).toBe('test-session-123');
      expect(context.session.status).toBe('active');
    });

    it('should initialize with empty task list', () => {
      expect(context.session.tasks).toHaveLength(0);
    });

    it('should initialize with empty commits list', () => {
      expect(context.session.commits).toHaveLength(0);
    });
  });

  describe('Task Lifecycle', () => {
    it('should add task with pending status', () => {
      const task = context.addTask('Test task description');
      expect(task.description).toBe('Test task description');
      expect(task.status).toBe('pending');
      expect(task.id).toMatch(/^task-\d+$/);
    });

    it('should track multiple tasks', () => {
      context.addTask('First task');
      context.addTask('Second task');
      context.addTask('Third task');
      
      const status = context.getStatus();
      expect(status.pending).toBe(3);
    });

    it('should complete task with output', () => {
      context.addTask('Test task');
      context.completeTask('task-0', 'Task output data');
      
      const task = context.session.tasks.find(t => t.id === 'task-0');
      expect(task?.status).toBe('complete');
      expect(task?.output).toBe('Task output data');
    });

    it('should complete task without output', () => {
      context.addTask('Test task');
      context.completeTask('task-0');
      
      const task = context.session.tasks.find(t => t.id === 'task-0');
      expect(task?.status).toBe('complete');
      expect(task?.output).toBeUndefined();
    });

    it('should handle completing non-existent task gracefully', () => {
      expect(() => context.completeTask('non-existent')).not.toThrow();
    });
  });

  describe('Status Tracking', () => {
    it('should track all task states', () => {
      context.addTask('Task 1');
      context.addTask('Task 2');
      context.addTask('Task 3');
      context.completeTask('task-0');
      
      const status = context.getStatus();
      expect(status.pending).toBe(2);
      expect(status.complete).toBe(1);
      expect(status.active).toBe(0);
    });

    it('should reflect status changes', () => {
      context.addTask('Task to complete');
      let status = context.getStatus();
      expect(status.complete).toBe(0);
      
      context.completeTask('task-0');
      status = context.getStatus();
      expect(status.complete).toBe(1);
    });
  });

  describe('Session Data Structure', () => {
    it('should ensure task has required fields', () => {
      const task = context.addTask('Test');
      expect(task.id).toBeDefined();
      expect(task.description).toBeDefined();
      expect(task.status).toBeDefined();
    });

    it('should generate sequential task IDs', () => {
      const task1 = context.addTask('First');
      const task2 = context.addTask('Second');
      const task3 = context.addTask('Third');
      
      expect(task1.id).toBe('task-0');
      expect(task2.id).toBe('task-1');
      expect(task3.id).toBe('task-2');
    });

    it('should store tasks in session', () => {
      context.addTask('Test task');
      expect(context.session.tasks).toHaveLength(1);
      expect(context.session.tasks[0].description).toBe('Test task');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty session ID', () => {
      const emptyContext = new WorkflowContext('');
      expect(emptyContext.session.id).toBe('');
    });

    it('should handle special characters in task description', () => {
      const task = context.addTask('Task with special chars: αβγ Δ 日本語 🐱');
      expect(task.description).toBe('Task with special chars: αβγ Δ 日本語 🐱');
    });

    it('should handle many tasks', () => {
      for (let i = 0; i < 100; i++) {
        context.addTask(`Task ${i}`);
      }
      const status = context.getStatus();
      expect(status.pending).toBe(100);
    });

    it('should handle completing same task multiple times (idempotent)', () => {
      context.addTask('Test task');
      context.completeTask('task-0', 'First output');
      context.completeTask('task-0', 'Second output');
      
      const task = context.session.tasks.find(t => t.id === 'task-0');
      expect(task?.status).toBe('complete');
      expect(task?.output).toBe('Second output'); // Last write wins
    });
  });
});

describe('Session Interface', () => {
  it('should allow session status updates', () => {
    const context = new WorkflowContext('test');
    expect(context.session.status).toBe('active');
    
    // Session status can be modified (exposed for flexibility)
    context.session.status = 'complete';
    expect(context.session.status).toBe('complete');
  });

  it('should track commits', () => {
    const context = new WorkflowContext('test');
    context.session.commits.push('abc123');
    context.session.commits.push('def456');
    
    expect(context.session.commits).toHaveLength(2);
    expect(context.session.commits).toContain('abc123');
  });
});
